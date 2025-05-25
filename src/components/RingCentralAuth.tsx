
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Loader2 } from 'lucide-react';
import { useRingCentral } from '@/hooks/useRingCentral';

const RingCentralAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, authenticate, logout, initialize } = useRingCentral();

  const handleConnect = async () => {
    setIsLoading(true);
    
    await initialize();
    await authenticate();
    
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-500" />
            Ring Central Connected
          </CardTitle>
          <CardDescription>
            You can now make calls through Ring Central
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            Disconnect
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Connect to Ring Central
        </CardTitle>
        <CardDescription>
          Click below to authenticate with Ring Central and enable calling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleConnect} className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Connect to Ring Central
        </Button>
      </CardContent>
    </Card>
  );
};

export default RingCentralAuth;
