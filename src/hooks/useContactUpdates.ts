
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types/auth";

export const useContactUpdates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateContactMutation = useMutation({
    mutationFn: async ({ contactId, updates }: { contactId: string, updates: Partial<Contact> }) => {
      const { error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', contactId);
      
      if (error) throw error;
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

  const handleAttendanceChange = (contact: Contact, checked: boolean) => {
    const attending = checked ? "yes" : "no";
    updateContactMutation.mutate({
      contactId: contact.id,
      updates: { attending }
    });
  };

  const handleCommentsChange = (contact: Contact, comments: string) => {
    updateContactMutation.mutate({
      contactId: contact.id,
      updates: { comments }
    });
  };

  return {
    handleAttendanceChange,
    handleCommentsChange
  };
};
