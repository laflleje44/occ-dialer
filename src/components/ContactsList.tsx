import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Contact, CallSession } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";
import { makeCall } from "@/services/ringCentralService";
import ContactsListHeader from "./ContactsListHeader";
import ContactsTable from "./ContactsTable";
import CallSessionSelector from "./CallSessionSelector";
import CallerNumberSettings from "./CallerNumberSettings";
import EmptyContactsState from "./EmptyContactsState";

interface ContactsListProps {
  contacts: Contact[];
  callSessions: CallSession[];
}

const ContactsList = ({ contacts, callSessions }: ContactsListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCallSessionId, setSelectedCallSessionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [attendingFilter, setAttendingFilter] = useState("all");

  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    if (selectedCallSessionId) {
      filtered = filtered.filter(contact => contact.call_session_id === selectedCallSessionId);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.firstName.toLowerCase().includes(lowerSearchTerm) ||
        contact.lastName.toLowerCase().includes(lowerSearchTerm) ||
        contact.phone.includes(searchTerm) ||
        (contact.email?.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    if (attendingFilter !== "all") {
      filtered = filtered.filter(contact => contact.attending === attendingFilter);
    }

    return filtered;
  }, [contacts, selectedCallSessionId, searchTerm, statusFilter, attendingFilter]);

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, attending, comments }: { id: string; attending: string; comments: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update({ attending, comments })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
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

  const handleCall = async (contact: Contact) => {
    try {
      await makeCall(contact.phone);
      
      // Optimistically update the contact's status
      queryClient.setQueryData(['contacts'], (old: any) => {
        return old?.map((c: Contact) => {
          if (c.id === contact.id) {
            return { ...c, status: 'called', last_called: new Date().toISOString() };
          }
          return c;
        });
      });

      // Update the contact's status in the database
      const { error } = await supabase
        .from('contacts')
        .update({ status: 'called', last_called: new Date().toISOString() })
        .eq('id', contact.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Calling...",
        description: `Calling ${contact.firstName} ${contact.lastName}`
      });
    } catch (error: any) {
      toast({
        title: "Error calling contact",
        description: error.message || "Failed to initiate call. Please try again.",
        variant: "destructive"
      });
      console.error('Error making call:', error);
    }
  };

  const handleAttendingChange = (contactId: string, checked: boolean | string) => {
    const attendingValue = typeof checked === 'boolean' ? (checked ? 'yes' : 'no') : checked;

    updateContactMutation.mutate({
      id: contactId,
      attending: attendingValue as string,
      comments: contacts.find(c => c.id === contactId)?.comments || ''
    });
  };

  const handleCommentsChange = (contactId: string, comments: string) => {
    updateContactMutation.mutate({
      id: contactId,
      attending: contacts.find(c => c.id === contactId)?.attending || 'no',
      comments: comments
    });
  };

  return (
    <div className="space-y-6">
      <CallerNumberSettings />
      
      <CallSessionSelector
        callSessions={callSessions}
        selectedCallSessionId={selectedCallSessionId}
        onCallSessionChange={setSelectedCallSessionId}
      />

      {filteredContacts.length === 0 ? (
        <EmptyContactsState 
          hasCallSessions={callSessions.length > 0}
          selectedCallSessionId={selectedCallSessionId}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          attendingFilter={attendingFilter}
        />
      ) : (
        <>
          <ContactsListHeader
            totalContacts={filteredContacts.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            attendingFilter={attendingFilter}
            onAttendingFilterChange={setAttendingFilter}
          />
          
          <ContactsTable
            contacts={filteredContacts}
            onCall={handleCall}
            onAttendingChange={handleAttendingChange}
            onCommentsChange={handleCommentsChange}
          />
        </>
      )}
    </div>
  );
};

export default ContactsList;
