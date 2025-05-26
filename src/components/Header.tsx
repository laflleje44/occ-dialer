
import { Phone, Upload, Users, FileText, LogOut, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin?: boolean;
}

const Header = ({ activeTab, setActiveTab, isAdmin = false }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleAdminClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  };

  const handleUserViewClick = () => {
    navigate('/');
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
              <span className="text-sm text-gray-600">
                Welcome, {user.first_name || user.email}
              </span>
            )}
            {user?.role === 'admin' && !isAdmin && (
              <Button variant="outline" size="sm" onClick={handleAdminClick}>
                Admin
              </Button>
            )}
            {user?.role === 'admin' && isAdmin && (
              <Button variant="outline" size="sm" onClick={handleUserViewClick}>
                <User className="w-4 h-4 mr-2" />
                Main Dashboard
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
        
        <nav className="flex space-x-0 border-b">
          {isAdmin ? (
            <>
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === "upload"
                    ? "border-green-500 text-green-600 bg-green-50"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Contacts</span>
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === "reports"
                    ? "border-green-500 text-green-600 bg-green-50"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Reports</span>
              </button>
              <button
                onClick={() => setActiveTab("sms")}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === "sms"
                    ? "border-green-500 text-green-600 bg-green-50"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>SMS Management</span>
              </button>
            </>
          ) : (
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
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
