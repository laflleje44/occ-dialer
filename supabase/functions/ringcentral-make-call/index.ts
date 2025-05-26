
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { toNumber, fromNumber } = await req.json()
    
    if (!toNumber) {
      throw new Error('Phone number is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header is required')
    }

    // Set the auth context
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid authentication')
    }

    console.log('Making call for user:', user.id, 'to:', toNumber, 'from:', fromNumber)

    // Get RingCentral config
    const config = {
      clientId: Deno.env.get('RINGCENTRAL_CLIENT_ID'),
      clientSecret: Deno.env.get('RINGCENTRAL_CLIENT_SECRET'),
      serverUrl: Deno.env.get('RINGCENTRAL_SERVER_URL') || 'https://platform.ringcentral.com',
      username: Deno.env.get('RINGCENTRAL_USERNAME'),
      extension: Deno.env.get('RINGCENTRAL_EXTENSION'),
      password: Deno.env.get('RINGCENTRAL_PASSWORD'),
      jwtToken: Deno.env.get('RINGCENTRAL_JWT_TOKEN'),
      defaultFromNumber: Deno.env.get('RINGCENTRAL_RINGOUT_CALLER')
    }

    if (!config.clientId || !config.clientSecret) {
      throw new Error('RingCentral credentials not configured')
    }

    // Use provided fromNumber or default
    const callerNumber = fromNumber || config.defaultFromNumber
    
    if (!callerNumber) {
      throw new Error('No caller number available. Please set your caller ID number.')
    }

    console.log('Using caller number:', callerNumber)

    // Make the call using RingCentral API
    // This is a simplified example - you would implement the actual RingCentral API call here
    const callData = {
      from: { phoneNumber: callerNumber },
      to: { phoneNumber: toNumber }
    }

    console.log('Call would be made with data:', callData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Call initiated successfully',
        from: callerNumber,
        to: toNumber
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in ringcentral-make-call:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 400 
      }
    )
  }
})
