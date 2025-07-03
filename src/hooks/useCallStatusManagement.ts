
import { useState } from "react";
import { CallStatus } from "@/components/CallStatusBar";

export const useCallStatusManagement = () => {
  const [callStatuses, setCallStatuses] = useState<CallStatus[]>([]);

  const handleStatusUpdate = (status: CallStatus) => {
    setCallStatuses(prev => {
      const existingIndex = prev.findIndex(s => s.id === status.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = status;
        return updated;
      }
      return [...prev, status];
    });
  };

  const handleClearStatus = (id: string) => {
    setCallStatuses(prev => prev.filter(status => status.id !== id));
  };

  return {
    callStatuses,
    handleStatusUpdate,
    handleClearStatus
  };
};
