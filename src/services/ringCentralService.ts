
import { supabase } from '@/integrations/supabase/client';

interface RingCentralCredentials {
  RINGCENTRAL_CLIENT_ID: string;
  RINGCENTRAL_CLIENT_SECRET: string;
  RINGCENTRAL_SERVER_URL: string;
}

class RingCentralService {
  private credentials: RingCentralCredentials | null = null;
  private accessToken: string | null = null;
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

      this.credentials = {
        RINGCENTRAL_CLIENT_ID: secrets.RINGCENTRAL_CLIENT_ID,
        RINGCENTRAL_CLIENT_SECRET: secrets.RINGCENTRAL_CLIENT_SECRET,
        RINGCENTRAL_SERVER_URL: secrets.RINGCENTRAL_SERVER_URL || 'https://platform.devtest.ringcentral.com'
      };

      this.isInitialized = true;
      console.log('Ring Central service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Ring Central service:', error);
      throw error;
    }
  }

  async authenticate(username: string, password: string, extension?: string) {
    try {
      await this.initialize();
      
      if (!this.credentials) {
        throw new Error('Ring Central credentials not available');
      }

      // Create basic auth header for client credentials
      const basicAuth = btoa(`${this.credentials.RINGCENTRAL_CLIENT_ID}:${this.credentials.RINGCENTRAL_CLIENT_SECRET}`);
      
      const body = new URLSearchParams({
        grant_type: 'password',
        username: username,
        password: password,
      });

      if (extension) {
        body.append('extension', extension);
      }

      const response = await fetch(`${this.credentials.RINGCENTRAL_SERVER_URL}/restapi/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`,
          'Accept': 'application/json'
        },
        body: body.toString()
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Authentication failed:', errorData);
        throw new Error('Authentication failed');
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;
      
      console.log('Ring Central authentication successful');
      return true;
    } catch (error) {
      console.error('Ring Central authentication failed:', error);
      throw error;
    }
  }

  async makeCall(phoneNumber: string) {
    try {
      if (!this.accessToken) {
        throw new Error('Not authenticated with Ring Central');
      }

      if (!this.credentials) {
        throw new Error('Ring Central credentials not available');
      }

      // Clean phone number
      const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
      
      console.log(`Initiating call to ${cleanNumber}`);

      const response = await fetch(`${this.credentials.RINGCENTRAL_SERVER_URL}/restapi/v1.0/account/~/extension/~/ring-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          from: { phoneNumber: 'main' }, // Use main company number
          to: { phoneNumber: cleanNumber },
          playPrompt: false
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Call failed:', errorData);
        throw new Error('Failed to make call');
      }

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
      if (!this.accessToken || !this.credentials) {
        throw new Error('Not authenticated or credentials not available');
      }

      const response = await fetch(`${this.credentials.RINGCENTRAL_SERVER_URL}/restapi/v1.0/account/~/extension/~/ring-out/${callId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get call status');
      }

      const callData = await response.json();
      return callData.status.callStatus;
    } catch (error) {
      console.error('Failed to get call status:', error);
      throw error;
    }
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  async logout() {
    this.accessToken = null;
  }
}

export const ringCentralService = new RingCentralService();
