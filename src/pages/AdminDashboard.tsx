
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Reports from '@/components/Reports';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/auth';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("reports");

  const { data: allContacts = [] } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*');
      
      if (error) throw error;
      return data as Contact[];
    },
    enabled: !!user && user.role === 'admin'
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={true} />
      <main className="container mx-auto px-4 py-8">
        <Reports contacts={allContacts} />
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        OCC Secure Dialer v1.2 - All calls are logged and monitored for quality assurance
      </footer>
    </div>
  );
};

export default AdminDashboard;
