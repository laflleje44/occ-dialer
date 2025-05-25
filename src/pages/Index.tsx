
import { useState } from "react";
import Header from "@/components/Header";
import UploadContacts from "@/components/UploadContacts";
import ContactsList from "@/components/ContactsList";
import Reports from "@/components/Reports";

export interface Contact {
  id: string;
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  comments: string;
  attending: "yes" | "no";
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [contacts, setContacts] = useState<Contact[]>([]);

  const handleContactsImported = (importedContacts: Contact[]) => {
    setContacts(importedContacts);
    setActiveTab("contacts");
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "upload":
        return <UploadContacts onContactsImported={handleContactsImported} />;
      case "contacts":
        return <ContactsList contacts={contacts} />;
      case "reports":
        return <Reports contacts={contacts} />;
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
        Secure Call Manager v1.0 - All calls are logged and monitored for quality assurance
      </footer>
    </div>
  );
};

export default Index;
