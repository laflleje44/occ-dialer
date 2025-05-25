
import { useState, useCallback } from 'react';
import { ringCentralService } from '@/services/ringCentralService';
import { useToast } from '@/hooks/use-toast';

export const useRingCentral = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [activeCalls, setActiveCalls] = useState<Map<string, any>>(new Map());
  const { toast } = useToast();

  const initialize = useCallback(async () => {
    setIsInitializing(true);
    try {
      await ringCentralService.initialize();
      setIsAuthenticated(ringCentralService.isAuthenticated());
    } catch (error) {
      toast({
        title: "Ring Central Setup Error",
        description: "Failed to initialize Ring Central. Please check your API credentials.",
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  }, [toast]);

  const authenticate = useCallback(async (username: string, password: string, extension?: string) => {
    try {
      await ringCentralService.authenticate(username, password, extension);
      setIsAuthenticated(true);
      toast({
        title: "Connected to Ring Central",
        description: "Successfully authenticated with Ring Central."
      });
      return true;
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Failed to authenticate with Ring Central. Please check your credentials.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const makeCall = useCallback(async (phoneNumber: string, contactName: string) => {
    try {
      if (!isAuthenticated) {
        toast({
          title: "Not Connected",
          description: "Please authenticate with Ring Central first.",
          variant: "destructive"
        });
        return false;
      }

      const callResult = await ringCentralService.makeCall(phoneNumber);
      
      if (callResult.success) {
        setActiveCalls(prev => new Map(prev.set(callResult.callId, {
          contactName,
          phoneNumber,
          status: callResult.status,
          startTime: new Date()
        })));

        toast({
          title: "Call Initiated",
          description: `Calling ${contactName} at ${phoneNumber}`
        });

        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: "Call Failed",
        description: `Failed to call ${contactName}. Please try again.`,
        variant: "destructive"
      });
      return false;
    }
  }, [isAuthenticated, toast]);

  const logout = useCallback(async () => {
    await ringCentralService.logout();
    setIsAuthenticated(false);
    setActiveCalls(new Map());
    toast({
      title: "Disconnected",
      description: "Disconnected from Ring Central."
    });
  }, [toast]);

  return {
    isAuthenticated,
    isInitializing,
    activeCalls,
    initialize,
    authenticate,
    makeCall,
    logout
  };
};
