
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { Contact } from "@/types/auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ringCentralService } from "@/services/ringCentralService";
import { useContactMutations } from "@/hooks/useContactMutations";
import { maskPhoneNumber } from "@/utils/contactUtils";

interface CallButtonProps {
  contact: Contact;
  onCall: (contact: Contact) => void;
}

const CallButton = ({ contact, onCall }: CallButtonProps) => {
  const [isCallLoading, setIsCallLoading] = useState(false);
  const { toast } = useToast();
  const { updateContactStatusMutation } = useContactMutations();

  const handleCall = async () => {
    setIsCallLoading(true);
    try {
      // Get RingCentral config first to get the from number
      const { data: config, error } = await supabase.functions.invoke('get-ringcentral-config');
      
      if (error || !config) {
        throw new Error('RingCentral configuration not found');
      }

      console.log('RingCentral config received:', {
        clientId: config.clientId ? 'present' : 'missing',
        serverUrl: config.serverUrl,
        username: config.username ? 'present' : 'missing',
        fromNumber: config.fromNumber
      });

      // Use RingCentral service to make the call
      await ringCentralService.makeCall(contact.phone, config);
      
      // Update status to "called" on successful call
      await updateContactStatusMutation.mutateAsync({
        contactId: contact.id,
        status: "called"
      });
      
      onCall(contact);
      
      toast({
        title: "Call initiated",
        description: `Calling ${contact.firstName} ${contact.lastName} at ${maskPhoneNumber(contact.phone)}`
      });
    } catch (error) {
      console.error('Call failed:', error);
      
      // Update status to "call failed" on error
      await updateContactStatusMutation.mutateAsync({
        contactId: contact.id,
        status: "call failed"
      });
      
      toast({
        title: "Call failed",
        description: error instanceof Error ? error.message : "Unable to initiate call. Please check your RingCentral configuration.",
        variant: "destructive"
      });
    } finally {
      setIsCallLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      onClick={handleCall}
      disabled={isCallLoading}
      className="bg-green-500 hover:bg-green-600 text-white"
    >
      <Phone className="w-4 h-4 mr-2" />
      {isCallLoading ? "Calling..." : "Call"}
    </Button>
  );
};

export default CallButton;
