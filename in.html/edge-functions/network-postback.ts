// ==============================================
// NETWORK POSTBACK HANDLER
// Receives postbacks from affiliate networks
// ==============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get query parameters
    const url = new URL(req.url)
    const network = url.searchParams.get('network')?.toLowerCase()
    
    console.log(`📨 Postback received from network: ${network}`)
    console.log('Query params:', Object.fromEntries(url.searchParams))

    if (!network) {
      return new Response(
        JSON.stringify({ error: 'Network parameter required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse postback data based on network
    let postbackData: any = {}
    
    if (network === 'ogads') {
      // OGAds postback format
      postbackData = {
        network: 'ogads',
        offer_id: url.searchParams.get('offer_id') || url.searchParams.get('offerid'),
        transaction_id: url.searchParams.get('transaction_id') || url.searchParams.get('txid'),
        amount: parseFloat(url.searchParams.get('amount') || url.searchParams.get('payout') || '0'),
        status: url.searchParams.get('status') || 'completed',
        user_id: url.searchParams.get('user_id') || url.searchParams.get('aff_sub'),
        sub_id: url.searchParams.get('aff_sub') || url.searchParams.get('sub_id'),
        click_id: url.searchParams.get('aff_click_id') || url.searchParams.get('click_id'),
        event_type: url.searchParams.get('event') || 'conversion',
        raw_data: Object.fromEntries(url.searchParams)
      }
    } else if (network === 'cpalead') {
      // CPAlead postback format
      postbackData = {
        network: 'cpalead',
        offer_id: url.searchParams.get('offer_id') || url.searchParams.get('campaign_id'),
        transaction_id: url.searchParams.get('transaction_id') || url.searchParams.get('txid'),
        amount: parseFloat(url.searchParams.get('amount') || url.searchParams.get('payout') || '0'),
        status: url.searchParams.get('status') || 'completed',
        user_id: url.searchParams.get('subid') || url.searchParams.get('sub_id'),
        sub_id: url.searchParams.get('subid') || url.searchParams.get('sub_id'),
        click_id: url.searchParams.get('click_id'),
        event_type: url.searchParams.get('event_type') || 'conversion',
        raw_data: Object.fromEntries(url.searchParams)
      }
    } else if (network === 'topofferzz') {
      // TopOfferzz postback format
      postbackData = {
        network: 'topofferzz',
        offer_id: url.searchParams.get('o') || url.searchParams.get('offer_id'),
        transaction_id: url.searchParams.get('transaction_id') || url.searchParams.get('txid'),
        amount: parseFloat(url.searchParams.get('amount') || url.searchParams.get('payout') || '0'),
        status: url.searchParams.get('status') || 'completed',
        user_id: url.searchParams.get('sub_aff_id') || url.searchParams.get('aff_click_id'),
        sub_id: url.searchParams.get('sub_aff_id'),
        click_id: url.searchParams.get('aff_click_id'),
        event_type: url.searchParams.get('event') || 'conversion',
        raw_data: Object.fromEntries(url.searchParams)
      }
    } else {
      // Generic format
      postbackData = {
        network: network,
        offer_id: url.searchParams.get('offer_id'),
        transaction_id: url.searchParams.get('transaction_id') || url.searchParams.get('txid'),
        amount: parseFloat(url.searchParams.get('amount') || url.searchParams.get('payout') || '0'),
        status: url.searchParams.get('status') || 'completed',
        user_id: url.searchParams.get('user_id'),
        sub_id: url.searchParams.get('sub_id'),
        click_id: url.searchParams.get('click_id'),
        event_type: url.searchParams.get('event') || 'conversion',
        raw_data: Object.fromEntries(url.searchParams)
      }
    }

    console.log('📦 Parsed postback data:', postbackData)

    // Store the postback
    const { data: postback, error: postbackError } = await supabase
      .from('network_postbacks')
      .insert(postbackData)
      .select()
      .single()

    if (postbackError) {
      console.error('❌ Error storing postback:', postbackError)
      throw postbackError
    }

    console.log('✅ Postback stored:', postback.id)

    // Try to match with existing conversion
    const { data: conversion, error: conversionError } = await supabase
      .from('conversions')
      .select('*')
      .or(`transaction_id.eq.${postbackData.transaction_id},click_id.eq.${postbackData.click_id},sub_id.eq.${postbackData.sub_id}`)
      .eq('network', postbackData.network)
      .single()

    if (!conversionError && conversion) {
      console.log('🎯 Matched conversion:', conversion.id)
      
      // Update conversion with network payment confirmation
      const { error: updateError } = await supabase
        .from('conversions')
        .update({
          network_paid: true,
          network_transaction_id: postbackData.transaction_id,
          network_postback_received_at: new Date().toISOString(),
          status: postbackData.status === 'reversed' ? 'reversed' : 'completed',
          amount: postbackData.amount || conversion.amount
        })
        .eq('id', conversion.id)

      if (!updateError) {
        // Update postback as processed
        await supabase
          .from('network_postbacks')
          .update({
            processed: true,
            matched_conversion_id: conversion.id,
            processed_at: new Date().toISOString()
          })
          .eq('id', postback.id)

        console.log('✅ Conversion updated with network payment')

        // Update user pending balance to available balance
        if (postbackData.status !== 'reversed') {
          const { data: balance } = await supabase
            .from('user_balances')
            .select('*')
            .eq('user_id', conversion.user_id)
            .single()

          if (balance) {
            await supabase
              .from('user_balances')
              .update({
                available_balance: (parseFloat(balance.available_balance) + parseFloat(conversion.amount)).toFixed(2),
                pending_balance: Math.max(0, parseFloat(balance.pending_balance) - parseFloat(conversion.amount)).toFixed(2)
              })
              .eq('user_id', conversion.user_id)

            console.log('💰 User balance updated')
          }
        }
      } else {
        console.error('❌ Error updating conversion:', updateError)
      }
    } else {
      console.log('⚠️ No matching conversion found')
      await supabase
        .from('network_postbacks')
        .update({
          processing_notes: 'No matching conversion found'
        })
        .eq('id', postback.id)
    }

    // Return success to network
    return new Response('OK', {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('❌ Postback handler error:', error)
    
    // Still return 200 to network to prevent retries
    return new Response('OK', {
      status: 200,
      headers: corsHeaders
    })
  }
})