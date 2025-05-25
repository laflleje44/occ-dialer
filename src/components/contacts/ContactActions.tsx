
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types/auth";

interface ContactActionsProps {
  contact: Contact;
}

const ContactActions = ({ contact }: ContactActionsProps) => {
  const { toast } = useToast();

  const handleCall = (contact: Contact) => {
    toast({
      title: "Initiating call",
      description: `Calling ${contact.firstName} ${contact.lastName} at ${contact.phone}`
    });
    console.log(`Dialing: ${contact.phone} - ${contact.firstName} ${contact.lastName}`);
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
        className="bg-green-500 hover:bg-green-600 text-white"
      >
        <Phone className="w-4 h-4 mr-2" />
        Call
      </Button>
    </div>
  );
};

export default ContactActions;
