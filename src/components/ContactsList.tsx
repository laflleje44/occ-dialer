
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Contact, CallSession } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ContactsListHeader from "./ContactsListHeader";
import ContactsTable from "./ContactsTable";
import EmptyContactsState from "./EmptyContactsState";
import CallSessionSelector from "./CallSessionSelector";
import CallerNumberSettings from "./CallerNumberSettings";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateContactMutation = useMutation({
    mutationFn: async ({ contactId, updates }: { contactId: string; updates: Partial<Contact> }) => {
      console.log('Updating contact:', contactId, 'with updates:', updates);
      
      // Map frontend fields to database fields
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };
      
      if (updates.attending !== undefined) {
        dbUpdates.attending = updates.attending;
      }
      
      if (updates.comments !== undefined) {
        dbUpdates.comments = updates.comments;
      }
      
      console.log('Database updates being sent:', dbUpdates);
      
      const { data, error } = await supabase
        .from('contacts')
        .update(dbUpdates)
        .eq('id', contactId)
        .select();
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Contact updated successfully, returned data:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Mutation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Contact updated",
        description: "Contact information has been saved successfully."
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error updating contact",
        description: "There was an error updating the contact. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Filter contacts by selected call session
  const sessionContacts = selectedCallSessionId 
    ? contacts.filter(contact => contact.call_session_id === selectedCallSessionId)
    : contacts;

  const filteredContacts = sessionContacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterAttending === "all" || contact.attending === filterAttending;

    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Sort by first name first, then by last name
    const firstNameComparison = a.firstName.localeCompare(b.firstName);
    if (firstNameComparison !== 0) {
      return firstNameComparison;
    }
    return a.lastName.localeCompare(b.lastName);
  });

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
    
    updateContactMutation.mutate({
      contactId: contactId,
      updates: { comments }
    });
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

          <ContactsTable
            contacts={filteredContacts}
            onCall={handleCall}
            onAttendingChange={handleAttendingChange}
            onCommentsChange={handleCommentsChange}
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
