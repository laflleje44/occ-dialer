
import { supabase } from "@/integrations/supabase/client";

interface RingCentralConfig {
  clientId: string;
  clientSecret: string;
  serverUrl: string;
  username?: string;
  extension?: string;
  password?: string;
}

interface CallRequest {
  from: { phoneNumber: string };
  to: [{ phoneNumber: string }];
}

interface SMSRequest {
  from: { phoneNumber: string };
  to: [{ phoneNumber: string }];
  text: string;
}

class RingCentralService {
  private accessToken: string | null = null;
  private config: RingCentralConfig | null = null;

  async initialize() {
    try {
      // Get RingCentral configuration from Supabase secrets
      const { data, error } = await supabase.functions.invoke('get-ringcentral-config');
      
      if (error) throw error;
      
      this.config = data;
      await this.authenticate();
    } catch (error) {
      console.error('Failed to initialize RingCentral service:', error);
      throw error;
    }
  }

  private async authenticate() {
    if (!this.config) throw new Error('RingCentral not configured');

    try {
      // Use password flow for authentication which requires username/extension/password
      // For production, you should use JWT or other secure authentication methods
      const authString = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
      
      const response = await fetch(`${this.config.serverUrl}/restapi/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authString}`,
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: this.config.username || '',
          extension: this.config.extension || '',
          password: this.config.password || ''
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Authentication response:', errorText);
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      console.log('RingCentral authentication successful');
    } catch (error) {
      console.error('RingCentral authentication failed:', error);
      throw error;
    }
  }

  async makeCall(fromNumber: string, toNumber: string): Promise<void> {
    if (!this.accessToken || !this.config) {
      await this.initialize();
    }

    const callRequest: CallRequest = {
      from: { phoneNumber: fromNumber },
      to: [{ phoneNumber: toNumber }]
    };

    try {
      const response = await fetch(`${this.config!.serverUrl}/restapi/v1.0/account/~/extension/~/ring-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(callRequest)
      });

      if (!response.ok) {
        throw new Error(`Call failed: ${response.statusText}`);
      }

      console.log('Call initiated successfully');
    } catch (error) {
      console.error('Failed to make call:', error);
      throw error;
    }
  }

  async sendSMS(fromNumber: string, toNumber: string, message: string): Promise<void> {
    if (!this.accessToken || !this.config) {
      await this.initialize();
    }

    const smsRequest: SMSRequest = {
      from: { phoneNumber: fromNumber },
      to: [{ phoneNumber: toNumber }],
      text: message
    };

    try {
      const response = await fetch(`${this.config!.serverUrl}/restapi/v1.0/account/~/extension/~/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(smsRequest)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('SMS API Error Response:', errorData);
        throw new Error(`SMS failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('SMS sent successfully:', responseData);
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }
}

export const ringCentralService = new RingCentralService();
