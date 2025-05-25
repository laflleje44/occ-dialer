
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

  async startOAuthFlow() {
    try {
      await this.initialize();
      
      if (!this.credentials) {
        throw new Error('Ring Central credentials not available');
      }

      // Generate OAuth authorization URL
      const redirectUri = window.location.origin + '/ringcentral-callback';
      const scope = 'VoipCalling CallControl';
      const state = Math.random().toString(36).substring(2, 15);
      
      // Store state for verification
      localStorage.setItem('ringcentral_oauth_state', state);
      
      const authUrl = `${this.credentials.RINGCENTRAL_SERVER_URL}/restapi/oauth/authorize?` +
        `response_type=code&` +
        `client_id=${encodeURIComponent(this.credentials.RINGCENTRAL_CLIENT_ID)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${encodeURIComponent(state)}`;

      // Redirect to Ring Central OAuth page
      window.location.href = authUrl;
      
      return true;
    } catch (error) {
      console.error('Failed to start OAuth flow:', error);
      throw error;
    }
  }

  async handleOAuthCallback(code: string, state: string) {
    try {
      await this.initialize();
      
      if (!this.credentials) {
        throw new Error('Ring Central credentials not available');
      }

      // Verify state parameter
      const storedState = localStorage.getItem('ringcentral_oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid OAuth state parameter');
      }

      // Exchange authorization code for access token
      const redirectUri = window.location.origin + '/ringcentral-callback';
      const basicAuth = btoa(`${this.credentials.RINGCENTRAL_CLIENT_ID}:${this.credentials.RINGCENTRAL_CLIENT_SECRET}`);
      
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      });

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
        console.error('Token exchange failed:', errorData);
        throw new Error('Token exchange failed');
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;
      
      // Store token securely
      localStorage.setItem('ringcentral_access_token', this.accessToken);
      localStorage.removeItem('ringcentral_oauth_state');
      
      console.log('Ring Central OAuth authentication successful');
      return true;
    } catch (error) {
      console.error('Ring Central OAuth callback failed:', error);
      throw error;
    }
  }

  async makeCall(phoneNumber: string) {
    try {
      // Check for stored token first
      if (!this.accessToken) {
        this.accessToken = localStorage.getItem('ringcentral_access_token');
      }

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
        
        // If unauthorized, clear stored token
        if (response.status === 401) {
          this.accessToken = null;
          localStorage.removeItem('ringcentral_access_token');
          throw new Error('Authentication expired. Please re-authenticate.');
        }
        
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
    return !!this.accessToken || !!localStorage.getItem('ringcentral_access_token');
  }

  async logout() {
    this.accessToken = null;
    localStorage.removeItem('ringcentral_access_token');
    localStorage.removeItem('ringcentral_oauth_state');
  }
}

export const ringCentralService = new RingCentralService();
