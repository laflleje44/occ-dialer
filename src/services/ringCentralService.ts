
import RingCentral from '@ringcentral/sdk';
import { supabase } from '@/integrations/supabase/client';

class RingCentralService {
  private sdk: any = null;
  private platform: any = null;
  private webPhone: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Get credentials from Supabase secrets
      const { data: secrets } = await supabase.functions.invoke('get-secrets', {
        body: { 
          secrets: ['RINGCENTRAL_CLIENT_ID', 'RINGCENTRAL_CLIENT_SECRET', 'RINGCENTRAL_SERVER_URL'] 
        }
      });

      if (!secrets || !secrets.RINGCENTRAL_CLIENT_ID) {
        throw new Error('Ring Central credentials not found');
      }

      this.sdk = new RingCentral({
        clientId: secrets.RINGCENTRAL_CLIENT_ID,
        clientSecret: secrets.RINGCENTRAL_CLIENT_SECRET,
        server: secrets.RINGCENTRAL_SERVER_URL || 'https://platform.devtest.ringcentral.com'
      });

      this.platform = this.sdk.platform();
      this.isInitialized = true;
      console.log('Ring Central SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Ring Central SDK:', error);
      throw error;
    }
  }

  async authenticate(username: string, password: string, extension?: string) {
    try {
      await this.initialize();
      
      await this.platform.login({
        username,
        password,
        extension
      });

      console.log('Ring Central authentication successful');
      return true;
    } catch (error) {
      console.error('Ring Central authentication failed:', error);
      throw error;
    }
  }

  async makeCall(phoneNumber: string) {
    try {
      if (!this.platform || !this.platform.loggedIn()) {
        throw new Error('Not authenticated with Ring Central');
      }

      // Clean phone number
      const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
      
      console.log(`Initiating call to ${cleanNumber}`);

      const response = await this.platform.post('/restapi/v1.0/account/~/extension/~/ring-out', {
        from: { phoneNumber: 'main' }, // Use main company number
        to: { phoneNumber: cleanNumber },
        playPrompt: false
      });

      const callData = await response.json();
      console.log('Call initiated successfully:', callData);
      
      return {
        success: true,
        callId: callData.id,
        status: callData.status.callStatus
      };
    } catch (error) {
      console.error('Failed to make call:', error);
      throw error;
    }
  }

  async getCallStatus(callId: string) {
    try {
      const response = await this.platform.get(`/restapi/v1.0/account/~/extension/~/ring-out/${callId}`);
      const callData = await response.json();
      return callData.status.callStatus;
    } catch (error) {
      console.error('Failed to get call status:', error);
      throw error;
    }
  }

  isAuthenticated() {
    return this.platform && this.platform.loggedIn();
  }

  async logout() {
    if (this.platform) {
      await this.platform.logout();
    }
  }
}

export const ringCentralService = new RingCentralService();
