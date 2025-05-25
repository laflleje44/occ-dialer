
import { Contact } from "@/types/auth";
import ContactRow from "./ContactRow";

interface ContactsTableProps {
  contacts: Contact[];
  onAttendanceChange: (contact: Contact, checked: boolean) => void;
  onCommentsChange: (contact: Contact, comments: string) => void;
  maskLastName: (lastName: string) => string;
  maskPhoneNumber: (phone: string) => string;
}

const ContactsTable = ({ 
  contacts, 
  onAttendanceChange, 
  onCommentsChange, 
  maskLastName, 
  maskPhoneNumber 
}: ContactsTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                FIRST NAME
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                LAST NAME
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                PHONE NUMBER
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                LAST CALLED
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                STATUS
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                ATTENDANCE
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onAttendanceChange={onAttendanceChange}
                onCommentsChange={onCommentsChange}
                maskLastName={maskLastName}
                maskPhoneNumber={maskPhoneNumber}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactsTable;
