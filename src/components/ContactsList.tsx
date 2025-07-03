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
import CallStatusBar, { CallStatus } from "./CallStatusBar";

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
  const [callStatuses, setCallStatuses] = useState<CallStatus[]>([]);
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
      
      if (updates.call_initiated !== undefined) {
        dbUpdates.call_initiated = updates.call_initiated;
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
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
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

  const updateCallSessionMutation = useMutation({
    mutationFn: async ({ callSessionId, comments }: { callSessionId: string; comments: string }) => {
      console.log('Updating call session SMS content:', callSessionId, 'with comments:', comments);
      
      // First, check if SMS record exists for this call session
      const { data: existingSms, error: selectError } = await supabase
        .from('call_session_sms')
        .select('*')
        .eq('call_session_id', callSessionId)
        .maybeSingle();
      
      if (selectError) {
        console.error('Error checking existing SMS:', selectError);
        throw selectError;
      }

      if (existingSms) {
        // Update existing SMS record
        const { data, error } = await supabase
          .from('call_session_sms')
          .update({
            sms_content: comments,
            updated_at: new Date().toISOString()
          })
          .eq('call_session_id', callSessionId)
          .select();
        
        if (error) throw error;
        return data;
      } else {
        // Create new SMS record
        const { data, error } = await supabase
          .from('call_session_sms')
          .insert({
            call_session_id: callSessionId,
            sms_content: comments
          })
          .select();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      console.log('Call session SMS updated successfully');
      queryClient.invalidateQueries({ queryKey: ['call-sessions'] });
    },
    onError: (error) => {
      console.error('Error updating call session SMS:', error);
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

  const handleStatusUpdate = (status: CallStatus) => {
    setCallStatuses(prev => {
      const existingIndex = prev.findIndex(s => s.id === status.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = status;
        return updated;
      }
      return [...prev, status];
    });
  };

  const handleClearStatus = (id: string) => {
    setCallStatuses(prev => prev.filter(status => status.id !== id));
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
