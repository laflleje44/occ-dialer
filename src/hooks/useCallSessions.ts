
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CallSession } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";

export const useCallSessions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: callSessions = [] } = useQuery({
    queryKey: ['callSessions'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('call_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CallSession[];
    },
    enabled: !!user
  });

  const createCallSessionMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('call_sessions')
        .insert({
          user_id: user.id,
          name,
          contact_count: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as CallSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callSessions'] });
    },
    onError: (error) => {
      toast({
        title: "Error creating call session",
        description: "There was an error creating the call session. Please try again.",
        variant: "destructive"
      });
      console.error('Error creating call session:', error);
    }
  });

  const updateCallSessionContactCountMutation = useMutation({
    mutationFn: async ({ sessionId, contactCount }: { sessionId: string, contactCount: number }) => {
      const { error } = await supabase
        .from('call_sessions')
        .update({ contact_count: contactCount })
        .eq('id', sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callSessions'] });
    }
  });

  return {
    callSessions,
    createCallSession: createCallSessionMutation.mutateAsync,
    updateCallSessionContactCount: updateCallSessionContactCountMutation.mutate,
    isCreating: createCallSessionMutation.isPending
  };
};
