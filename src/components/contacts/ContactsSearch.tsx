
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ContactsSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const ContactsSearch = ({ searchTerm, onSearchChange }: ContactsSearchProps) => {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-gray-900">Contact List</h2>
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};

export default ContactsSearch;
