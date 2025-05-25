
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types/auth";
import { useRingCentral } from "@/hooks/useRingCentral";

interface ContactActionsProps {
  contact: Contact;
}

const ContactActions = ({ contact }: ContactActionsProps) => {
  const { toast } = useToast();
  const { isAuthenticated, makeCall } = useRingCentral();

  const handleCall = async (contact: Contact) => {
    if (!isAuthenticated) {
      toast({
        title: "Ring Central Not Connected",
        description: "Please connect to Ring Central first to make calls.",
        variant: "destructive"
      });
      return;
    }

    const success = await makeCall(contact.phone, `${contact.firstName} ${contact.lastName}`);
    
    if (success) {
      console.log(`Ring Central call initiated: ${contact.phone} - ${contact.firstName} ${contact.lastName}`);
    }
  };

  const handleText = (contact: Contact) => {
    toast({
      title: "Opening text message",
      description: `Texting ${contact.firstName} ${contact.lastName} at ${contact.phone}`
    });
    console.log(`Texting: ${contact.phone} - ${contact.firstName} ${contact.lastName}`);
  };

  return (
    <div className="flex space-x-2 justify-end">
      <Button
        size="sm"
        onClick={() => handleText(contact)}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Text
      </Button>
      <Button
        size="sm"
        onClick={() => handleCall(contact)}
        className={`text-white ${
          isAuthenticated 
            ? "bg-green-500 hover:bg-green-600" 
            : "bg-gray-400 hover:bg-gray-500"
        }`}
        title={!isAuthenticated ? "Connect to Ring Central first" : ""}
      >
        <Phone className="w-4 h-4 mr-2" />
        Call
      </Button>
    </div>
  );
};

export default ContactActions;
