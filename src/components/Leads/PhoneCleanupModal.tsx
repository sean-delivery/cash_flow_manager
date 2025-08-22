import React, { useState } from 'react';
import { X, Phone, CheckCircle, AlertTriangle, Trash2, Edit, Zap } from 'lucide-react';
import { Lead } from '../../types';

interface PhoneCleanupModalProps {
  leads: Lead[];
  onClose: () => void;
  onUpdate: (updatedLeads: Lead[]) => void;
}

const PhoneCleanupModal: React.FC<PhoneCleanupModalProps> = ({ leads, onClose, onUpdate }) => {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [cleanupResults, setCleanupResults] = useState<{
    valid: Lead[];
    invalid: Lead[];
    duplicates: Lead[];
    empty: Lead[];
  } | null>(null);

  const analyzePhones = () => {
    const valid: Lead[] = [];
    const invalid: Lead[] = [];
    const duplicates: Lead[] = [];
    const empty: Lead[] = [];
    const phoneMap = new Map<string, Lead[]>();

    leads.forEach(lead => {
      if (!lead.phone || lead.phone.trim() === '') {
        empty.push(lead);
        return;
      }

      const cleanPhone = lead.phone.replace(/[^\d]/g, '');
      
      // בדיקת תקינות טלפון ישראלי
      const isValid = (
        (cleanPhone.startsWith('972') && cleanPhone.length === 12) ||
        (cleanPhone.startsWith('05') && cleanPhone.length === 10) ||
        (cleanPhone.startsWith('0') && cleanPhone.length === 9 && ['02', '03', '04', '08', '09'].some(prefix => cleanPhone.startsWith(prefix)))
      );

      if (isValid) {
        // בדיקת כפילויות
        if (phoneMap.has(cleanPhone)) {
          phoneMap.get(cleanPhone)!.push(lead);
          if (!duplicates.some(d => d.phone === lead.phone)) {
            duplicates.push(...phoneMap.get(cleanPhone)!);
          }
        } else {
          phoneMap.set(cleanPhone, [lead]);
          valid.push(lead);
        }
      } else {
        invalid.push(lead);
      }
    });

    setCleanupResults({ valid, invalid, duplicates, empty });
  };

  const formatPhone = (phone: string): string => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    
    if (cleanPhone.startsWith('972')) {
      const localNumber = cleanPhone.substring(3);
      if (localNumber.startsWith('5')) {
        return `0${localNumber.substring(0, 2)}-${localNumber.substring(2)}`;
      } else {
        return `0${localNumber.substring(0, 1)}-${localNumber.substring(1)}`;
      }
    } else if (cleanPhone.startsWith('05')) {
      return `${cleanPhone.substring(0, 3)}-${cleanPhone.substring(3)}`;
    } else if (cleanPhone.startsWith('0')) {
      return `${cleanPhone.substring(0, 2)}-${cleanPhone.substring(2)}`;
    }
    
    return phone;
  };

  const handleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  const handleSelectAll = (category: 'invalid' | 'duplicates' | 'empty') => {
    if (!cleanupResults) return;
    
    const categoryLeads = cleanupResults[category];
    const categoryIds = new Set(categoryLeads.map(lead => lead.id));
    const newSelected = new Set(selectedLeads);
    
    const allSelected = categoryLeads.every(lead => selectedLeads.has(lead.id));
    
    if (allSelected) {
      categoryIds.forEach(id => newSelected.delete(id));
    } else {
      categoryIds.forEach(id => newSelected.add(id));
    }
    
    setSelectedLeads(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedLeads.size === 0) {
      alert('❌ אנא בחר לידים למחיקה');
      return;
    }

    if (confirm(`האם אתה בטוח שברצונך למחוק ${selectedLeads.size} לידים?`)) {
      const updatedLeads = leads.filter(lead => !selectedLeads.has(lead.id));
      onUpdate(updatedLeads);
      setSelectedLeads(new Set());
      analyzePhones();
      alert(`✅ נמחקו ${selectedLeads.size} לידים`);
    }
  };

  const handleFormatSelected = () => {
    if (selectedLeads.size === 0) {
      alert('❌ אנא בחר לידים לעיצוב');
      return;
    }

    const updatedLeads = leads.map(lead => {
      if (selectedLeads.has(lead.id)) {
        return { ...lead, phone: formatPhone(lead.phone) };
      }
      return lead;
    });

    onUpdate(updatedLeads);
    setSelectedLeads(new Set());
    setTimeout(() => analyzePhones(), 100);
    alert(`✅ עוצבו ${selectedLeads.size} מספרי טלפון`);
  };

  React.useEffect(() => {
    analyzePhones();
  }, [leads]);

  if (!cleanupResults) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6 text-center border border-slate-700">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">מנתח מספרי טלפון...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-white text-right">
            ניקוי מספרי טלפון
          </h2>
        </div>

        <div className="p-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">{cleanupResults.valid.length}</div>
              <div className="text-sm text-green-300">תקינים</div>
            </div>
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-400">{cleanupResults.invalid.length}</div>
              <div className="text-sm text-red-300">לא תקינים</div>
            </div>
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 text-center">
              <Phone className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-400">{cleanupResults.duplicates.length}</div>
              <div className="text-sm text-orange-300">כפולים</div>
            </div>
            <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-4 text-center">
              <X className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-400">{cleanupResults.empty.length}</div>
              <div className="text-sm text-gray-300">ריקים</div>
            </div>
          </div>

          {/* Actions */}
          {selectedLeads.size > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6 border border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={handleDeleteSelected}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2 space-x-reverse"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>מחק נבחרים</span>
                  </button>
                  <button
                    onClick={handleFormatSelected}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
                  >
                    <Zap className="h-4 w-4" />
                    <span>עצב טלפונים</span>
                  </button>
                </div>
                <span className="text-slate-300">נבחרו {selectedLeads.size} לידים</span>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="space-y-6">
            {/* Invalid Phones */}
            {cleanupResults.invalid.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => handleSelectAll('invalid')}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    {cleanupResults.invalid.every(lead => selectedLeads.has(lead.id)) ? 'בטל בחירה' : 'בחר הכל'}
                  </button>
                  <h3 className="text-lg font-semibold text-red-400 text-right">
                    מספרי טלפון לא תקינים ({cleanupResults.invalid.length})
                  </h3>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cleanupResults.invalid.map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <div className="text-right">
                        <div className="text-white text-sm">{lead.name}</div>
                        <div className="text-red-400 text-xs">{lead.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Duplicate Phones */}
            {cleanupResults.duplicates.length > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => handleSelectAll('duplicates')}
                    className="text-orange-400 hover:text-orange-300 text-sm"
                  >
                    {cleanupResults.duplicates.every(lead => selectedLeads.has(lead.id)) ? 'בטל בחירה' : 'בחר הכל'}
                  </button>
                  <h3 className="text-lg font-semibold text-orange-400 text-right">
                    מספרי טלפון כפולים ({cleanupResults.duplicates.length})
                  </h3>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cleanupResults.duplicates.map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <div className="text-right">
                        <div className="text-white text-sm">{lead.name}</div>
                        <div className="text-orange-400 text-xs">{lead.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty Phones */}
            {cleanupResults.empty.length > 0 && (
              <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => handleSelectAll('empty')}
                    className="text-gray-400 hover:text-gray-300 text-sm"
                  >
                    {cleanupResults.empty.every(lead => selectedLeads.has(lead.id)) ? 'בטל בחירה' : 'בחר הכל'}
                  </button>
                  <h3 className="text-lg font-semibold text-gray-400 text-right">
                    ללא מספר טלפון ({cleanupResults.empty.length})
                  </h3>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cleanupResults.empty.map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <div className="text-right">
                        <div className="text-white text-sm">{lead.name}</div>
                        <div className="text-gray-400 text-xs">אין טלפון</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneCleanupModal;