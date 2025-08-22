import React, { useState, useEffect } from 'react';
import { Share, Phone, Mail, MapPin, Building2, Calendar, ArrowLeft, Download, CheckSquare } from 'lucide-react';
import { getSharedData } from '../../data/mockData';

interface SharedViewProps {
  shareId: string;
  onBack: () => void;
}

const SharedView: React.FC<SharedViewProps> = ({ shareId, onBack }) => {
  const [sharedData, setSharedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleExportSelected = () => {
    const selectedLeadsData = sharedData.leads.filter((_: any, index: number) => 
      selectedLeads.has(`shared_${index}`)
    );
    
    const csvContent = [
      'שם,חברה,טלפון,מייל,עיר,קטגוריה',
      ...selectedLeadsData.map((lead: any) => 
        `"${lead.name}","${lead.company || ''}","${lead.phone}","${lead.email || ''}","${lead.city}","${lead.category}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `shared_leads_${sharedData.category}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  useEffect(() => {
    const loadSharedData = () => {
      const data = getSharedData(shareId);
      setSharedData(data);
      setLoading(false);
    };

    loadSharedData();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתונים משותפים...</p>
        </div>
      </div>
    );
  }

  if (!sharedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Share className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">לינק לא תקין</h2>
          <p className="text-gray-600 mb-6">הלינק שהזנת לא קיים או פג תוקף</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            חזור למערכת
          </button>
        </div>
      </div>
    );
  }

  const isExpired = new Date(sharedData.sharedAt).getTime() + (7 * 24 * 60 * 60 * 1000) < Date.now();

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">הלינק פג תוקף</h2>
          <p className="text-gray-600 mb-6">לינק השיתוף תקף ל-7 ימים בלבד</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            חזור למערכת
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center justify-between">
          {sharedData.permissions === 'select' && (
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={handleExportSelected}
                disabled={selectedLeads.size === 0}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse ${
                  selectedLeads.size === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Download className="h-4 w-4" />
                <span>ייצא נבחרים ({selectedLeads.size})</span>
              </button>
              <button
                onClick={() => {
                  if (selectedLeads.size === sharedData.leads.length) {
                    setSelectedLeads(new Set());
                  } else {
                    setSelectedLeads(new Set(sharedData.leads.map((_: any, index: number) => `shared_${index}`)));
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {selectedLeads.size === sharedData.leads.length ? 'בטל בחירה' : 'בחר הכל'}
              </button>
            </div>
          )}
          <button
            onClick={onBack}
            className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>
              {sharedData.permissions === 'view' ? 'צפייה בלבד' : 
               sharedData.permissions === 'edit' ? 'ניתן לעריכה' : 'ניתן לבחירה'}
            </span>
            <span>חזור למערכת</span>
          </button>
          <div className="text-right">
            <Share className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">נתונים משותפים</h3>
          </div>
        </div>
      </div>

      <div className="p-6">
        {sharedData.leads.length > 0 ? (
          <div>
            <div className="flex items-center justify-center space-x-2 space-x-reverse mb-2">
              <Share className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">נתונים משותפים</h3>
            </div>
            <p className="text-blue-800 text-center text-sm">
              זהו תצוגה של נתונים שהועברו אליך. המידע מוגבל ולא כולל פרטים רגישים.
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedData.leads.map((lead: any, index: number) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {sharedData.permissions === 'select' && (
                <div className="flex items-center justify-end mb-4">
                  <input
                    type="checkbox"
                    checked={selectedLeads.has(`shared_${index}`)}
                    onChange={() => handleSelectLead(`shared_${index}`)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <CheckSquare className="h-4 w-4 text-blue-600 mr-2" />
                </div>
              )}
              
              <div className="text-right mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                {lead.company && (
                  <p className="text-sm text-gray-600">{lead.company}</p>
                )}
              </div>

              <div className="space-y-3">
                {lead.phone && (
                  <div className="flex items-center justify-end space-x-2 space-x-reverse">
                    <span className="text-sm text-gray-600">{lead.phone}</span>
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                
                {lead.email && (
                  <div className="flex items-center justify-end space-x-2 space-x-reverse">
                    <span className="text-sm text-gray-600">{lead.email}</span>
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                
                <div className="flex items-center justify-end space-x-2 space-x-reverse">
                  <span className="text-sm text-gray-600">{lead.city} • {lead.category}</span>
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {lead.notes && sharedData.permissions !== 'view' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-right">{lead.notes}</p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center space-x-2 space-x-reverse">
                {lead.phone && (
                  <button
                    onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-1 space-x-reverse text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    <span>התקשר</span>
                  </button>
                )}
                
                {lead.email && (
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent('פנייה עסקית');
                      const body = encodeURIComponent(`שלום ${lead.name},\n\nקיבלתי את הפרטים שלכם ואשמח ליצור קשר.\n\nתודה,`);
                      window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, '_self');
                    }}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-1 space-x-reverse text-sm"
                  >
                    <Mail className="h-4 w-4" />
                    <span>מייל</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {sharedData.leads.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין נתונים בקטגוריה זו</h3>
            <p className="text-gray-500">הקטגוריה שנבחרה לשיתוף ריקה</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedView;