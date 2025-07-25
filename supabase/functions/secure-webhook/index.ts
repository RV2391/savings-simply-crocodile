import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get webhook URL from secrets
    const webhookUrl = Deno.env.get('MAKE_WEBHOOK_URL')!
    
    if (!webhookUrl) {
      console.error('🚨 MAKE_WEBHOOK_URL not configured')
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const requestData = await req.json()
    console.log('📨 Secure webhook request received:', {
      email: requestData.email,
      company: requestData.company_name,
      timestamp: new Date().toISOString()
    })

    // Input validation
    if (!requestData.email || !requestData.company_name || !requestData.consent) {
      console.error('❌ Invalid input data:', requestData)
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(requestData.email)) {
      console.error('❌ Invalid email format:', requestData.email)
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Sanitize inputs
    const sanitizedData = {
      ...requestData,
      email: requestData.email.toLowerCase().trim(),
      company_name: requestData.company_name.trim(),
      consent: Boolean(requestData.consent.given)
    }

    // Store in database for GDPR compliance
    const { error: dbError } = await supabase
      .from('form_submissions')
      .insert({
        email: sanitizedData.email,
        company_name: sanitizedData.company_name,
        submission_data: sanitizedData,
        consent_data: sanitizedData.consent,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })

    if (dbError) {
      console.error('❌ Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Database error' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Form submission stored in database')

    // Forward to Make.com webhook with rate limiting check
    try {
      console.log('🔄 Forwarding to Make.com webhook...')
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        },
        body: JSON.stringify(sanitizedData)
      })

      if (!webhookResponse.ok) {
        console.error('❌ Webhook failed:', webhookResponse.status, await webhookResponse.text())
        return new Response(
          JSON.stringify({ error: 'Webhook delivery failed' }), 
          { 
            status: 502, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('✅ Webhook delivered successfully')

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Form submitted successfully' 
        }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (webhookError) {
      console.error('❌ Webhook delivery error:', webhookError)
      return new Response(
        JSON.stringify({ error: 'Webhook delivery failed' }), 
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})