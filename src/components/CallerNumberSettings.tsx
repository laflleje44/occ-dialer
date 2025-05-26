
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Save } from "lucide-react";

const CallerNumberSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [callerNumber, setCallerNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  const fetchUserSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_ringcentral_settings')
        .select('caller_number')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error);
        return;
      }

      if (data) {
        setCallerNumber(data.caller_number);
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !callerNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid caller number",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_ringcentral_settings')
        .upsert({
          user_id: user.id,
          caller_number: callerNumber.trim()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Caller number updated successfully"
      });
    } catch (error) {
      console.error('Error saving caller number:', error);
      toast({
        title: "Error",
        description: "Failed to save caller number",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '');
    
    // Format as phone number
    let formatted = digitsOnly;
    if (digitsOnly.length >= 10) {
      formatted = `+1${digitsOnly.slice(-10)}`;
    } else if (digitsOnly.length > 0) {
      formatted = `+1${digitsOnly}`;
    }
    
    setCallerNumber(formatted);
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Caller ID Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Phone className="w-5 h-5" />
          <span>Caller ID Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="caller-number">Your Caller ID Number</Label>
          <div className="flex space-x-2">
            <Input
              id="caller-number"
              type="tel"
              placeholder="+1234567890"
              value={callerNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !callerNumber.trim()}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            This number will be used as the caller ID for all outgoing calls. Format: +1234567890
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallerNumberSettings;
