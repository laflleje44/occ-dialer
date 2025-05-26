
import { supabase } from "@/integrations/supabase/client";

class RingCentralService {
  private accessToken: string | null = null;
  private config: any = null;

  async initialize(config: any) {
    this.config = config;
    console.log('Initializing RingCentral with config:', {
      clientId: config.clientId ? 'present' : 'missing',
      serverUrl: config.serverUrl,
      jwtToken: config.jwtToken ? 'present' : 'missing'
    });
    await this.authenticate();
  }

  private async getUserCallerNumber(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_ringcentral_settings')
        .select('caller_number')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user caller number:', error);
        return null;
      }

      return data?.caller_number || null;
    } catch (error) {
      console.error('Error fetching user caller number:', error);
      return null;
    }
  }

  private async authenticate() {
    if (!this.config) {
      throw new Error('RingCentral not configured');
    }

    // Check if we have JWT token for authentication
    if (this.config.jwtToken) {
      await this.authenticateWithJWT();
    } else if (this.config.clientId && this.config.clientSecret && this.config.username && this.config.password) {
      await this.authenticateWithPassword();
    } else {
      throw new Error('Missing required RingCentral credentials (need either JWT token or username/password)');
    }
  }

  private async authenticateWithJWT() {
    try {
      console.log('Authenticating with RingCentral using JWT...');
      
      const response = await fetch(`${this.config.serverUrl}/restapi/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: this.config.jwtToken
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('JWT Authentication response:', errorText);
        throw new Error(`JWT Authentication failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      console.log('RingCentral JWT authentication successful');
      
    } catch (error) {
      console.error('RingCentral JWT authentication failed:', error);
      throw error;
    }
  }

  private async authenticateWithPassword() {
    try {
      console.log('Authenticating with RingCentral using password flow...');
      
      const response = await fetch(`${this.config.serverUrl}/restapi/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: this.config.username,
          extension: this.config.extension || '',
          password: this.config.password
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Authentication response:', errorText);
        throw new Error(`Authentication failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      console.log('RingCentral authentication successful');
      
    } catch (error) {
      console.error('RingCentral authentication failed:', error);
      throw error;
    }
  }

  async makeCall(to: string, config?: any) {
    try {
      // If config is provided, initialize with it
      if (config && !this.config) {
        await this.initialize(config);
      }

      if (!this.accessToken) {
        if (!this.config) {
          throw new Error('RingCentral service not initialized');
        }
        await this.authenticate();
      }

      // Get user-specific caller number, fallback to default
      const userCallerNumber = await this.getUserCallerNumber();
      const from = userCallerNumber || this.config.ringoutCaller;

      if (!from) {
        throw new Error('No caller number configured. Please set your caller ID in settings.');
      }

      console.log('Making RingOut call:', { from, to });

      const response = await fetch(`${this.config.serverUrl}/restapi/v1.0/account/~/extension/~/ring-out`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({
          from: { phoneNumber: from },
          to: { phoneNumber: to },
          playPrompt: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Call failed:', errorText);
        throw new Error(`Call failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Call initiated successfully:', result);
      return result;
      
    } catch (error) {
      console.error('Failed to make call:', error);
      throw error;
    }
  }

  async sendSMS(to: string, text: string, config?: any) {
    try {
      // If config is provided, initialize with it
      if (config && !this.config) {
        await this.initialize(config);
      }

      if (!this.accessToken) {
        if (!this.config) {
          throw new Error('RingCentral service not initialized');
        }
        await this.authenticate();
      }

      // Get user-specific caller number, fallback to default
      const userCallerNumber = await this.getUserCallerNumber();
      const from = userCallerNumber || this.config.ringoutCaller;

      if (!from) {
        throw new Error('No caller number configured. Please set your caller ID in settings.');
      }

      console.log('Sending SMS:', { from, to, text });

      const response = await fetch(`${this.config.serverUrl}/restapi/v1.0/account/~/extension/~/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({
          from: { phoneNumber: from },
          to: [{ phoneNumber: to }],
          text: text
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SMS failed:', errorText);
        throw new Error(`SMS failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('SMS sent successfully:', result);
      return result;
      
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }
}

export const ringCentralService = new RingCentralService();
