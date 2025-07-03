
import { useState } from "react";
import { Contact } from "@/types/auth";
import { TableRow, TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import ContactAttendance from "./ContactAttendance";
import ContactActions from "./ContactActions";
import { CallStatus } from "./CallStatusBar";

interface ContactRowProps {
  contact: Contact;
  onCall: (contact: Contact) => void;
  onAttendingChange: (contactId: string, checked: boolean | string) => void;
  onCommentsChange: (contactId: string, comments: string) => void;
  onStatusUpdate?: (status: CallStatus) => void;
  onScrollToStatusBar?: () => void;
}

const ContactRow = ({ 
  contact, 
  onCall, 
  onAttendingChange, 
  onCommentsChange, 
  onStatusUpdate,
  onScrollToStatusBar 
}: ContactRowProps) => {
  const [comments, setComments] = useState(contact.comments || "");
  const [isEditing, setIsEditing] = useState(false);

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComments(e.target.value);
    setIsEditing(true);
  };

  const handleCommentsBlur = () => {
    if (isEditing) {
      onCommentsChange(contact.id, comments);
      setIsEditing(false);
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        {contact.firstName} {contact.lastName}
      </TableCell>
      <TableCell>{contact.phone}</TableCell>
      <TableCell>{contact.email}</TableCell>
      <TableCell>
        <ContactAttendance 
          contact={contact}
          onAttendingChange={onAttendingChange}
          onCommentsChange={onCommentsChange}
        />
      </TableCell>
      <TableCell>
        <Textarea
          value={comments}
          onChange={handleCommentsChange}
          onBlur={handleCommentsBlur}
          placeholder="Add comments..."
          className="min-h-[60px] text-sm"
        />
      </TableCell>
      <TableCell>
        <ContactActions 
          contact={contact} 
          onCall={onCall} 
          onStatusUpdate={onStatusUpdate}
          onScrollToStatusBar={onScrollToStatusBar}
        />
      </TableCell>
    </TableRow>
  );
};

export default ContactRow;
