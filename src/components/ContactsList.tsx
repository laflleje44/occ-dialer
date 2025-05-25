
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types/auth";

interface ContactsListProps {
  contacts: Contact[];
}

const ContactsList = ({ contacts }: ContactsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAttending, setFilterAttending] = useState<"all" | "yes" | "no">("all");
  const { toast } = useToast();

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterAttending === "all" || contact.attending === filterAttending;

    return matchesSearch && matchesFilter;
  });

  const handleCall = (contact: Contact) => {
    toast({
      title: "Initiating call",
      description: `Calling ${contact.firstName} ${contact.lastName} at ${contact.phone}`
    });
    console.log(`Dialing: ${contact.phone} - ${contact.firstName} ${contact.lastName}`);
  };

  if (contacts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts imported</h3>
        <p className="text-gray-500 mb-4">Upload a CSV file in the Upload Contacts tab to get started.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Dialer</h2>
        <p className="text-gray-600">
          {contacts.length} contacts imported. Click the call button to dial any contact.
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search contacts by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterAttending === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterAttending("all")}
          >
            All
          </Button>
          <Button
            variant={filterAttending === "yes" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterAttending("yes")}
          >
            Attending
          </Button>
          <Button
            variant={filterAttending === "no" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterAttending("no")}
          >
            Not Attending
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={contact.attending === "yes" ? "default" : "secondary"}>
                      {contact.attending === "yes" ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {contact.comments || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      size="sm"
                      onClick={() => handleCall(contact)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredContacts.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-500">No contacts found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ContactsList;
