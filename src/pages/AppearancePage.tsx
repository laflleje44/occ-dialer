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
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 text-white text-xs">📞</div>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">OCC Secure Dialer</h1>
                <p className="text-sm text-gray-600">Privacy-focused calling solution</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">System Ready</span>
              </div>
              <span className="text-sm text-gray-600">Welcome, User</span>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-sm text-white font-medium">LA</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Tab */}
        <nav className="border-b bg-gray-50">
          <div className="px-4">
            <button className="flex items-center space-x-2 px-4 py-3 border-b-2 border-green-500 text-green-600 bg-white -mb-px">
              <span className="text-sm">👥</span>
              <span className="text-sm font-medium">Dialer</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Telephone Settings Section */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="px-4 py-3 border-b">
            <h3 className="text-base font-semibold flex items-center space-x-2">
              <span>📞</span>
              <span>Telephone Settings</span>
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Your Number</label>
              <div className="flex space-x-2">
                <input 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                  value="+1234567890"
                  readOnly
                />
                <button className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-1">
                  <span>💾</span>
                  <span>Save</span>
                </button>
              </div>
              <p className="text-sm text-gray-600">
                This number you will receive the outgoing calls. Format: +1234567890
              </p>
            </div>
          </div>
        </div>

        {/* Call Session Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-700">Select Call Session:</span>
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white min-w-48">
            <option>Choose a call session</option>
          </select>
        </div>

        {/* Contact List Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Contact List</h2>
            <div className="relative">
              <input 
                className="pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm bg-white"
                placeholder="Search contacts..."
              />
              <div className="absolute left-3 top-2.5">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          </div>

          {/* Contact Table */}
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attending</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comments</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">John {maskLastName('Doe')}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-600">{maskPhoneNumber('+12345672808')}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-600">Never</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                      Not Called
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm text-gray-600">Confirmed to attend</span>
                    </div>
                    <textarea 
                      className="mt-2 w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      placeholder="Add comments (press Enter or click Save)"
                      rows={2}
                    />
                    <button className="mt-1 text-xs text-gray-600 flex items-center space-x-1">
                      <span>💾</span>
                      <span>Saved</span>
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <button className="bg-green-500 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center space-x-1">
                        <span>📞</span>
                        <span>Call</span>
                      </button>
                      <button className="bg-gray-400 text-white px-3 py-1.5 rounded text-xs font-medium">
                        Text
                      </button>
                    </div>
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
