
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, PhoneCall, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export interface CallStatus {
  id: string;
  contactName: string;
  phone: string;
  status: 'initiating' | 'connecting' | 'ringing' | 'connected' | 'completed' | 'failed';
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
        return 'bg-blue-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'ringing':
        return 'bg-orange-500';
      case 'connected':
        return 'bg-green-500';
      case 'completed':
        return 'bg-green-600';
      case 'failed':
        return 'bg-red-500';
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
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
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
        return 'Connecting...';
      case 'ringing':
        return 'Ringing...';
      case 'connected':
        return 'Call connected';
      case 'completed':
        return 'Call completed';
      case 'failed':
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
      if (status.status === 'completed' || status.status === 'failed') {
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
              {(callStatus.status === 'completed' || callStatus.status === 'failed') && (
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
