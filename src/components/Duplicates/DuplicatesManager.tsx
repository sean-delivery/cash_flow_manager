import React, { useState, useEffect } from 'react';
import { Copy, Users, AlertTriangle, CheckCircle, X, RefreshCw, ArrowRight } from 'lucide-react';
import { getCurrentLeads } from '../../data/mockData';
import { Lead, Duplicate } from '../../types';

interface DuplicatesManagerProps {
  onNavigate?: (view: string) => void;
}

const DuplicatesManager: React.FC<DuplicatesManagerProps> = ({ onNavigate }) => {
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const mockLeads = getCurrentLeads();

  useEffect(() => {
    // Load existing duplicates or scan on first load
    const savedDuplicates = localStorage.getItem('found_duplicates');
    if (savedDuplicates) {
      try {
        setDuplicates(JSON.parse(savedDuplicates));
      } catch (error) {
        console.error('Error loading duplicates:', error);
      }
    } else {
      // First time - scan for duplicates
      handleScanDuplicates();
    }
  }, []);

  const findDuplicates = (leads: Lead[]): Duplicate[] => {
    const duplicateGroups: Duplicate[] = [];
    
    // Simple duplicate detection algorithm
    for (let i = 0; i < leads.length; i++) {
      for (let j = i + 1; j < leads.length; j++) {
        const lead1 = leads[i];
        const lead2 = leads[j];
        
        let similarity = 0;
        let reasons = [];
        
        // Check phone similarity
        if (lead1.phone === lead2.phone) {
          similarity += 40;
          reasons.push('טלפון זהה');
        }
        
        // Check email similarity
        if (lead1.email && lead2.email && lead1.email === lead2.email) {
          similarity += 30;
          reasons.push('אימייל זהה');
        }
        
        // Check name similarity
        if (lead1.name.toLowerCase() === lead2.name.toLowerCase()) {
          similarity += 25;
          reasons.push('שם זהה');
        }
        
        // Check company similarity
        if (lead1.company && lead2.company && 
            lead1.company.toLowerCase() === lead2.company.toLowerCase()) {
          similarity += 20;
          reasons.push('חברה זהה');
        }
        
        if (similarity >= 60) {
          duplicateGroups.push({
            leads: [lead1, lead2],
            similarity,
            reason: reasons.join(', ')
          });
        }
      }
    }
    
    return duplicateGroups;
  };

  const handleScanDuplicates = async () => {
    setIsScanning(true);
    setLoading(true);
    
    // Simulate AI duplicate detection
    setTimeout(() => {
      const foundDuplicates = findDuplicates(mockLeads);
      setDuplicates(foundDuplicates);
      localStorage.setItem('found_duplicates', JSON.stringify(foundDuplicates));
      setLoading(false);
      setIsScanning(false);
    }, 2000);
  };

  const handleMergeLeads = (duplicate: Duplicate) => {
    console.log('Merging leads:', duplicate);
    // TODO: Implement merge logic
    alert('תכונת מיזוג תיושם בקרוב');
  };

  const handleIgnoreDuplicate = (index: number) => {
    const updatedDuplicates = duplicates.filter((_, i) => i !== index);
    setDuplicates(updatedDuplicates);
    localStorage.setItem('found_duplicates', JSON.stringify(updatedDuplicates));
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">מחפש כפילויות...</h3>
          <p className="text-gray-500">מנוע ה-AI בוחן את כל הלידים</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse">
            onClick={handleScanDuplicates}
            disabled={isScanning}
            <RefreshCw className={`h-5 w-5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'סורק...' : 'סרוק כפילויות'}</span>
          </button>
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
          <h1 className="text-2xl font-bold text-gray-900">זיהוי כפילויות</h1>
          <p className="text-gray-600">
            נמצאו {duplicates.length} כפילויות פוטנציאליות
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">כפילויות נמצאו</p>
              <p className="text-2xl font-bold text-red-600">{duplicates.length}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">לידים נבדקו</p>
              <p className="text-2xl font-bold text-blue-600">{getCurrentLeads().length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">דיוק זיהוי</p>
              <p className="text-2xl font-bold text-green-600">94%</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Duplicates List */}
      {duplicates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">לא נמצאו כפילויות!</h3>
          <p className="text-gray-500">מצוין! כל הלידים שלך ייחודיים</p>
        </div>
      ) : (
        <div className="space-y-6">
          {duplicates.map((duplicate, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border-2 border-orange-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleMergeLeads(duplicate)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
                  >
                    <Copy className="h-4 w-4" />
                    <span>מזג</span>
                  </button>
                  <button
                    onClick={() => handleIgnoreDuplicate(index)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2 space-x-reverse"
                  >
                    <X className="h-4 w-4" />
                    <span>התעלם</span>
                  </button>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-2xl font-bold text-orange-600">{duplicate.similarity}%</span>
                    <span className="text-sm text-gray-500">דמיון</span>
                  </div>
                  <p className="text-sm text-gray-600">{duplicate.reason}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {duplicate.leads.map((lead, leadIndex) => (
                  <div key={lead.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'נסגר' ? 'bg-green-100 text-green-800' :
                        lead.status === 'בטיפול' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status}
                      </span>
                      <h4 className="font-medium text-gray-900 text-right">
                        ליד #{leadIndex + 1}
                      </h4>
                    </div>
                    
                    <div className="space-y-2 text-right">
                      <div>
                        <span className="font-medium text-gray-900">{lead.name}</span>
                        {lead.company && (
                          <span className="text-gray-600 block text-sm">{lead.company}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>טלפון: {lead.phone}</div>
                        {lead.email && <div>מייל: {lead.email}</div>}
                        <div>{lead.city} • {lead.category}</div>
                        <div>נוצר: {new Date(lead.createdAt).toLocaleDateString('he-IL')}</div>
                        {lead.value && <div>ערך: ₪{lead.value.toLocaleString()}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DuplicatesManager;