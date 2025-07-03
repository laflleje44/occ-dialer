
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Contact } from "@/types/auth";
import { useState, useEffect } from "react";

interface ContactAttendanceProps {
  contact: Contact;
  onAttendingChange: (contactId: string, checked: boolean | string) => void;
  onCommentsChange: (contactId: string, comments: string) => void;
}

const ContactAttendance = ({ contact, onAttendingChange, onCommentsChange }: ContactAttendanceProps) => {
  const [localComments, setLocalComments] = useState(contact.comments || "");

  // Update local state when contact prop changes (e.g., when switching call sessions)
  useEffect(() => {
    setLocalComments(contact.comments || "");
  }, [contact.comments, contact.id]);

  const handleCommentsKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('Saving comments for contact:', contact.id, 'with value:', localComments);
      onCommentsChange(contact.id, localComments);
    }
  };

  const handleCommentsBlur = () => {
    // Also save on blur (when field loses focus)
    if (localComments !== (contact.comments || "")) {
      console.log('Saving comments on blur for contact:', contact.id, 'with value:', localComments);
      onCommentsChange(contact.id, localComments);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id={`attend-${contact.id}`}
          checked={contact.attending === "yes"}
          onCheckedChange={(checked) => onAttendingChange(contact.id, checked)}
        />
        <label 
          htmlFor={`attend-${contact.id}`}
          className="text-sm text-gray-700"
        >
          Confirmed to attend
        </label>
      </div>
      <div className="w-48">
        <Textarea
          placeholder="Add comments (press Enter to save)"
          value={localComments}
          onChange={(e) => setLocalComments(e.target.value)}
          onKeyDown={handleCommentsKeyDown}
          onBlur={handleCommentsBlur}
          className="min-h-[60px] text-sm"
        />
      </div>
    </div>
  );
};

export default ContactAttendance;
