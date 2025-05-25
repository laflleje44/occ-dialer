
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Contact } from "@/types/auth";
import { useState, useEffect } from "react";

interface ContactAttendanceProps {
  contact: Contact;
  onAttendanceChange: (contact: Contact, checked: boolean) => void;
  onCommentsChange: (contact: Contact, comments: string) => void;
}

const ContactAttendance = ({ 
  contact, 
  onAttendanceChange, 
  onCommentsChange 
}: ContactAttendanceProps) => {
  const [localComments, setLocalComments] = useState(contact.comments || "");

  // Use useEffect to sync with prop changes instead of doing it during render
  useEffect(() => {
    setLocalComments(contact.comments || "");
  }, [contact.comments]);

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalComments(e.target.value);
  };

  const handleCommentsKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onCommentsChange(contact, localComments);
    }
  };

  const handleAttendanceChange = (checked: boolean | string) => {
    onAttendanceChange(contact, checked as boolean);
  };

  console.log('ContactAttendance render:', {
    contactId: contact.id,
    attending: contact.attending,
    comments: contact.comments,
    localComments: localComments,
    firstName: contact.firstName
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id={`attend-${contact.id}`}
          checked={contact.attending === "yes"}
          onCheckedChange={handleAttendanceChange}
        />
        <label 
          htmlFor={`attend-${contact.id}`}
          className="text-sm text-gray-700 cursor-pointer"
        >
          Confirmed to attend
        </label>
      </div>
      <div className="w-48">
        <Textarea
          placeholder="Add comments (press Enter to save)"
          value={localComments}
          onChange={handleCommentsChange}
          onKeyDown={handleCommentsKeyDown}
          className="min-h-[60px] text-sm"
        />
      </div>
    </div>
  );
};

export default ContactAttendance;
