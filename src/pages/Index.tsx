
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ContactsList from "@/components/ContactsList";
import { Contact, CallSession } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dialer");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      window.location.href = '/admin';
    }
  }, [user]);

  const { data: callSessions = [], isLoading: callSessionsLoading, error: callSessionsError } = useQuery({
    queryKey: ['callSessions'],
    queryFn: async () => {
      console.log('Fetching call sessions for regular user...');
      const { data, error } = await supabase
        .from('call_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching call sessions:', error);
        throw error;
      }
      
      console.log('Call sessions fetched:', data);
      return data as CallSession[];
    },
    enabled: !!user
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      console.log('Fetching contacts...');
      const { data, error } = await supabase
        .from('contacts')
        .select('*');
      
      if (error) {
        console.error('Error fetching contacts:', error);
        throw error;
      }
      
      console.log('Contacts fetched:', data?.length || 0, 'contacts');
      // Map database fields to Contact interface
      return data.map(contact => ({
        ...contact,
        firstName: contact.first_name,
        lastName: contact.last_name
      })) as Contact[];
    },
    enabled: !!user
  });

  // Add some debugging logs
  useEffect(() => {
    if (user) {
      console.log('User authenticated:', user);
      console.log('Call sessions loading:', callSessionsLoading);
      console.log('Call sessions error:', callSessionsError);
      console.log('Call sessions data:', callSessions);
    }
  }, [user, callSessionsLoading, callSessionsError, callSessions]);

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

  // If user is admin, they should be redirected to admin dashboard
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        <ContactsList contacts={contacts} callSessions={callSessions} />
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        OCC Secure Dialer v1.2 - All calls are logged and monitored for quality assurance
      </footer>
    </div>
  );
};

export default Index;
