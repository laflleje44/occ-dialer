
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const config = {
      clientId: Deno.env.get('RINGCENTRAL_CLIENT_ID'),
      clientSecret: Deno.env.get('RINGCENTRAL_CLIENT_SECRET'),
      serverUrl: Deno.env.get('RINGCENTRAL_SERVER_URL') || 'https://platform.ringcentral.com',
      username: Deno.env.get('RINGCENTRAL_USERNAME'),
      extension: Deno.env.get('RINGCENTRAL_EXTENSION'),
      password: Deno.env.get('RINGCENTRAL_PASSWORD'),
      fromNumber: Deno.env.get('RINGCENTRAL_RINGOUT_CALLER')
    };

    if (!config.clientId || !config.clientSecret) {
      throw new Error('RingCentral credentials not configured');
    }

    return new Response(
      JSON.stringify(config),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
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
