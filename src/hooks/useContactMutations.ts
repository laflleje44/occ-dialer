
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useContactMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateContactStatusMutation = useMutation({
    mutationFn: async ({ contactId, status }: { contactId: string; status: string }) => {
      console.log('Updating contact status:', contactId, 'to:', status);
      
      const { error } = await supabase
        .from('contacts')
        .update({
          status,
          last_called: new Date().toISOString(),
          status_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId);
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Contact status updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    }
  });

  return { updateContactStatusMutation };
};
