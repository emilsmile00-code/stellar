// ==============================================
// PAYOUT REVIEW FUNCTION
// Admin function to review and approve/reject payouts
// ==============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user and verify admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!adminUser) {
      throw new Error('Unauthorized: Admin access required')
    }

    const body = await req.json()
    const { payout_id, action, rejection_reason, admin_notes } = body

    console.log(`📋 Reviewing payout ${payout_id}: ${action}`)

    // Get payout request
    const { data: payout, error: payoutError } = await supabase
      .from('payout_requests')
      .select('*, user_id')
      .eq('id', payout_id)
      .single()

    if (payoutError || !payout) {
      throw new Error('Payout request not found')
    }

    if (payout.status !== 'pending') {
      throw new Error('Payout request already processed')
    }

    // Get user's conversions for fraud analysis
    const { data: conversions } = await supabase
      .from('conversions')
      .select('*')
      .eq('user_id', payout.user_id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    const verifiedConversions = conversions?.filter(c => c.network_paid && !c.is_suspicious) || []
    const suspiciousConversions = conversions?.filter(c => c.is_suspicious) || []
    const unpaidConversions = conversions?.filter(c => !c.network_paid) || []

    const fraudCheckResults = {
      total_conversions: conversions?.length || 0,
      verified_count: verifiedConversions.length,
      suspicious_count: suspiciousConversions.length,
      unpaid_by_network_count: unpaidConversions.length,
      verified_amount: verifiedConversions.reduce((sum, c) => sum + parseFloat(c.amount), 0),
      suspicious_flags: suspiciousConversions.map(c => ({
        conversion_id: c.id,
        fraud_score: c.fraud_score,
        fraud_flags: c.fraud_flags
      }))
    }

    console.log('🔍 Fraud check results:', fraudCheckResults)

    // Update payout request
    const updates: any = {
      status: action,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      admin_notes,
      fraud_check_results: fraudCheckResults,
      suspicious_conversions_count: suspiciousConversions.length,
      verified_conversions_count: verifiedConversions.length
    }

    if (action === 'rejected') {
      updates.rejection_reason = rejection_reason
    }

    const { error: updateError } = await supabase
      .from('payout_requests')
      .update(updates)
      .eq('id', payout_id)

    if (updateError) {
      throw updateError
    }

    // If approved, deduct from user's available balance
    if (action === 'approved') {
      const { data: balance } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', payout.user_id)
        .single()

      if (balance) {
        const newBalance = Math.max(0, parseFloat(balance.available_balance) - parseFloat(payout.amount_requested))
        
        await supabase
          .from('user_balances')
          .update({
            available_balance: newBalance.toFixed(2),
            total_withdrawn: (parseFloat(balance.total_withdrawn) + parseFloat(payout.amount_requested)).toFixed(2)
          })
          .eq('user_id', payout.user_id)

        // Mark conversions as paid to user
        await supabase
          .from('conversions')
          .update({
            user_paid: true,
            paid_to_user_at: new Date().toISOString()
          })
          .eq('user_id', payout.user_id)
          .eq('network_paid', true)
          .eq('user_paid', false)

        console.log('✅ User balance updated and conversions marked as paid')
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        payout_id,
        action,
        fraud_check_results: fraudCheckResults
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Review payout error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})