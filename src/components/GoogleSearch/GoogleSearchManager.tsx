import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import GoogleAPISearch from './GoogleAPISearch';
import PythonScraperIntegration from './PythonScraperIntegration';

interface GoogleSearchManagerProps {
  onNavigate?: (view: string) => void;
}

const GoogleSearchManager: React.FC<GoogleSearchManagerProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'api' | 'python'>('api');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="bg-white rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'api'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Google API
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'python'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Python Scraper
            </button>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end space-x-4 space-x-reverse mb-2">
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
            >
              <ArrowRight className="h-5 w-5" />
              <span>חזרה לדשבורד</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">חיפוש עסקים אמיתי</h1>
          <p className="text-gray-600">
            {activeTab === 'api' ? 'חיפוש עסקים עם Google Places API' : 'חיפוש עסקים עם Python Scraper'}
          </p>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'api' ? <GoogleAPISearch /> : <PythonScraperIntegration />}
    </div>
  );
};

export default GoogleSearchManager;