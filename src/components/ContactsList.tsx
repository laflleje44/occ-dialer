import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Users, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ContactsListProps {
  contacts: Contact[];
}

const ContactsList = ({ contacts }: ContactsListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAttending, setFilterAttending] = useState<"all" | "yes" | "no">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateContactMutation = useMutation({
    mutationFn: async ({ contactId, updates }: { contactId: string; updates: Partial<Contact> }) => {
      console.log('Updating contact:', contactId, 'with updates:', updates);
      
      const { error } = await supabase
        .from('contacts')
        .update({
          attending: updates.attending,
          comments: updates.comments,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId);
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Contact updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Contact updated",
        description: "Contact information has been saved successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating contact",
        description: "There was an error updating the contact. Please try again.",
        variant: "destructive"
      });
      console.error('Error updating contact:', error);
    }
  });

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

  const handleAttendingChange = (contactId: string, checked: boolean | string) => {
    console.log('Checkbox changed for contact:', contactId, 'checked:', checked);
    
    const newAttending = checked === true ? "yes" : "no";
    console.log('Setting attending to:', newAttending);
    
    updateContactMutation.mutate({
      contactId: contactId,
      updates: { attending: newAttending }
    });
  };

  const handleCommentsChange = (contactId: string, comments: string) => {
    console.log('Comments changed for contact:', contactId, 'comments:', comments);
    
    updateContactMutation.mutate({
      contactId: contactId,
      updates: { comments }
    });
  };

  const maskLastName = (lastName: string) => {
    if (!lastName) return '';
    return lastName.charAt(0) + '*'.repeat(lastName.length - 1);
  };

  const maskPhoneNumber = (phone: string) => {
    if (!phone || phone.length < 4) return phone;
    const lastFour = phone.slice(-4);
    const maskedPart = '*'.repeat(phone.length - 4);
    return maskedPart + lastFour;
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
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Contact List</h2>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  FIRST NAME
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  LAST NAME
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  PHONE NUMBER
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  LAST CALLED
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  ATTENDANCE
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={`contact-${contact.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {contact.firstName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {maskLastName(contact.lastName)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {maskPhoneNumber(contact.phone)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">Never</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      Not Called
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`attend-${contact.id}`}
                          checked={contact.attending === "yes"}
                          onCheckedChange={(checked) => handleAttendingChange(contact.id, checked)}
                        />
                        <label 
                          htmlFor={`attend-${contact.id}`}
                          className="text-sm text-gray-700"
                        >
                          Confirmed to attend
                        </label>
                      </div>
                      <div className="w-48">
                        <Textarea
                          placeholder="Add comments"
                          value={contact.comments || ""}
                          onChange={(e) => handleCommentsChange(contact.id, e.target.value)}
                          className="min-h-[60px] text-sm"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button
                      size="sm"
                      onClick={() => handleCall(contact)}
                      className="bg-green-500 hover:bg-green-600 text-white"
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
