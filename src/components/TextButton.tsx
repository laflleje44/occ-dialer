
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { Contact } from "@/types/auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ringCentralService } from "@/services/ringCentralService";
import { useContactMutations } from "@/hooks/useContactMutations";
import { useContactSMS } from "@/hooks/useContactSMS";

interface TextButtonProps {
  contact: Contact;
}

const TextButton = ({ contact }: TextButtonProps) => {
  const [isTextLoading, setIsTextLoading] = useState(false);
  const { toast } = useToast();
  const { updateContactStatusMutation } = useContactMutations();
  const { smsContent } = useContactSMS(contact.call_session_id);

  const handleText = async () => {
    setIsTextLoading(true);
    try {
      // Get RingCentral config first to get the from number
      const { data: config, error } = await supabase.functions.invoke('get-ringcentral-config');
      
      if (error || !config) {
        throw new Error('RingCentral configuration not found');
      }

      console.log('RingCentral config received for SMS:', {
        clientId: config.clientId ? 'present' : 'missing',
        serverUrl: config.serverUrl,
        username: config.username ? 'present' : 'missing',
        fromNumber: config.fromNumber
      });

      // Use the custom SMS content if available
      const message = smsContent || `Hello ${contact.firstName}, this is a message from OCC Secure Dialer.`;
      
      console.log('Sending SMS with RingCentral:', {
        from: config.fromNumber,
        to: contact.phone,
        message: message
      });

      // Use RingCentral service to send SMS with config
      await ringCentralService.sendSMS(contact.phone, message, config);
      
      // Update status to "text sent" on successful SMS
      await updateContactStatusMutation.mutateAsync({
        contactId: contact.id,
        status: "text sent"
      });
      
      toast({
        title: "Text sent",
        description: `Message sent to ${contact.firstName} ${contact.lastName}`
      });
      
      console.log(`SMS sent successfully to: ${contact.phone} - ${contact.firstName} ${contact.lastName}`);
    } catch (error) {
      console.error('Text failed:', error);
      
      // Update status to "call failed" (we can use same status for SMS failures)
      await updateContactStatusMutation.mutateAsync({
        contactId: contact.id,
        status: "call failed"
      });
      
      // Check if it's the specific "phone number doesn't belong to extension" error
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('MSG-304') || errorMessage.includes("Phone number doesn't belong to extension")) {
        toast({
          title: "SMS not available",
          description: "The configured phone number doesn't have SMS capability. Please contact your RingCentral administrator to enable SMS for this extension.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Text failed",
          description: errorMessage || "Unable to send text message. Please check your RingCentral configuration.",
          variant: "destructive"
        });
      }
    } finally {
      setIsTextLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      onClick={handleText}
      disabled={true}
      className="bg-gray-400 hover:bg-gray-400 text-gray-600 cursor-not-allowed"
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      Text
    </Button>
  );
};

export default TextButton;
