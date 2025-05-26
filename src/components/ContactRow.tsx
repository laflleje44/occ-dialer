
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

const getStatusDisplay = (status?: string) => {
  switch (status) {
    case "called":
      return { text: "Called", bgColor: "bg-green-100", textColor: "text-green-800" };
    case "busy":
      return { text: "Busy", bgColor: "bg-yellow-100", textColor: "text-yellow-800" };
    case "call failed":
      return { text: "Call Failed", bgColor: "bg-red-100", textColor: "text-red-800" };
    case "text sent":
      return { text: "Text Sent", bgColor: "bg-blue-100", textColor: "text-blue-800" };
    case "not called":
    default:
      return { text: "Not Called", bgColor: "bg-gray-100", textColor: "text-gray-800" };
  }
};

const formatLastCalled = (lastCalled?: string) => {
  if (!lastCalled) return "Never";
  
  const date = new Date(lastCalled);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  
  return date.toLocaleDateString();
};

const ContactRow = ({ contact, onCall, onAttendingChange, onCommentsChange }: ContactRowProps) => {
  const statusDisplay = getStatusDisplay(contact.status);

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
        <div className="text-sm text-gray-500">
          {formatLastCalled(contact.last_called)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
          {statusDisplay.text}
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
