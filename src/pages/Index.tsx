
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import UploadContacts from "@/components/UploadContacts";
import ContactsList from "@/components/ContactsList";
import { Contact, CallSession } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("upload");
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

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Map database fields to Contact interface
      return data.map(contact => ({
        ...contact,
        firstName: contact.first_name,
        lastName: contact.last_name
      })) as Contact[];
    },
    enabled: !!user
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
      queryClient.invalidateQueries({ queryKey: ['callSessions'] });
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
        call_session_id: callSessionId
      }));

      const { error } = await supabase
        .from('contacts')
        .insert(contactsForDatabase);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
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

  const handleContactsImported = async (importedContacts: Contact[]) => {
    // Create a new call session
    const sessionName = `Call Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    
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
      
      setActiveTab("dialer");
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case "upload":
        return <UploadContacts onContactsImported={handleContactsImported} />;
      case "dialer":
        return <ContactsList contacts={contacts} callSessions={callSessions} />;
      default:
        return <UploadContacts onContactsImported={handleContactsImported} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {renderActiveTab()}
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        OCC Secure Dialer v1.2 - All calls are logged and monitored for quality assurance
      </footer>
    </div>
  );
};

export default Index;
