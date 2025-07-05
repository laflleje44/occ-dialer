import { Phone, Upload, Users, FileText, LogOut, MessageSquare, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "./UserAvatar";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin?: boolean;
}

const Header = ({ activeTab, setActiveTab, isAdmin = false }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleAdminClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  };

  const adminTabs = [
    { id: "upload", label: "Upload Contacts", icon: Upload },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "sms", label: "SMS Management", icon: MessageSquare },
    { id: "dialer", label: "Dialer", icon: Users },
  ];

  const getActiveTabLabel = () => {
    const activeTabInfo = adminTabs.find(tab => tab.id === activeTab);
    return activeTabInfo ? activeTabInfo.label : "Menu";
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">OCC Secure Dialer</h1>
              <p className="text-sm text-gray-600">Privacy-focused calling solution</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">System Ready</span>
            </div>
            {user && (
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome, {user.first_name || user.email}
              </span>
            )}
            {user?.role === 'admin' && !isAdmin && (
              <Button variant="outline" size="sm" onClick={handleAdminClick}>
                Admin
              </Button>
            )}
            <UserAvatar />
          </div>
        </div>
        
        <nav className="border-b">
          {isAdmin ? (
            <>
              {/* Mobile dropdown */}
              {isMobile ? (
                <div className="py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span className="flex items-center space-x-2">
                          <Menu className="w-4 h-4" />
                          <span>{getActiveTabLabel()}</span>
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      {adminTabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                          <DropdownMenuItem
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 ${
                              activeTab === tab.id ? "bg-green-50 text-green-600" : ""
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span>{tab.label}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                /* Desktop tabs */
                <div className="flex space-x-0 overflow-x-auto">
                  {adminTabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === tab.id
                            ? "border-green-500 text-green-600 bg-green-50"
                            : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="flex space-x-0">
              <button
                onClick={() => setActiveTab("dialer")}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === "dialer"
                    ? "border-green-500 text-green-600 bg-green-50"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Dialer</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
