
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Contact, CallSession } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ContactsListHeader from "./ContactsListHeader";
import ContactsTable from "./ContactsTable";
import EmptyContactsState from "./EmptyContactsState";
import CallSessionSelector from "./CallSessionSelector";

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
      
      const { error } = await supabase
        .from('contacts')
        .update({
          attending: updates.attending,
          comments: updates.comments,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId);
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Contact updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Contact updated",
        description: "Contact information has been saved successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating contact",
        description: "There was an error updating the contact. Please try again.",
        variant: "destructive"
      });
      console.error('Error updating contact:', error);
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

  if (callSessions.length === 0) {
    return <EmptyContactsState />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <CallSessionSelector
        callSessions={callSessions}
        selectedCallSessionId={selectedCallSessionId}
        onCallSessionChange={setSelectedCallSessionId}
      />

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
    </div>
  );
};

export default ContactsList;
