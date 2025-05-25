
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types/auth";

export const useContactUpdates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateContactMutation = useMutation({
    mutationFn: async ({ contactId, updates }: { contactId: string, updates: Partial<Contact> }) => {
      console.log('Updating contact:', contactId, updates);
      
      // Map frontend fields to database fields
      const dbUpdates: any = {};
      if (updates.attending !== undefined) {
        dbUpdates.attending = updates.attending;
      }
      if (updates.comments !== undefined) {
        dbUpdates.comments = updates.comments;
      }
      if (updates.firstName !== undefined) {
        dbUpdates.first_name = updates.firstName;
      }
      if (updates.lastName !== undefined) {
        dbUpdates.last_name = updates.lastName;
      }
      if (updates.phone !== undefined) {
        dbUpdates.phone = updates.phone;
      }
      if (updates.email !== undefined) {
        dbUpdates.email = updates.email;
      }

      const { data, error } = await supabase
        .from('contacts')
        .update(dbUpdates)
        .eq('id', contactId)
        .select()
        .single();
      
      if (error) {
        console.error('Database update error:', error);
        throw error;
      }
      
      console.log('Contact updated successfully:', data);
      return data;
    },
    onMutate: async ({ contactId, updates }) => {
      console.log('Starting optimistic update for contact:', contactId, 'with updates:', updates);
      
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['contacts'] });

      // Snapshot the previous value
      const previousContacts = queryClient.getQueryData(['contacts']);

      // Optimistically update to the new value for this specific contact only
      queryClient.setQueryData(['contacts'], (old: Contact[] | undefined) => {
        if (!old) return old;
        
        const updatedContacts = old.map(contact => {
          if (contact.id === contactId) {
            console.log('Optimistically updating contact:', contact.id, 'from:', contact, 'to:', { ...contact, ...updates });
            return { ...contact, ...updates };
          }
          return contact;
        });
        
        console.log('Updated contacts array:', updatedContacts);
        return updatedContacts;
      });

      // Return a context object with the snapshotted value
      return { previousContacts, contactId, updates };
    },
    onError: (error, variables, context) => {
      console.error('Update mutation error:', error);
      
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousContacts) {
        queryClient.setQueryData(['contacts'], context.previousContacts);
      }
      
      toast({
        title: "Error updating contact",
        description: "There was an error updating the contact. Please try again.",
        variant: "destructive"
      });
    },
    onSuccess: (data, variables, context) => {
      console.log('Update mutation success for contact:', data.id, 'data:', data);
      
      // Update the cache with the actual response from the server for this specific contact
      queryClient.setQueryData(['contacts'], (old: Contact[] | undefined) => {
        if (!old) return old;
        return old.map(contact => 
          contact.id === data.id 
            ? {
                ...contact,
                id: data.id,
                firstName: data.first_name,
                lastName: data.last_name,
                phone: data.phone,
                email: data.email,
                comments: data.comments,
                attending: data.attending
              }
            : contact
        );
      });
    },
    onSettled: () => {
      // Invalidate and refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  const handleAttendanceChange = (contact: Contact, checked: boolean) => {
    console.log('Attendance change for contact ID:', contact.id, 'checked:', checked, 'contact:', contact.firstName);
    const attending = checked ? "yes" : "no";
    updateContactMutation.mutate({
      contactId: contact.id,
      updates: { attending }
    });
  };

  const handleCommentsChange = (contact: Contact, comments: string) => {
    console.log('Comments change for contact ID:', contact.id, 'comments:', comments, 'contact:', contact.firstName);
    updateContactMutation.mutate({
      contactId: contact.id,
      updates: { comments }
    });
  };

  return {
    handleAttendanceChange,
    handleCommentsChange,
    isUpdating: updateContactMutation.isPending
  };
};
