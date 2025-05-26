
class RingCentralService {
  private accessToken: string | null = null;
  private config: any = null;

  async initialize(config: any) {
    this.config = config;
    await this.authenticate();
  }

  private async authenticate() {
    if (!this.config) {
      throw new Error('RingCentral not configured');
    }

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

  async makeCall(from: string, to: string) {
    try {
      if (!this.accessToken) {
        await this.initialize(this.config);
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

  async sendSMS(from: string, to: string, text: string) {
    try {
      if (!this.accessToken) {
        await this.initialize(this.config);
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
