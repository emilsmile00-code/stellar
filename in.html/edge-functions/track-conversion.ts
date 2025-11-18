// ==============================================
// TRACK CONVERSION FUNCTION
// Records user conversions and runs fraud checks
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

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const body = await req.json()
    console.log('📊 Tracking conversion:', body)

    const {
      offer_id,
      offer_title,
      network,
      category,
      amount,
      click_id,
      sub_id,
      transaction_id,
      ip_address,
      user_agent,
      country,
      device,
      fingerprint,
      referrer,
      action // 'click' or 'complete'
    } = body

    // Create conversion record
    const conversionData = {
      user_id: user.id,
      offer_id,
      offer_title,
      network,
      category,
      amount: parseFloat(amount) || 0,
      click_id,
      sub_id,
      transaction_id,
      ip_address,
      user_agent,
      country,
      device,
      fingerprint,
      referrer,
      status: action === 'complete' ? 'completed' : 'pending',
      clicked_at: new Date().toISOString(),
      completed_at: action === 'complete' ? new Date().toISOString() : null
    }

    const { data: conversion, error: conversionError } = await supabase
      .from('conversions')
      .insert(conversionData)
      .select()
      .single()

    if (conversionError) {
      throw conversionError
    }

    console.log('✅ Conversion tracked:', conversion.id)

    // Log traffic
    await supabase
      .from('user_traffic_logs')
      .insert({
        user_id: user.id,
        ip_address,
        user_agent,
        country,
        device,
        fingerprint,
        action: action === 'complete' ? 'offer_complete' : 'offer_click',
        action_data: { conversion_id: conversion.id, offer_id, network },
        page_url: req.headers.get('referer') || '',
        referrer
      })

    // Run fraud checks if completed
    if (action === 'complete') {
      const fraudChecks = await runFraudChecks(supabase, user.id, conversion, {
        ip_address,
        fingerprint,
        user_agent
      })

      console.log('🔍 Fraud check results:', fraudChecks)

      // Update conversion with fraud score
      await supabase
        .from('conversions')
        .update({
          fraud_score: fraudChecks.score,
          fraud_flags: fraudChecks.flags,
          is_suspicious: fraudChecks.is_suspicious
        })
        .eq('id', conversion.id)

      // Update user balance (pending if suspicious, otherwise pending until network confirms)
      if (!fraudChecks.is_suspicious) {
        await updateUserBalance(supabase, user.id, parseFloat(amount) || 0, 'pending')
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        conversion_id: conversion.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Track conversion error:', error)
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

// ==============================================
// FRAUD DETECTION FUNCTIONS
// ==============================================

async function runFraudChecks(supabase: any, userId: string, conversion: any, trafficData: any) {
  const flags: string[] = []
  let score = 0

  // Get active fraud rules
  const { data: rules } = await supabase
    .from('fraud_rules')
    .select('*')
    .eq('is_active', true)

  if (!rules) {
    return { score: 0, flags: [], is_suspicious: false }
  }

  for (const rule of rules) {
    switch (rule.rule_type) {
      case 'ip_duplicate':
        const ipCheck = await checkIPDuplicate(supabase, userId, trafficData.ip_address, rule.parameters)
        if (ipCheck.flagged) {
          flags.push(`IP Duplicate: ${ipCheck.count} conversions from same IP`)
          score += rule.severity
        }
        break

      case 'velocity_check':
        const velocityCheck = await checkVelocity(supabase, userId, rule.parameters)
        if (velocityCheck.flagged) {
          flags.push(`Velocity: ${velocityCheck.count} conversions in short time`)
          score += rule.severity
        }
        break

      case 'device_fingerprint':
        if (trafficData.fingerprint) {
          const fingerprintCheck = await checkFingerprint(supabase, userId, trafficData.fingerprint, rule.parameters)
          if (fingerprintCheck.flagged) {
            flags.push(`Device: ${fingerprintCheck.count} conversions from same device`)
            score += rule.severity
          }
        }
        break

      case 'user_agent':
        const uaCheck = checkUserAgent(trafficData.user_agent, rule.parameters)
        if (uaCheck.flagged) {
          flags.push('Suspicious User Agent detected')
          score += rule.severity
        }
        break
    }
  }

  return {
    score,
    flags,
    is_suspicious: score >= 15 // Threshold for suspicious activity
  }
}

async function checkIPDuplicate(supabase: any, userId: string, ipAddress: string, params: any) {
  const timeWindow = params.max_conversions_per_ip || 5
  const hours = params.time_window_hours || 24

  const { data, error } = await supabase
    .from('conversions')
    .select('id')
    .eq('user_id', userId)
    .eq('ip_address', ipAddress)
    .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())

  const count = data?.length || 0
  return {
    flagged: count >= timeWindow,
    count
  }
}

async function checkVelocity(supabase: any, userId: string, params: any) {
  const maxPerHour = params.max_conversions_per_hour || 10

  const { data, error } = await supabase
    .from('conversions')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

  const count = data?.length || 0
  return {
    flagged: count >= maxPerHour,
    count
  }
}

async function checkFingerprint(supabase: any, userId: string, fingerprint: string, params: any) {
  const maxConversions = params.max_conversions_per_fingerprint || 3
  const hours = params.time_window_hours || 24

  const { data, error } = await supabase
    .from('conversions')
    .select('id')
    .eq('user_id', userId)
    .eq('fingerprint', fingerprint)
    .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())

  const count = data?.length || 0
  return {
    flagged: count >= maxConversions,
    count
  }
}

function checkUserAgent(userAgent: string, params: any) {
  const blockedPatterns = params.blocked_patterns || ['bot', 'crawler', 'spider']
  const ua = (userAgent || '').toLowerCase()
  
  for (const pattern of blockedPatterns) {
    if (ua.includes(pattern.toLowerCase())) {
      return { flagged: true }
    }
  }
  
  return { flagged: false }
}

async function updateUserBalance(supabase: any, userId: string, amount: number, type: 'pending' | 'available') {
  const { data: balance } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (balance) {
    const updates: any = {
      total_earned: (parseFloat(balance.total_earned) + amount).toFixed(2)
    }

    if (type === 'pending') {
      updates.pending_balance = (parseFloat(balance.pending_balance) + amount).toFixed(2)
    } else {
      updates.available_balance = (parseFloat(balance.available_balance) + amount).toFixed(2)
    }

    await supabase
      .from('user_balances')
      .update(updates)
      .eq('user_id', userId)
  } else {
    // Create initial balance
    await supabase
      .from('user_balances')
      .insert({
        user_id: userId,
        available_balance: type === 'available' ? amount : 0,
        pending_balance: type === 'pending' ? amount : 0,
        total_earned: amount
      })
  }
}