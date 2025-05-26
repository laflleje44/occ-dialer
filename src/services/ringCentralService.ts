
import { supabase } from '@/integrations/supabase/client';

export interface RingCentralConfig {
  clientId: string;
  clientSecret: string;
  serverUrl: string;
  username: string;
  extension: string;
  password: string;
  jwtToken: string;
  fromNumber: string;
}

export const makeCall = async (toNumber: string, fromNumber?: string): Promise<void> => {
  try {
    console.log('Initiating call to:', toNumber, 'from:', fromNumber);
    
    // Get user-specific caller number if not provided
    let callerNumber = fromNumber;
    if (!callerNumber) {
      const { data: userSettings } = await supabase
        .from('user_ringcentral_settings')
        .select('caller_number')
        .maybeSingle();
      
      callerNumber = userSettings?.caller_number;
    }
    
    const { data, error } = await supabase.functions.invoke('ringcentral-make-call', {
      body: { 
        toNumber,
        fromNumber: callerNumber
      }
    });

    if (error) {
      console.error('Error calling edge function:', error);
      throw new Error(`Failed to initiate call: ${error.message}`);
    }

    if (!data.success) {
      console.error('Call failed:', data.error);
      throw new Error(data.error || 'Call failed');
    }

    console.log('Call initiated successfully:', data);
  } catch (error) {
    console.error('Error making call:', error);
    throw error;
  }
};

export const getRingCentralConfig = async (): Promise<RingCentralConfig> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-ringcentral-config');
    
    if (error) {
      throw new Error(`Failed to get RingCentral config: ${error.message}`);
    }
    
    return data as RingCentralConfig;
  } catch (error) {
    console.error('Error getting RingCentral config:', error);
    throw error;
  }
};
