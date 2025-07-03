
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types/auth";

export const useContactListMutations = () => {
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

  return {
    updateContactMutation,
    updateCallSessionMutation
  };
};
