
import React, { useState } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import UserAccountDialog from './UserAccountDialog';

const UserAvatar = () => {
  const { user, signOut, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [showAccountDialog, setShowAccountDialog] = useState(false);

  if (!user) return null;

  const getInitials = () => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleUserUpdate = async () => {
    // Refresh user data from the database to show changes immediately
    await refreshUser();
    console.log('User data refreshed');
  };

  const handleAppearanceClick = () => {
    navigate('/appearance');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-green-500 text-white font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuItem onClick={() => setShowAccountDialog(true)}>
            <User className="mr-2 h-4 w-4" />
            My Account
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAppearanceClick}>
            <Settings className="mr-2 h-4 w-4" />
            Appearance
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserAccountDialog 
        open={showAccountDialog} 
        onOpenChange={setShowAccountDialog}
        user={user}
        onUserUpdate={handleUserUpdate}
      />
    </>
  );
};

export default UserAvatar;
