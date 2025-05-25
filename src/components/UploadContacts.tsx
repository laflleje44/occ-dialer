
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { file } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/pages/Index";

interface UploadContactsProps {
  onContactsImported: (contacts: Contact[]) => void;
}

const UploadContacts = ({ onContactsImported }: UploadContactsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): Contact[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const contacts: Contact[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      const contact: Contact = {
        id: crypto.randomUUID(),
        lastName: values[headers.indexOf('last name')] || values[headers.indexOf('lastname')] || '',
        firstName: values[headers.indexOf('name')] || values[headers.indexOf('first name')] || values[headers.indexOf('firstname')] || '',
        phone: values[headers.indexOf('phone')] || '',
        email: values[headers.indexOf('email')] || '',
        comments: values[headers.indexOf('comments')] || '',
        attending: (values[headers.indexOf('attending')] || 'no').toLowerCase() === 'yes' ? 'yes' : 'no'
      };

      if (contact.phone) {
        contacts.push(contact);
      }
    }

    return contacts;
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const contacts = parseCSV(text);
        if (contacts.length === 0) {
          toast({
            title: "No valid contacts found",
            description: "Please check your CSV format and ensure it has the required columns.",
            variant: "destructive"
          });
          return;
        }
        
        onContactsImported(contacts);
        toast({
          title: "Contacts imported successfully",
          description: `${contacts.length} contacts have been imported.`
        });
      } catch (error) {
        toast({
          title: "Error parsing CSV",
          description: "Please check your file format and try again.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const loadDemoData = () => {
    const demoContacts: Contact[] = [
      {
        id: "1",
        lastName: "Smith",
        firstName: "John",
        phone: "+1 555-0101",
        email: "john.smith@email.com",
        comments: "Prefers morning calls",
        attending: "yes"
      },
      {
        id: "2",
        lastName: "Johnson",
        firstName: "Sarah",
        phone: "+1 555-0102",
        email: "sarah.j@email.com",
        comments: "Decision maker",
        attending: "no"
      },
      {
        id: "3",
        lastName: "Williams",
        firstName: "Mike",
        phone: "+1 555-0103",
        email: "mike.w@email.com",
        comments: "Follow up needed",
        attending: "yes"
      }
    ];
    
    onContactsImported(demoContacts);
    toast({
      title: "Demo data loaded",
      description: "3 sample contacts have been loaded for testing."
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Upload Contact List</h2>
        <p className="text-gray-600">
          Upload a CSV file with your contact information (columns: last name, name, phone, email, comments, attending). Only names will be visible to callers.
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? "border-green-400 bg-green-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <file className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h3>
            <p className="text-gray-500 mb-4">Drag and drop your file here or click to browse</p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Browse Files
            </Button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex justify-between items-center mt-8">
        <Button
          onClick={loadDemoData}
          variant="outline"
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          Load Demo Data
        </Button>
        <Button className="bg-green-600 hover:bg-green-700">
          Upload Contacts
        </Button>
      </div>
    </div>
  );
};

export default UploadContacts;
