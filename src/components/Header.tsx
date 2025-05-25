
import { upload, contacts, report } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Secure Call Manager</h1>
              <p className="text-sm text-gray-600">Privacy-focused calling solution</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">System Ready</span>
            </div>
            <Button variant="outline" size="sm">Admin</Button>
          </div>
        </div>
        
        <nav className="flex space-x-0 border-b">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === "upload"
                ? "border-green-500 text-green-600 bg-green-50"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <upload className="w-4 h-4" />
            <span>Upload Contacts</span>
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === "contacts"
                ? "border-green-500 text-green-600 bg-green-50"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <contacts className="w-4 h-4" />
            <span>Contacts</span>
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === "reports"
                ? "border-green-500 text-green-600 bg-green-50"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <report className="w-4 h-4" />
            <span>Reports</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
