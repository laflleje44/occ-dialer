
import { useState } from "react";
import { Contact, CallSession } from "@/types/auth";
import ContactsListHeader from "./ContactsListHeader";
import ContactsTable from "./ContactsTable";
import EmptyContactsState from "./EmptyContactsState";
import CallSessionSelector from "./CallSessionSelector";
import CallerNumberSettings from "./CallerNumberSettings";
import CallStatusBar from "./CallStatusBar";
import { useContactListMutations } from "@/hooks/useContactListMutations";
import { useContactFiltering } from "@/hooks/useContactFiltering";
import { useCallStatusManagement } from "@/hooks/useCallStatusManagement";

interface ContactsListProps {
  contacts: Contact[];
  callSessions: CallSession[];
}

const ContactsList = ({ contacts, callSessions }: ContactsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAttending, setFilterAttending] = useState<"all" | "yes" | "no">("all");
  const [selectedCallSessionId, setSelectedCallSessionId] = useState<string | null>(
    callSessions.length > 0 ? callSessions[0].id : null
  );

  const { updateContactMutation, updateCallSessionMutation } = useContactListMutations();
  const { filteredContacts } = useContactFiltering({
    contacts,
    selectedCallSessionId,
    searchTerm,
    filterAttending
  });
  const { callStatuses, handleStatusUpdate, handleClearStatus } = useCallStatusManagement();

  const handleCall = (contact: Contact) => {
    // This is now just for logging purposes since the actual call is handled in ContactRow
    console.log(`Call logged for: ${contact.phone} - ${contact.firstName} ${contact.lastName}`);
  };

  const handleAttendingChange = (contactId: string, checked: boolean | string) => {
    console.log('Checkbox changed for contact:', contactId, 'checked:', checked);
    
    const newAttending = checked === true ? "yes" : "no";
    console.log('Setting attending to:', newAttending);
    
    updateContactMutation.mutate({
      contactId: contactId,
      updates: { attending: newAttending }
    });
  };

  const handleCommentsChange = (contactId: string, comments: string) => {
    console.log('Comments changed for contact:', contactId, 'comments:', comments);
    
    // Find the contact to get the call session ID
    const contact = contacts.find(c => c.id === contactId);
    
    // Update the contact record
    updateContactMutation.mutate({
      contactId: contactId,
      updates: { comments }
    });

    // Also update the call session SMS content if the contact has a call session
    if (contact?.call_session_id) {
      updateCallSessionMutation.mutate({
        callSessionId: contact.call_session_id,
        comments: comments
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Caller ID Settings - show at the top of dialer tab */}
      <CallerNumberSettings />

      {/* Always show the call session selector */}
      <CallSessionSelector
        callSessions={callSessions}
        selectedCallSessionId={selectedCallSessionId}
        onCallSessionChange={setSelectedCallSessionId}
      />

      {callSessions.length === 0 ? (
        <EmptyContactsState />
      ) : (
        <>
          <ContactsListHeader 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Call Status Bar - moved to above the contacts table */}
          <CallStatusBar 
            callStatuses={callStatuses}
            onClearStatus={handleClearStatus}
          />

          <ContactsTable
            contacts={filteredContacts}
            onCall={handleCall}
            onAttendingChange={handleAttendingChange}
            onCommentsChange={handleCommentsChange}
            onStatusUpdate={handleStatusUpdate}
          />

          {filteredContacts.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-gray-500">No contacts found matching your search criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContactsList;
