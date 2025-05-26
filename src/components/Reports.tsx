
import { useState } from "react";
import { Contact, CallSession } from "@/types/auth";
import { Phone, Check, Clock, PhoneCall, PhoneMissed } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { maskLastName, maskPhoneNumber } from "@/utils/contactUtils";

interface ReportsProps {
  contacts: Contact[];
  callSessions: CallSession[];
}

const Reports = ({ contacts, callSessions }: ReportsProps) => {
  const [selectedCallSessionId, setSelectedCallSessionId] = useState<string | "all">("all");

  // Filter contacts based on selected call session
  const filteredContacts = selectedCallSessionId === "all" 
    ? contacts 
    : contacts.filter(contact => contact.call_session_id === selectedCallSessionId);

  const totalContacts = filteredContacts.length;
  
  // Calculate actual call statistics
  const contactsWithCalls = filteredContacts.filter(contact => contact.last_called);
  const totalCalls = contactsWithCalls.length;
  const successfulCalls = filteredContacts.filter(contact => 
    contact.status === "called" || contact.status === "text sent"
  ).length;
  const failedCalls = filteredContacts.filter(contact => 
    contact.status === "call failed" || contact.status === "busy"
  ).length;

  // Get call history (contacts that have been called)
  const callHistory = filteredContacts
    .filter(contact => contact.last_called)
    .sort((a, b) => new Date(b.last_called!).getTime() - new Date(a.last_called!).getTime());

  const getStatusDisplay = (status?: string) => {
    switch (status) {
      case "called":
        return { text: "Successful", bgColor: "bg-green-100", textColor: "text-green-800", icon: <Check className="w-4 h-4" /> };
      case "busy":
        return { text: "Busy", bgColor: "bg-yellow-100", textColor: "text-yellow-800", icon: <PhoneMissed className="w-4 h-4" /> };
      case "call failed":
        return { text: "Failed", bgColor: "bg-red-100", textColor: "text-red-800", icon: <PhoneMissed className="w-4 h-4" /> };
      case "text sent":
        return { text: "Text Sent", bgColor: "bg-blue-100", textColor: "text-blue-800", icon: <Check className="w-4 h-4" /> };
      default:
        return { text: "Unknown", bgColor: "bg-gray-100", textColor: "text-gray-800", icon: <Phone className="w-4 h-4" /> };
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Call Reports</h2>
        
        {/* Call Session Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <label htmlFor="call-session-filter" className="text-sm font-medium text-gray-700">
              Filter by Call Session:
            </label>
            <Select value={selectedCallSessionId} onValueChange={setSelectedCallSessionId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose a call session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex flex-col">
                    <span className="font-medium">All Sessions</span>
                    <span className="text-xs text-gray-500">
                      {contacts.length} total contacts
                    </span>
                  </div>
                </SelectItem>
                {callSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{session.name}</span>
                      <span className="text-xs text-gray-500">
                        {contacts.filter(c => c.call_session_id === session.id).length} contacts • {new Date(session.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Call Reports Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Calls</p>
              <p className="text-3xl font-bold text-gray-900">{totalCalls}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Successful</p>
              <p className="text-3xl font-bold text-gray-900">{successfulCalls}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <PhoneMissed className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Failed</p>
              <p className="text-3xl font-bold text-gray-900">{failedCalls}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Contacts</p>
              <p className="text-3xl font-bold text-gray-900">{totalContacts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call History Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Call History</h3>
      </div>

      {/* Call History Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attending</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {callHistory.length > 0 ? (
                callHistory.map((contact) => {
                  const statusDisplay = getStatusDisplay(contact.status);
                  return (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className="font-medium">
                          {contact.firstName} {maskLastName(contact.lastName)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {maskPhoneNumber(contact.phone)}
                      </TableCell>
                      <TableCell>
                        {contact.last_called && formatDateTime(contact.last_called)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusDisplay.icon}
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
                            {statusDisplay.text}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          contact.attending === "yes" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {contact.attending === "yes" ? "Yes" : "No"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={contact.comments || ""}>
                          {contact.comments || "-"}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    No call history available for the selected session.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
