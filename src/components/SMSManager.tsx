
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CallSession } from "@/types/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Save } from "lucide-react";

interface SMSManagerProps {
  callSessions: CallSession[];
}

interface CallSessionSMS {
  id: string;
  call_session_id: string;
  sms_content: string;
  created_at: string;
  updated_at: string;
}

const SMSManager = ({ callSessions }: SMSManagerProps) => {
  const [selectedCallSessionId, setSelectedCallSessionId] = useState<string>("");
  const [smsContent, setSmsContent] = useState<string>("");
  const queryClient = useQueryClient();

  // Query to get SMS content for all call sessions
  const { data: smsData = [] } = useQuery({
    queryKey: ['call-session-sms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('call_session_sms')
        .select('*');
      
      if (error) throw error;
      
      return data as CallSessionSMS[];
    }
  });

  // Get the SMS content for the selected call session
  const selectedSmsData = smsData.find(sms => sms.call_session_id === selectedCallSessionId);

  // Update SMS content when a new call session is selected
  const handleCallSessionChange = (callSessionId: string) => {
    setSelectedCallSessionId(callSessionId);
    const existingSms = smsData.find(sms => sms.call_session_id === callSessionId);
    setSmsContent(existingSms?.sms_content || 'Thank you for your time. Please confirm your attendance.');
  };

  // Mutation to save SMS content
  const saveSmsContentMutation = useMutation({
    mutationFn: async ({ callSessionId, content }: { callSessionId: string; content: string }) => {
      const existingSms = smsData.find(sms => sms.call_session_id === callSessionId);
      
      if (existingSms) {
        // Update existing SMS content
        const { error } = await supabase
          .from('call_session_sms')
          .update({ sms_content: content })
          .eq('call_session_id', callSessionId);
        
        if (error) throw error;
      } else {
        // Insert new SMS content
        const { error } = await supabase
          .from('call_session_sms')
          .insert({ call_session_id: callSessionId, sms_content: content });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-session-sms'] });
      console.log('SMS content saved successfully');
    },
    onError: (error) => {
      console.error('Failed to save SMS content:', error);
    }
  });

  const handleSaveSmsContent = () => {
    if (selectedCallSessionId && smsContent.trim()) {
      saveSmsContentMutation.mutate({ 
        callSessionId: selectedCallSessionId, 
        content: smsContent.trim() 
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">SMS Content Management</h2>
        
        {/* Call Session Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <label htmlFor="call-session-sms" className="text-sm font-medium text-gray-700">
              Select Call Session:
            </label>
            <Select value={selectedCallSessionId} onValueChange={handleCallSessionChange}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose a call session" />
              </SelectTrigger>
              <SelectContent>
                {callSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{session.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* SMS Content Editor */}
      {selectedCallSessionId && (
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">SMS Content</h3>
              <p className="text-sm text-gray-600">
                Customize the SMS message for this call session
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="sms-content" className="block text-sm font-medium text-gray-700 mb-2">
                Message Content
              </label>
              <Textarea
                id="sms-content"
                value={smsContent}
                onChange={(e) => setSmsContent(e.target.value)}
                placeholder="Enter your SMS message here..."
                rows={6}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Character count: {smsContent.length}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedSmsData ? (
                  <span>Last updated: {new Date(selectedSmsData.updated_at).toLocaleString()}</span>
                ) : (
                  <span>No SMS content saved for this session</span>
                )}
              </div>
              
              <Button 
                onClick={handleSaveSmsContent}
                disabled={!smsContent.trim() || saveSmsContentMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saveSmsContentMutation.isPending ? 'Saving...' : 'Save SMS Content'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!selectedCallSessionId && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Call Session</h3>
          <p className="text-gray-600">
            Choose a call session from the dropdown above to manage its SMS content.
          </p>
        </div>
      )}
    </div>
  );
};

export default SMSManager;
