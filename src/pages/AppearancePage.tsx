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
    <div className="w-full h-full bg-gray-50 text-xs overflow-hidden">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b mb-3">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                <div className="w-2 h-2 text-white text-xs">📞</div>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">OCC Secure Dialer</h1>
                <p className="text-xs text-gray-600">Privacy-focused calling solution</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">System Ready</span>
              </div>
              <span className="text-xs text-gray-600">Welcome, User</span>
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">U</span>
              </div>
            </div>
          </div>
        </div>
        <nav className="border-b">
          <div className="flex">
            <button className="flex items-center space-x-1 px-3 py-2 border-b-2 border-green-500 text-green-600 bg-green-50">
              <span className="text-xs">👥</span>
              <span className="text-xs">Dialer</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Telephone Settings Section */}
      <div className="px-3 mb-3">
        <div className="bg-white rounded border shadow-sm">
          <div className="px-3 py-2 border-b">
            <h3 className="text-xs font-semibold flex items-center space-x-1">
              <span>📞</span>
              <span>Telephone Settings</span>
            </h3>
          </div>
          <div className="px-3 py-2">
            <div className="space-y-1">
              <label className="text-xs text-gray-700">Your Number</label>
              <div className="flex space-x-1">
                <input 
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                  value="+1234567890"
                  readOnly
                />
                <button className="bg-black text-white px-2 py-1 rounded text-xs">
                  Save
                </button>
              </div>
              <p className="text-xs text-gray-600">
                This number you will receive the outgoing calls. Format: +1234567890
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Table Section */}
      <div className="px-3">
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attending
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-xs font-medium text-gray-900">User {maskLastName('Smith')}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-xs text-gray-500">{maskPhoneNumber('+1234567890')}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-xs text-gray-500">user@email.com</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Attending
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600">
                      Call
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-xs font-medium text-gray-900">User {maskLastName('Johnson')}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-xs text-gray-500">{maskPhoneNumber('+1987654321')}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-xs text-gray-500">user2@email.com</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Maybe
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600">
                      Call
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-xs font-medium text-gray-900">User {maskLastName('Williams')}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-xs text-gray-500">{maskPhoneNumber('+1555123456')}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-xs text-gray-500">user3@email.com</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Not Attending
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600">
                      Call
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
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
