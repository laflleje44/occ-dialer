
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Edit } from 'lucide-react';

interface UserAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

const UserAccountDialog = ({ open, onOpenChange, user }: UserAccountDialogProps) => {
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editField, setEditField] = useState<'phone' | 'email'>('phone');
  const [password, setPassword] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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

  const handleEditClick = (field: 'phone' | 'email') => {
    setEditField(field);
    setPassword('');
    setNewValue('');
    setShowPasswordPrompt(true);
  };

  const handlePasswordVerification = async () => {
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter your password.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Verify password by attempting to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password
      });

      if (error) {
        toast({
          title: "Incorrect password",
          description: "Incorrect password, please try again.",
          variant: "destructive"
        });
        return;
      }

      // Password is correct, show edit dialog
      setShowPasswordPrompt(false);
      setShowEditDialog(true);
    } catch (error) {
      console.error('Password verification error:', error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdateField = async () => {
    if (!newValue.trim()) {
      toast({
        title: "Error",
        description: `Please enter a new ${editField === 'phone' ? 'phone number' : 'email'}.`,
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      if (editField === 'email') {
        // Update email in auth
        const { error } = await supabase.auth.updateUser({
          email: newValue
        });
        
        if (error) throw error;
        
        toast({
          title: "Email update initiated",
          description: "Please check both your old and new email addresses to confirm the change."
        });
      } else {
        // Update phone in profiles table
        const { error } = await supabase
          .from('profiles')
          .update({ phone: newValue })
          .eq('id', user.id);
        
        if (error) throw error;
        
        toast({
          title: "Phone number updated",
          description: "Your phone number has been successfully updated."
        });
      }
      
      setShowEditDialog(false);
      setPassword('');
      setNewValue('');
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: `Failed to update ${editField === 'phone' ? 'phone number' : 'email'}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const closeAllDialogs = () => {
    setShowPasswordPrompt(false);
    setShowEditDialog(false);
    setPassword('');
    setNewValue('');
  };

  return (
    <>
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Phone Number (optional)</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick('phone')}
                  className="h-6 w-6 p-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {user.phone || 'Not provided'}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick('email')}
                  className="h-6 w-6 p-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
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

      {/* Password Verification Dialog */}
      <AlertDialog open={showPasswordPrompt} onOpenChange={closeAllDialogs}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Password</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter your password to edit your {editField === 'phone' ? 'phone number' : 'email'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordVerification();
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeAllDialogs}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePasswordVerification}
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Field Dialog */}
      <AlertDialog open={showEditDialog} onOpenChange={closeAllDialogs}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Edit {editField === 'phone' ? 'Phone Number' : 'Email'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Enter your new {editField === 'phone' ? 'phone number' : 'email address'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type={editField === 'email' ? 'email' : 'tel'}
              placeholder={editField === 'phone' ? 'Enter phone number' : 'Enter email address'}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateField();
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeAllDialogs}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUpdateField}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserAccountDialog;
