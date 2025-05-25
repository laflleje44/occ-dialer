
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MessageSquare } from "lucide-react";
import { Contact } from "@/types/auth";
import { useState } from "react";
import { ringCentralService } from "@/services/ringCentralService";
import { useToast } from "@/hooks/use-toast";

interface ContactRowProps {
  contact: Contact;
  onCall: (contact: Contact) => void;
  onAttendingChange: (contactId: string, checked: boolean | string) => void;
  onCommentsChange: (contactId: string, comments: string) => void;
}

const ContactRow = ({ contact, onCall, onAttendingChange, onCommentsChange }: ContactRowProps) => {
  const [localComments, setLocalComments] = useState(contact.comments || "");
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const { toast } = useToast();

  // You'll need to configure this with your actual RingCentral number
  const fromNumber = "+1234567890"; // Replace with your RingCentral number

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

  const handleCommentsKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onCommentsChange(contact.id, localComments);
    }
  };

  const handleCall = async () => {
    setIsCallLoading(true);
    try {
      await ringCentralService.makeCall(fromNumber, contact.phone);
      onCall(contact);
      toast({
        title: "Call initiated",
        description: `Calling ${contact.firstName} ${contact.lastName} at ${contact.phone}`
      });
    } catch (error) {
      console.error('Call failed:', error);
      toast({
        title: "Call failed",
        description: "Unable to initiate call. Please check your RingCentral configuration.",
        variant: "destructive"
      });
    } finally {
      setIsCallLoading(false);
    }
  };

  const handleText = async () => {
    setIsTextLoading(true);
    try {
      const message = `Hello ${contact.firstName}, this is a message from OCC Secure Dialer.`;
      await ringCentralService.sendSMS(fromNumber, contact.phone, message);
      
      toast({
        title: "Text sent",
        description: `Message sent to ${contact.firstName} ${contact.lastName}`
      });
      
      console.log(`Text sent to: ${contact.phone} - ${contact.firstName} ${contact.lastName}`);
    } catch (error) {
      console.error('Text failed:', error);
      toast({
        title: "Text failed",
        description: "Unable to send text message. Please check your RingCentral configuration.",
        variant: "destructive"
      });
    } finally {
      setIsTextLoading(false);
    }
  };

  return (
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
              onCheckedChange={(checked) => onAttendingChange(contact.id, checked)}
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
              placeholder="Add comments (press Enter to save)"
              value={localComments}
              onChange={(e) => setLocalComments(e.target.value)}
              onKeyDown={handleCommentsKeyDown}
              className="min-h-[60px] text-sm"
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            onClick={handleText}
            disabled={isTextLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {isTextLoading ? "Sending..." : "Text"}
          </Button>
          <Button
            size="sm"
            onClick={handleCall}
            disabled={isCallLoading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Phone className="w-4 h-4 mr-2" />
            {isCallLoading ? "Calling..." : "Call"}
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default ContactRow;
