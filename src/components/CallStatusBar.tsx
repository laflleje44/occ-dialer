
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, PhoneCall, CheckCircle, XCircle, AlertCircle, PhoneIncoming } from "lucide-react";

export interface CallStatus {
  id: string;
  contactName: string;
  phone: string;
  status: 'initiating' | 'connecting' | 'ringing' | 'connected' | 'answered' | 'completed' | 'failed' | 'busy' | 'no-answer';
  progress: number;
  timestamp: Date;
  step?: string; // For more granular status descriptions
}

interface CallStatusBarProps {
  callStatuses: CallStatus[];
  onClearStatus: (id: string) => void;
}

const CallStatusBar = ({ callStatuses, onClearStatus }: CallStatusBarProps) => {
  const getStatusColor = (status: CallStatus['status']) => {
    switch (status) {
      case 'initiating':
        return 'bg-blue-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'ringing':
        return 'bg-orange-500';
      case 'connected':
        return 'bg-green-500';
      case 'answered':
        return 'bg-green-600';
      case 'completed':
        return 'bg-green-700';
      case 'failed':
        return 'bg-red-500';
      case 'busy':
        return 'bg-red-400';
      case 'no-answer':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: CallStatus['status']) => {
    switch (status) {
      case 'initiating':
        return <Phone className="w-4 h-4" />;
      case 'connecting':
      case 'ringing':
        return <PhoneCall className="w-4 h-4 animate-pulse" />;
      case 'connected':
      case 'answered':
        return <PhoneIncoming className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
      case 'busy':
      case 'no-answer':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (callStatus: CallStatus) => {
    // Use the step field for more granular descriptions if available
    if (callStatus.step) {
      return callStatus.step;
    }

    switch (callStatus.status) {
      case 'initiating':
        return `Initiating call to ${callStatus.contactName}...`;
      case 'connecting':
        return `Connecting to ${callStatus.contactName}...`;
      case 'ringing':
        return `Calling ${callStatus.contactName} - ringing...`;
      case 'connected':
        return `Connected to ${callStatus.contactName}`;
      case 'answered':
        return `${callStatus.contactName} answered the call`;
      case 'completed':
        return `Call with ${callStatus.contactName} completed`;
      case 'failed':
        return `Call to ${callStatus.contactName} failed`;
      case 'busy':
        return `${callStatus.contactName} is busy`;
      case 'no-answer':
        return `${callStatus.contactName} did not answer`;
      default:
        return 'Unknown status';
    }
  };

  const maskPhoneNumber = (phone: string) => {
    if (phone.length <= 4) return phone;
    return '*'.repeat(phone.length - 4) + phone.slice(-4);
  };

  // Auto-clear completed or failed statuses after 5 seconds
  useEffect(() => {
    callStatuses.forEach(status => {
      if (status.status === 'completed' || status.status === 'failed' || status.status === 'busy' || status.status === 'no-answer') {
        const timer = setTimeout(() => {
          onClearStatus(status.id);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    });
  }, [callStatuses, onClearStatus]);

  if (callStatuses.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      {callStatuses.map((callStatus) => (
        <Card key={callStatus.id} className="border-l-4" style={{ borderLeftColor: getStatusColor(callStatus.status).replace('bg-', '') }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`p-1 rounded-full text-white ${getStatusColor(callStatus.status)}`}>
                  {getStatusIcon(callStatus.status)}
                </div>
                <div>
                  <span className="font-medium">
                    {maskPhoneNumber(callStatus.phone)}
                  </span>
                  <p className="text-sm text-gray-600">{getStatusText(callStatus)}</p>
                </div>
              </div>
              {(callStatus.status === 'completed' || callStatus.status === 'failed' || callStatus.status === 'busy' || callStatus.status === 'no-answer') && (
                <button
                  onClick={() => onClearStatus(callStatus.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
            <Progress 
              value={callStatus.progress} 
              className={`h-2 ${getStatusColor(callStatus.status)}`}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CallStatusBar;
