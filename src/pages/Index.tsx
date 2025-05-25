
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import UploadContacts from "@/components/UploadContacts";
import ContactsList from "@/components/ContactsList";
import { Contact } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("upload");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user?.id);
      
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

  const saveContactsMutation = useMutation({
    mutationFn: async (newContacts: Contact[]) => {
      const contactsWithUserId = newContacts.map(contact => ({
        ...contact,
        user_id: user?.id,
        last_name: contact.lastName,
        first_name: contact.firstName
      }));

      const { error } = await supabase
        .from('contacts')
        .insert(contactsWithUserId);
      
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

  const handleContactsImported = (importedContacts: Contact[]) => {
    saveContactsMutation.mutate(importedContacts);
    setActiveTab("dialer");
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
        return <ContactsList contacts={contacts} />;
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
