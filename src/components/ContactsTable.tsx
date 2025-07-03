
import { Contact } from "@/types/auth";
import ContactRow from "./ContactRow";
import { CallStatus } from "./CallStatusBar";

interface ContactsTableProps {
  contacts: Contact[];
  onCall: (contact: Contact) => void;
  onAttendingChange: (contactId: string, checked: boolean | string) => void;
  onCommentsChange: (contactId: string, comments: string) => void;
  onStatusUpdate?: (status: CallStatus) => void;
}

const ContactsTable = ({ 
  contacts, 
  onCall, 
  onAttendingChange, 
  onCommentsChange,
  onStatusUpdate 
}: ContactsTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attending
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onCall={onCall}
                onAttendingChange={onAttendingChange}
                onCommentsChange={onCommentsChange}
                onStatusUpdate={onStatusUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactsTable;
