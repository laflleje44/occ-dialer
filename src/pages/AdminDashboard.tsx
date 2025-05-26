
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Reports from '@/components/Reports';
import SMSManager from '@/components/SMSManager';
import UploadContacts from '@/components/UploadContacts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contact, CallSession } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("upload");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allContacts = [] } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*');
      
      if (error) throw error;
      
      // Map database fields to Contact interface
      return data.map(contact => ({
        ...contact,
        firstName: contact.first_name,
        lastName: contact.last_name
      })) as Contact[];
    },
    enabled: !!user && user.role === 'admin'
  });

  const { data: allCallSessions = [] } = useQuery({
    queryKey: ['admin-call-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('call_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as CallSession[];
    },
    enabled: !!user && user.role === 'admin'
  });

  const createCallSessionMutation = useMutation({
    mutationFn: async ({ name, contactCount }: { name: string; contactCount: number }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('call_sessions')
        .insert({
          user_id: user.id,
          name,
          contact_count: contactCount
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-call-sessions'] });
    }
  });

  const saveContactsMutation = useMutation({
    mutationFn: async ({ newContacts, callSessionId }: { newContacts: Contact[]; callSessionId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const contactsForDatabase = newContacts.map(contact => ({
        user_id: user.id,
        first_name: contact.firstName,
        last_name: contact.lastName,
        phone: contact.phone,
        email: contact.email,
        comments: contact.comments,
        attending: contact.attending,
        call_session_id: callSessionId,
        status: 'not called'
      }));

      const { error } = await supabase
        .from('contacts')
        .insert(contactsForDatabase);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
      toast({
        title: "Contacts saved",
        description: "Your contacts have been saved to the database."
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving contacts",
        description: "There was an error saving your contacts. Please try again.",
        variant: "destructive"
      });
      console.error('Error saving contacts:', error);
    }
  });

  const handleContactsImported = async (importedContacts: Contact[], sessionName: string) => {
    try {
      const callSession = await createCallSessionMutation.mutateAsync({
        name: sessionName,
        contactCount: importedContacts.length
      });
      
      // Save contacts with the call session ID
      await saveContactsMutation.mutateAsync({
        newContacts: importedContacts,
        callSessionId: callSession.id
      });
      
      setActiveTab("reports");
    } catch (error) {
      console.error('Error creating call session:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={true} />
      <main className="container mx-auto px-4 py-8">
        {activeTab === "upload" && (
          <UploadContacts onContactsImported={handleContactsImported} />
        )}
        {activeTab === "reports" && (
          <Reports contacts={allContacts} callSessions={allCallSessions} />
        )}
        {activeTab === "sms" && (
          <SMSManager callSessions={allCallSessions} />
        )}
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        OCC Secure Dialer v1.2 - All calls are logged and monitored for quality assurance
      </footer>
    </div>
  );
};

export default AdminDashboard;
