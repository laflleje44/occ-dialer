
import { Contact } from "@/types/auth";
import CallButton from "./CallButton";
import TextButton from "./TextButton";
import { CallStatus } from "./CallStatusBar";

interface ContactActionsProps {
  contact: Contact;
  onCall: (contact: Contact) => void;
  onStatusUpdate?: (status: CallStatus) => void;
  onScrollToStatusBar?: () => void;
}

const ContactActions = ({ contact, onCall, onStatusUpdate, onScrollToStatusBar }: ContactActionsProps) => {
  return (
    <div className="flex space-x-2">
      <CallButton 
        contact={contact} 
        onCall={onCall} 
        onStatusUpdate={onStatusUpdate}
        onScrollToStatusBar={onScrollToStatusBar}
      />
      <TextButton contact={contact} />
    </div>
  );
};

export default ContactActions;
