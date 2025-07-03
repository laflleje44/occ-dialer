
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
    status: 'initiating' | 'connecting' | 'ringing' | 'connected' | 'completed' | 'failed';
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
      // Update status to initiating
      onStatusUpdate?.({
        id: callId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        phone: contact.phone,
        status: 'initiating',
        progress: 10,
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

      // Update status to connecting
      onStatusUpdate?.({
        id: callId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        phone: contact.phone,
        status: 'connecting',
        progress: 30,
        timestamp: new Date()
      });

      // Use RingCentral service to make the call
      await ringCentralService.makeCall(contact.phone, config);
      
      // Update status to ringing
      onStatusUpdate?.({
        id: callId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        phone: contact.phone,
        status: 'ringing',
        progress: 60,
        timestamp: new Date()
      });

      // Simulate call progression
      setTimeout(() => {
        onStatusUpdate?.({
          id: callId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          status: 'connected',
          progress: 90,
          timestamp: new Date()
        });

        // Mark as completed after a short delay
        setTimeout(() => {
          onStatusUpdate?.({
            id: callId,
            contactName: `${contact.firstName} ${contact.lastName}`,
            phone: contact.phone,
            status: 'completed',
            progress: 100,
            timestamp: new Date()
          });
        }, 2000);
      }, 3000);
      
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
        status: 'failed',
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
