
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Contact } from "@/types/auth";

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
  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onCommentsChange(contact, e.target.value);
  };

  const handleAttendanceChange = (checked: boolean | string) => {
    onAttendanceChange(contact, checked as boolean);
  };

  console.log('ContactAttendance render:', {
    contactId: contact.id,
    attending: contact.attending,
    comments: contact.comments,
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
          placeholder="Add comments"
          value={contact.comments || ""}
          onChange={handleCommentsChange}
          className="min-h-[60px] text-sm"
        />
      </div>
    </div>
  );
};

export default ContactAttendance;
