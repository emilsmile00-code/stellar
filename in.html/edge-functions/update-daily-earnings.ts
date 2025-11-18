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

    const today = new Date().toISOString().split('T')[0];
    
    // Get today's conversions and earnings
    const { data: conversions, error: convError } = await supabase
      .from('conversions')
      .select('amount, status, network_paid')
      .gte('created_at', today + 'T00:00:00')
      .lte('created_at', today + 'T23:59:59')

    if (convError) throw convError;

    // Calculate totals
    const totalEarned = conversions?.reduce((sum, conv) => sum + parseFloat(conv.amount), 0) || 0;
    const pendingAmount = conversions?.filter(c => !c.network_paid).reduce((sum, conv) => sum + parseFloat(conv.amount), 0) || 0;
    const availableAmount = conversions?.filter(c => c.network_paid).reduce((sum, conv) => sum + parseFloat(conv.amount), 0) || 0;

    // Get total balances from user_balances
    const { data: balances, error: balError } = await supabase
      .from('user_balances')
      .select('available_balance, pending_balance')

    if (balError) throw balError;

    const totalAvailable = balances?.reduce((sum, bal) => sum + parseFloat(bal.available_balance), 0) || 0;
    const totalPending = balances?.reduce((sum, bal) => sum + parseFloat(bal.pending_balance), 0) || 0;

    // Create daily earnings record
    const dailyEarnings = {
      earnings_date: today,
      total_earned: totalEarned,
      pending_balance: totalPending,
      available_balance: totalAvailable,
      conversion_count: conversions?.length || 0
    };

    const { error: insertError } = await supabase
      .from('daily_earnings')
      .upsert(dailyEarnings, { onConflict: 'earnings_date' })

    if (insertError) throw insertError;

    return new Response(JSON.stringify({
      message: `Daily earnings updated for ${today}`,
      daily_earnings: dailyEarnings
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Daily earnings error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})