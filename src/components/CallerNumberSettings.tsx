
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Phone, Edit2, Save, X } from 'lucide-react';

interface UserRingCentralSettings {
  id: string;
  user_id: string;
  caller_number: string;
  created_at: string;
  updated_at: string;
}

const CallerNumberSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const { data: callerSettings } = useQuery({
    queryKey: ['user-ringcentral-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_ringcentral_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data as UserRingCentralSettings | null;
    },
    enabled: !!user?.id
  });

  const updateCallerNumberMutation = useMutation({
    mutationFn: async (callerNumber: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_ringcentral_settings')
        .upsert({
          user_id: user.id,
          caller_number: callerNumber
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-ringcentral-settings'] });
      setIsEditing(false);
      toast({
        title: "Caller number updated",
        description: "Your caller ID number has been saved successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating caller number",
        description: "There was an error saving your caller ID number. Please try again.",
        variant: "destructive"
      });
      console.error('Error updating caller number:', error);
    }
  });

  const handleEdit = () => {
    setEditValue(callerSettings?.caller_number || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editValue.trim()) {
      toast({
        title: "Invalid number",
        description: "Please enter a valid phone number.",
        variant: "destructive"
      });
      return;
    }
    updateCallerNumberMutation.mutate(editValue.trim());
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const displayNumber = callerSettings?.caller_number || 'Not set';

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Phone className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Caller ID Number</h3>
            <p className="text-xs text-gray-500">The number that will appear when you make calls</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="+1234567890"
                className="w-40"
                autoFocus
              />
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={updateCallerNumberMutation.isPending}
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCancel}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {displayNumber}
              </span>
              <Button size="sm" variant="outline" onClick={handleEdit}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallerNumberSettings;
