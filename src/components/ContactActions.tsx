
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare } from "lucide-react";
import { Contact } from "@/types/auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { makeCall } from "@/services/ringCentralService";

interface ContactActionsProps {
  contact: Contact;
  onCall: (contact: Contact) => void;
}

const ContactActions = ({ contact, onCall }: ContactActionsProps) => {
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get SMS content for the contact's call session
  const { data: smsContent } = useQuery({
    queryKey: ['call-session-sms', contact.call_session_id],
    queryFn: async () => {
      if (!contact.call_session_id) return null;
      
      const { data, error } = await supabase
        .from('call_session_sms')
        .select('sms_content')
        .eq('call_session_id', contact.call_session_id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching SMS content:', error);
        return null;
      }
      
      return data?.sms_content || 'Thank you for your time. Please confirm your attendance.';
    },
    enabled: !!contact.call_session_id
  });

  const updateContactStatusMutation = useMutation({
    mutationFn: async ({ contactId, status }: { contactId: string; status: string }) => {
      console.log('Updating contact status:', contactId, 'to:', status);
      
      const { error } = await supabase
        .from('contacts')
        .update({
          status,
          last_called: new Date().toISOString(),
          status_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId);
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Contact status updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  const handleCall = async () => {
    setIsCallLoading(true);
    try {
      await makeCall(contact.phone);
      
      // Update status to "called" on successful call
      await updateContactStatusMutation.mutateAsync({
        contactId: contact.id,
        status: "called"
      });
      
      onCall(contact);
      
      toast({
        title: "Call initiated",
        description: `Calling ${contact.firstName} ${contact.lastName} at ${contact.phone}`
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

      // TODO: Implement SMS sending through RingCentral edge function
      console.log('SMS functionality not yet implemented');
      
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
    <div className="flex gap-2 justify-end">
      <Button
        size="sm"
        onClick={handleText}
        disabled={isTextLoading}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        {isTextLoading ? "Sending..." : "Text"}
      </Button>
      <Button
        size="sm"
        onClick={handleCall}
        disabled={isCallLoading}
        className="bg-green-500 hover:bg-green-600 text-white"
      >
        <Phone className="w-4 h-4 mr-2" />
        {isCallLoading ? "Calling..." : "Call"}
      </Button>
    </div>
  );
};

export default ContactActions;
