
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { KeyRound } from 'lucide-react';

interface UserAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

const UserAccountDialog = ({ open, onOpenChange, user }: UserAccountDialogProps) => {
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async () => {
    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password."
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>My Account</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {user.first_name || 'Not provided'}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {user.last_name || 'Not provided'}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              Not available
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
              {user.email}
            </p>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              onClick={handleResetPassword}
              disabled={isResettingPassword}
              variant="outline"
              className="w-full"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              {isResettingPassword ? 'Sending...' : 'Reset Password'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserAccountDialog;
