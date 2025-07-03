
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { Contact } from "@/types/auth";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ringCentralService } from "@/services/ringCentralService";
import { useContactMutations } from "@/hooks/useContactMutations";

interface CallButtonProps {
  contact: Contact;
  onCall: (contact: Contact) => void;
  onStatusUpdate?: (status: {
    id: string;
    contactName: string;
    phone: string;
    status: 'initiating' | 'connecting' | 'dialing_first' | 'first_ringing' | 'first_answered' | 'dialing_second' | 'second_ringing' | 'second_answered' | 'connecting_calls' | 'call_connected' | 'call_completed' | 'call_failed';
    progress: number;
    timestamp: Date;
  }) => void;
}

const CallButton = ({ contact, onCall, onStatusUpdate }: CallButtonProps) => {
  const [isCallLoading, setIsCallLoading] = useState(false);
  const { updateContactStatusMutation } = useContactMutations();

  const handleCall = async () => {
    setIsCallLoading(true);
    const callId = `call-${contact.id}-${Date.now()}`;
    
    try {
      // Step 1: Initiating call
      onStatusUpdate?.({
        id: callId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        phone: contact.phone,
        status: 'initiating',
        progress: 5,
        timestamp: new Date()
      });

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

      // Step 2: Connecting to RingCentral
      onStatusUpdate?.({
        id: callId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        phone: contact.phone,
        status: 'connecting',
        progress: 15,
        timestamp: new Date()
      });

      // Step 3: Dialing first person (you)
      setTimeout(() => {
        onStatusUpdate?.({
          id: callId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          status: 'dialing_first',
          progress: 25,
          timestamp: new Date()
        });
      }, 500);

      // Step 4: First person ringing
      setTimeout(() => {
        onStatusUpdate?.({
          id: callId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          status: 'first_ringing',
          progress: 35,
          timestamp: new Date()
        });
      }, 1500);

      // Step 5: First person answered
      setTimeout(() => {
        onStatusUpdate?.({
          id: callId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          status: 'first_answered',
          progress: 45,
          timestamp: new Date()
        });
      }, 3000);

      // Step 6: Dialing second person (contact)
      setTimeout(() => {
        onStatusUpdate?.({
          id: callId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          status: 'dialing_second',
          progress: 55,
          timestamp: new Date()
        });
      }, 4000);

      // Step 7: Second person ringing
      setTimeout(() => {
        onStatusUpdate?.({
          id: callId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          status: 'second_ringing',
          progress: 70,
          timestamp: new Date()
        });
      }, 5000);

      // Step 8: Second person answered
      setTimeout(() => {
        onStatusUpdate?.({
          id: callId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          status: 'second_answered',
          progress: 80,
          timestamp: new Date()
        });
      }, 7000);

      // Step 9: Connecting both parties
      setTimeout(() => {
        onStatusUpdate?.({
          id: callId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          status: 'connecting_calls',
          progress: 90,
          timestamp: new Date()
        });
      }, 8000);

      // Step 10: Call connected
      setTimeout(() => {
        onStatusUpdate?.({
          id: callId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          status: 'call_connected',
          progress: 95,
          timestamp: new Date()
        });
      }, 9000);

      // Use RingCentral service to make the call
      await ringCentralService.makeCall(contact.phone, config);

      // Step 11: Call completed
      setTimeout(() => {
        onStatusUpdate?.({
          id: callId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          status: 'call_completed',
          progress: 100,
          timestamp: new Date()
        });
      }, 12000);
      
      // Update status to "called" on successful call
      await updateContactStatusMutation.mutateAsync({
        contactId: contact.id,
        status: "called"
      });
      
      onCall(contact);
      
    } catch (error) {
      console.error('Call failed:', error);
      
      // Update status to failed
      onStatusUpdate?.({
        id: callId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        phone: contact.phone,
        status: 'call_failed',
        progress: 0,
        timestamp: new Date()
      });
      
      // Update status to "call failed" on error
      await updateContactStatusMutation.mutateAsync({
        contactId: contact.id,
        status: "call failed"
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
