import { Contact } from "@/types/auth";
import ContactRow from "./ContactRow";
import { CallStatus } from "./CallStatusBar";

interface ContactsTableProps {
  contacts: Contact[];
  onCall: (contact: Contact) => void;
  onAttendingChange: (contactId: string, checked: boolean | string) => void;
  onCommentsChange: (contactId: string, comments: string) => void;
  onStatusUpdate?: (status: CallStatus) => void;
  onScrollToStatusBar?: () => void;
}

const ContactsTable = ({ 
  contacts, 
  onCall, 
  onAttendingChange, 
  onCommentsChange, 
  onStatusUpdate,
  onScrollToStatusBar 
}: ContactsTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[150px]">Phone</TableHead>
            <TableHead className="w-[200px]">Email</TableHead>
            <TableHead className="w-[100px]">Attending</TableHead>
            <TableHead className="w-[200px]">Comments</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              onCall={onCall}
              onAttendingChange={onAttendingChange}
              onCommentsChange={onCommentsChange}
              onStatusUpdate={onStatusUpdate}
              onScrollToStatusBar={onScrollToStatusBar}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContactsTable;
