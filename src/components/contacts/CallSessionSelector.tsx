
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CallSession } from "@/types/auth";

interface CallSessionSelectorProps {
  callSessions: CallSession[];
  selectedSessionId: string | null;
  onSessionChange: (sessionId: string | null) => void;
}

const CallSessionSelector = ({ 
  callSessions, 
  selectedSessionId, 
  onSessionChange 
}: CallSessionSelectorProps) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Call Session
      </label>
      <Select value={selectedSessionId || "all"} onValueChange={(value) => onSessionChange(value === "all" ? null : value)}>
        <SelectTrigger className="w-80">
          <SelectValue placeholder="Select a call session" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Call Sessions</SelectItem>
          {callSessions.map((session) => (
            <SelectItem key={session.id} value={session.id}>
              {session.name} ({session.contact_count} contacts)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CallSessionSelector;
