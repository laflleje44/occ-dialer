
import { Contact } from "@/types/auth";
import ContactActions from "./ContactActions";
import ContactAttendance from "./ContactAttendance";

interface ContactRowProps {
  contact: Contact;
  onAttendanceChange: (contact: Contact, checked: boolean) => void;
  onCommentsChange: (contact: Contact, comments: string) => void;
  maskLastName: (lastName: string) => string;
  maskPhoneNumber: (phone: string) => string;
}

const ContactRow = ({ 
  contact, 
  onAttendanceChange, 
  onCommentsChange, 
  maskLastName, 
  maskPhoneNumber 
}: ContactRowProps) => {
  return (
    <tr className="hover:bg-gray-50">
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
          onAttendanceChange={onAttendanceChange}
          onCommentsChange={onCommentsChange}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <ContactActions contact={contact} />
      </td>
    </tr>
  );
};

export default ContactRow;
