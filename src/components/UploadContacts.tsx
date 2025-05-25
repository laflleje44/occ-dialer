
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types/auth";
import { useCallSessions } from "@/hooks/useCallSessions";

interface UploadContactsProps {
  onContactsImported: (contacts: Contact[], callSessionId: string) => void;
}

const UploadContacts = ({ onContactsImported }: UploadContactsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [callSessionName, setCallSessionName] = useState("");
  const [parsedContacts, setParsedContacts] = useState<Contact[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { createCallSession, isCreating } = useCallSessions();

  const parseCSV = (text: string): Contact[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const contacts: Contact[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      const contact: Contact = {
        id: crypto.randomUUID(),
        user_id: '', // Will be set when saving to database
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
        
        setParsedContacts(contacts);
        setCallSessionName(file.name.replace('.csv', ''));
        toast({
          title: "File parsed successfully",
          description: `${contacts.length} contacts found. Please enter a call session name and upload.`
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

  const handleUpload = () => {
    if (!callSessionName.trim()) {
      toast({
        title: "Call session name required",
        description: "Please enter a name for this call session.",
        variant: "destructive"
      });
      return;
    }

    if (parsedContacts.length === 0) {
      toast({
        title: "No contacts to upload",
        description: "Please select a CSV file first.",
        variant: "destructive"
      });
      return;
    }

    createCallSession(callSessionName.trim(), {
      onSuccess: (callSession) => {
        onContactsImported(parsedContacts, callSession.id);
        setParsedContacts([]);
        setCallSessionName("");
      }
    });
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
            <File className="w-8 h-8 text-gray-400" />
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

      {parsedContacts.length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Ready to Upload {parsedContacts.length} Contacts
          </h3>
          <div className="mb-4">
            <label htmlFor="session-name" className="block text-sm font-medium text-gray-700 mb-2">
              Call Session Name
            </label>
            <Input
              id="session-name"
              type="text"
              value={callSessionName}
              onChange={(e) => setCallSessionName(e.target.value)}
              placeholder="Enter a name for this call session"
              className="max-w-md"
            />
          </div>
          <Button 
            onClick={handleUpload}
            disabled={isCreating || !callSessionName.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isCreating ? "Creating..." : "Create Call Session & Upload Contacts"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadContacts;
