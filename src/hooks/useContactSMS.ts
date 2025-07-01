
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useContactSMS = (callSessionId?: string) => {
  const { data: smsContent } = useQuery({
    queryKey: ['call-session-sms', callSessionId],
    queryFn: async () => {
      if (!callSessionId) return null;
      
      const { data, error } = await supabase
        .from('call_session_sms')
        .select('sms_content')
        .eq('call_session_id', callSessionId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching SMS content:', error);
        return null;
      }
      
      return data?.sms_content || 'Thank you for your time. Please confirm your attendance.';
    },
    enabled: !!callSessionId
  });

  return { smsContent };
};
