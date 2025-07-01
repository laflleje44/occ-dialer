
import { Contact } from "@/types/auth";
import CallButton from "./CallButton";
import TextButton from "./TextButton";

interface ContactActionsProps {
  contact: Contact;
  onCall: (contact: Contact) => void;
}

const ContactActions = ({ contact, onCall }: ContactActionsProps) => {
  return (
    <div className="flex gap-2 justify-end">
      <TextButton contact={contact} />
      <CallButton contact={contact} onCall={onCall} />
    </div>
  );
};

export default ContactActions;
