
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
    onSuccess: (data) => {
      console.log('Update mutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Contact updated",
        description: "Contact information has been updated successfully."
      });
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
      toast({
        title: "Error updating contact",
        description: "There was an error updating the contact. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAttendanceChange = (contact: Contact, checked: boolean) => {
    console.log('Attendance change:', contact.id, checked);
    const attending = checked ? "yes" : "no";
    updateContactMutation.mutate({
      contactId: contact.id,
      updates: { attending }
    });
  };

  const handleCommentsChange = (contact: Contact, comments: string) => {
    console.log('Comments change:', contact.id, comments);
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
