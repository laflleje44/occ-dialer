
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, PhoneCall, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export interface CallStatus {
  id: string;
  contactName: string;
  phone: string;
  status: 'initiating' | 'connecting' | 'dialing_first' | 'first_ringing' | 'first_answered' | 'dialing_second' | 'second_ringing' | 'second_answered' | 'connecting_calls' | 'call_connected' | 'call_completed' | 'call_failed';
  progress: number;
  timestamp: Date;
}

interface CallStatusBarProps {
  callStatuses: CallStatus[];
  onClearStatus: (id: string) => void;
}

const CallStatusBar = ({ callStatuses, onClearStatus }: CallStatusBarProps) => {
  const getStatusColor = (status: CallStatus['status']) => {
    switch (status) {
      case 'initiating':
      case 'connecting':
        return 'bg-blue-500';
      case 'dialing_first':
      case 'dialing_second':
        return 'bg-yellow-500';
      case 'first_ringing':
      case 'second_ringing':
        return 'bg-orange-500';
      case 'first_answered':
      case 'second_answered':
      case 'connecting_calls':
        return 'bg-purple-500';
      case 'call_connected':
      case 'call_completed':
        return 'bg-green-500';
      case 'call_failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: CallStatus['status']) => {
    switch (status) {
      case 'initiating':
      case 'connecting':
        return <Phone className="w-4 h-4" />;
      case 'dialing_first':
      case 'dialing_second':
      case 'first_ringing':
      case 'second_ringing':
        return <PhoneCall className="w-4 h-4 animate-pulse" />;
      case 'first_answered':
      case 'second_answered':
      case 'connecting_calls':
      case 'call_connected':
      case 'call_completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'call_failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: CallStatus['status']) => {
    switch (status) {
      case 'initiating':
        return 'Initiating call...';
      case 'connecting':
        return 'Connecting to RingCentral...';
      case 'dialing_first':
        return 'Dialing your phone...';
      case 'first_ringing':
        return 'Your phone is ringing...';
      case 'first_answered':
        return 'You answered - now dialing contact...';
      case 'dialing_second':
        return 'Dialing contact...';
      case 'second_ringing':
        return 'Contact phone is ringing...';
      case 'second_answered':
        return 'Contact answered!';
      case 'connecting_calls':
        return 'Connecting both parties...';
      case 'call_connected':
        return 'Call is connected';
      case 'call_completed':
        return 'Call completed successfully';
      case 'call_failed':
        return 'Call failed';
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
      if (status.status === 'call_completed' || status.status === 'call_failed') {
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
                    {callStatus.contactName} - {maskPhoneNumber(callStatus.phone)}
                  </span>
                  <p className="text-sm text-gray-600">{getStatusText(callStatus.status)}</p>
                </div>
              </div>
              {(callStatus.status === 'call_completed' || callStatus.status === 'call_failed') && (
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
