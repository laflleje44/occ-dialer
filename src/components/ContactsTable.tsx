
import { Contact } from "@/types/auth";
import ContactRow from "./ContactRow";

interface ContactsTableProps {
  contacts: Contact[];
  onCall: (contact: Contact) => void;
  onAttendingChange: (contactId: string, checked: boolean | string) => void;
  onCommentsChange: (contactId: string, comments: string) => void;
}

const ContactsTable = ({ contacts, onCall, onAttendingChange, onCommentsChange }: ContactsTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                NAME
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                PHONE
              </th>
              <th className="hidden sm:table-cell px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                LAST CALLED
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                STATUS
              </th>
              <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                COMMENTS
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact) => (
              <ContactRow
                key={`contact-${contact.id}`}
                contact={contact}
                onCall={onCall}
                onAttendingChange={onAttendingChange}
                onCommentsChange={onCommentsChange}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactsTable;
