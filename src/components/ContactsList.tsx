
import { Users } from "lucide-react";
import { Contact } from "@/types/auth";
import ContactsSearch from "./contacts/ContactsSearch";
import ContactsTable from "./contacts/ContactsTable";
import CallSessionSelector from "./contacts/CallSessionSelector";
import { maskLastName, maskPhoneNumber } from "@/utils/contactUtils";
import { filterContacts } from "@/utils/contactFilters";
import { useContactUpdates } from "@/hooks/useContactUpdates";
import { useCallSessions } from "@/hooks/useCallSessions";
import { useState } from "react";

interface ContactsListProps {
  contacts: Contact[];
  selectedCallSessionId: string | null;
  onCallSessionChange: (sessionId: string | null) => void;
}

const ContactsList = ({ contacts, selectedCallSessionId, onCallSessionChange }: ContactsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAttending, setFilterAttending] = useState<"all" | "yes" | "no">("all");
  const { handleAttendanceChange, handleCommentsChange } = useContactUpdates();
  const { callSessions } = useCallSessions();

  const filteredContacts = filterContacts(contacts, searchTerm, filterAttending);

  if (callSessions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No call sessions found</h3>
        <p className="text-gray-500 mb-4">Upload a CSV file in the Upload Contacts tab to create your first call session.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <CallSessionSelector
        callSessions={callSessions}
        selectedSessionId={selectedCallSessionId}
        onSessionChange={onCallSessionChange}
      />

      <ContactsSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      <ContactsTable
        contacts={filteredContacts}
        onAttendanceChange={handleAttendanceChange}
        onCommentsChange={handleCommentsChange}
        maskLastName={maskLastName}
        maskPhoneNumber={maskPhoneNumber}
      />

      {filteredContacts.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-500">No contacts found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ContactsList;
