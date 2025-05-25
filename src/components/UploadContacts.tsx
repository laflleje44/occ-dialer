import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types/auth";

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

    console.log('CSV Headers found:', headers);

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      // More flexible header matching for last name
      const lastNameIndex = headers.findIndex(h => 
        h.includes('last') && h.includes('name') || 
        h === 'lastname' || 
        h === 'surname' ||
        h === 'family name'
      );
      
      // More flexible header matching for first name
      const firstNameIndex = headers.findIndex(h => 
        (h.includes('first') && h.includes('name')) || 
        h === 'firstname' || 
        h === 'name' ||
        h === 'given name'
      );
      
      const phoneIndex = headers.findIndex(h => 
        h.includes('phone') || h.includes('mobile') || h.includes('tel')
      );
      
      const emailIndex = headers.findIndex(h => 
        h.includes('email') || h.includes('mail')
      );
      
      const commentsIndex = headers.findIndex(h => 
        h.includes('comment') || h.includes('note')
      );
      
      const attendingIndex = headers.findIndex(h => 
        h.includes('attend')
      );

      const contact: Contact = {
        id: crypto.randomUUID(),
        user_id: '', // Will be set when saving to database
        lastName: lastNameIndex >= 0 ? (values[lastNameIndex] || '') : '',
        firstName: firstNameIndex >= 0 ? (values[firstNameIndex] || '') : '',
        phone: phoneIndex >= 0 ? (values[phoneIndex] || '') : '',
        email: emailIndex >= 0 ? (values[emailIndex] || '') : '',
        comments: commentsIndex >= 0 ? (values[commentsIndex] || '') : '',
        attending: attendingIndex >= 0 && (values[attendingIndex] || '').toLowerCase() === 'yes' ? 'yes' : 'no'
      };

      console.log('Parsed contact:', contact);

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

      <div className="flex justify-end items-center mt-8">
        <Button className="bg-green-600 hover:bg-green-700">
          Upload Contacts
        </Button>
      </div>
    </div>
  );
};

export default UploadContacts;
