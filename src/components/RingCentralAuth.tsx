
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Loader2 } from 'lucide-react';
import { useRingCentral } from '@/hooks/useRingCentral';

const RingCentralAuth = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    extension: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, authenticate, logout, initialize } = useRingCentral();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await initialize();
    await authenticate(credentials.username, credentials.password, credentials.extension);
    
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    setCredentials({ username: '', password: '', extension: '' });
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
          Enter your Ring Central credentials to enable calling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username/Email</Label>
            <Input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="extension">Extension (optional)</Label>
            <Input
              id="extension"
              type="text"
              value={credentials.extension}
              onChange={(e) => setCredentials(prev => ({ ...prev, extension: e.target.value }))}
              placeholder="Leave blank for main number"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Connect to Ring Central
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RingCentralAuth;
