
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Phone } from "lucide-react";
import { Contact } from "@/types/auth";

interface ContactRowProps {
  contact: Contact;
  onCall: (contact: Contact) => void;
  onAttendingChange: (contactId: string, checked: boolean | string) => void;
  onCommentsChange: (contactId: string, comments: string) => void;
}

const ContactRow = ({ contact, onCall, onAttendingChange, onCommentsChange }: ContactRowProps) => {
  const maskLastName = (lastName: string) => {
    if (!lastName) return '';
    return lastName.charAt(0) + '*'.repeat(lastName.length - 1);
  };

  const maskPhoneNumber = (phone: string) => {
    if (!phone || phone.length < 4) return phone;
    const lastFour = phone.slice(-4);
    const maskedPart = '*'.repeat(phone.length - 4);
    return maskedPart + lastFour;
  };

  return (
    <tr key={`contact-${contact.id}`} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {contact.firstName}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {maskLastName(contact.lastName)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {maskPhoneNumber(contact.phone)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">Never</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
          Not Called
        </span>
      </td>
      <td className="px-6 py-4">
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
              placeholder="Add comments"
              value={contact.comments || ""}
              onChange={(e) => onCommentsChange(contact.id, e.target.value)}
              className="min-h-[60px] text-sm"
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <Button
          size="sm"
          onClick={() => onCall(contact)}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Phone className="w-4 h-4 mr-2" />
          Call
        </Button>
      </td>
    </tr>
  );
};

export default ContactRow;
