import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if today is Friday (5 = Friday)
    const today = new Date();
    if (today.getDay() !== 5) {
      return new Response(JSON.stringify({ message: 'Not Friday, skipping payouts' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate last week (Monday to Sunday)
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - 7 - today.getDay() + 1); // Go to previous Monday
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6); // Sunday is 6 days after Monday

    // Format dates for database
    const weekStart = lastMonday.toISOString().split('T')[0];
    const weekEnd = lastSunday.toISOString().split('T')[0];
    const payoutDate = today.toISOString().split('T')[0];

    console.log(`📅 Processing week ${weekStart} to ${weekEnd} for payout on ${payoutDate}`);

    // Find eligible users with last week's earnings
    const { data: eligibleUsers, error } = await supabase
      .from('user_balances')
      .select(`
        user_id,
        available_balance,
        payout_method,
        payout_address,
        first_activity_date,
        auth_users:user_id(email)
      `)
      .gte('available_balance', 5.00)
      .lte('first_activity_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .eq('keep_balance', false)
      .not('payout_address', 'is', null)

    if (error) throw error;

    console.log(`📊 Found ${eligibleUsers?.length || 0} eligible users for payout`);

    // Create weekly payout record
    const weeklyPayout = {
      week_start: weekStart,
      week_end: weekEnd,
      payout_date: payoutDate,
      total_amount: eligibleUsers?.reduce((sum, user) => sum + parseFloat(user.available_balance), 0) || 0,
      user_count: eligibleUsers?.length || 0,
      status: 'processing'
    };

    const { data: payoutRecord, error: payoutError } = await supabase
      .from('weekly_payouts')
      .insert(weeklyPayout)
      .select()
      .single();

    if (payoutError) throw payoutError;

    // Process each eligible user
    const payouts = [];
    for (const user of eligibleUsers || []) {
      const payoutData = {
        user_id: user.user_id,
        payout_date: payoutDate,
        amount: user.available_balance,
        payout_method: user.payout_method,
        payout_address: user.payout_address,
        status: 'processing',
        weekly_payout_id: payoutRecord.id
      };

      // Create payout record
      const { data: payout, error: userPayoutError } = await supabase
        .from('payout_schedules')
        .insert(payoutData)
        .select()
        .single();

      if (!userPayoutError && payout) {
        payouts.push(payout);
        
        // Reset user's available balance to zero
        await supabase
          .from('user_balances')
          .update({ 
            available_balance: 0,
            total_withdrawn: supabase.rpc('increment', { x: user.available_balance })
          })
          .eq('user_id', user.user_id);
      }
    }

    // Update weekly payout as completed
    await supabase
      .from('weekly_payouts')
      .update({ status: 'completed' })
      .eq('id', payoutRecord.id);

    return new Response(JSON.stringify({
      message: `Processed ${payouts.length} payouts for week ${weekStart} to ${weekEnd}`,
      weekly_payout: weeklyPayout,
      payouts: payouts.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Payout error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})