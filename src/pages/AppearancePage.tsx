
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { maskLastName, maskPhoneNumber } from '@/utils/contactUtils';

const AppearancePage = () => {
  const navigate = useNavigate();
  const [selectedTheme, setSelectedTheme] = useState('basic');

  // Create a mock screenshot component for the Basic theme
  const BasicThemePreview = () => (
    <div className="w-full h-full bg-white p-4 text-xs">
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-2 border-b font-medium">
          Contacts List
        </div>
        <div className="divide-y">
          <div className="p-2 flex justify-between items-center">
            <div>
              <div className="font-medium">User {maskLastName('Smith')}</div>
              <div className="text-gray-500">{maskPhoneNumber('+1234567890')}</div>
            </div>
            <div className="text-green-600 text-xs">Attending</div>
          </div>
          <div className="p-2 flex justify-between items-center">
            <div>
              <div className="font-medium">User {maskLastName('Johnson')}</div>
              <div className="text-gray-500">{maskPhoneNumber('+1987654321')}</div>
            </div>
            <div className="text-yellow-600 text-xs">Maybe</div>
          </div>
          <div className="p-2 flex justify-between items-center">
            <div>
              <div className="font-medium">User {maskLastName('Williams')}</div>
              <div className="text-gray-500">{maskPhoneNumber('+1555123456')}</div>
            </div>
            <div className="text-red-600 text-xs">Not Attending</div>
          </div>
        </div>
      </div>
    </div>
  );

  const themes = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Clean and simple interface',
      screenshot: null, // We'll use the component instead
      component: BasicThemePreview
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Dark theme for low-light environments',
      screenshot: '/placeholder.svg'
    },
    {
      id: 'compact',
      name: 'Compact',
      description: 'Space-efficient layout',
      screenshot: '/placeholder.svg'
    },
    {
      id: 'colorful',
      name: 'Colorful',
      description: 'Vibrant and modern design',
      screenshot: '/placeholder.svg'
    }
  ];

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    // Apply theme changes in real-time
    console.log('Theme selected:', themeId);
    // Here you would implement the actual theme switching logic
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Appearance Settings</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Choose Your Theme</h2>
          <p className="text-gray-600 mb-6">
            Select a theme that matches your preference. Changes will be applied immediately.
          </p>

          <RadioGroup value={selectedTheme} onValueChange={handleThemeSelect}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {themes.map((theme) => (
                <Card key={theme.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={theme.id} id={theme.id} />
                      <Label htmlFor={theme.id} className="cursor-pointer">
                        <CardTitle className="text-lg">{theme.name}</CardTitle>
                      </Label>
                    </div>
                    <CardDescription>{theme.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                      {theme.component ? (
                        <theme.component />
                      ) : (
                        <img 
                          src={theme.screenshot} 
                          alt={`${theme.name} theme preview`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppearancePage;
