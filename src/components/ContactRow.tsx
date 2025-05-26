
import { Contact } from "@/types/auth";
import { maskLastName, maskPhoneNumber } from "@/utils/contactUtils";
import ContactActions from "./ContactActions";
import ContactAttendance from "./ContactAttendance";

interface ContactRowProps {
  contact: Contact;
  onCall: (contact: Contact) => void;
  onAttendingChange: (contactId: string, checked: boolean | string) => void;
  onCommentsChange: (contactId: string, comments: string) => void;
}

const ContactRow = ({ contact, onCall, onAttendingChange, onCommentsChange }: ContactRowProps) => {
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
        <ContactAttendance
          contact={contact}
          onAttendingChange={onAttendingChange}
          onCommentsChange={onCommentsChange}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <ContactActions contact={contact} onCall={onCall} />
      </td>
    </tr>
  );
};

export default ContactRow;
