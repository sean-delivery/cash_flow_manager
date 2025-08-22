import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Users, Phone, Mail, MessageSquare, Calendar, Edit, Trash2, Star, Upload, FileSpreadsheet, Share, ArrowRight } from 'lucide-react';
import { getCurrentLeads, addNewLeads } from '../../data/mockData';
import { Lead } from '../../types';
import PhoneCleanupModal from './PhoneCleanupModal';
import { useAuth } from '../../contexts/AuthContext';
import ShareButton from '../common/ShareButton';
import { loadFavorites, saveFavorite } from '../../lib/favorites';

interface LeadsManagerProps {
  onNavigate?: (view: string) => void;
}

const LeadsManager: React.FC<LeadsManagerProps> = ({ onNavigate }) => {
  const { user, email } = useAuth();
  const [leads, setLeads] = useState<Lead[]>(getCurrentLeads());
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [manualImportData, setManualImportData] = useState('');
  const [showManualImport, setShowManualImport] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCategoryToShare, setSelectedCategoryToShare] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showPhoneCleanup, setShowPhoneCleanup] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    city: '',
    category: '',
    notes: ''
  });

  const categories = [
    'טכנולוגיה', 'יעוץ עסקי', 'בנייה', 'שיווק', 'כספים', 'נדלן', 'חינוך', 'בריאות', 'מזון',
    'רהיטים', 'עורכי דין', 'נוטריונים', 'בתי דפוס', 'חברות מתנות', 'ועדי עובדים',
    'ריהוט משרדי', 'ארונות אמבטיה', 'מחסני אי-קומרס', 'עיצוב פנים', 'מעצבי פנים',
    'חנויות תאורה', 'שירותי לוגיסטיקה', 'חנויות צעצועים', 'חנויות חיות מחמד',
    'ספקי מטבחים', 'חנויות תינוקות', 'מכוני יופי', 'מספרות', 'מרפאות שיניים',
    'מרפאות וטרינריות', 'Furniture store', 'Accounting firm', 'Accountant', 'אחר'
  ];

  const cities = [
    'תל אביב', 'ירושלים', 'חיפה', 'ראשון לציון', 'פתח תקווה', 'אשדוד', 'נתניה',
    'באר שבע', 'בני ברק', 'רמת גן', 'אשקלון', 'נצרת', 'הרצליה', 'כפר סבא', 'רחובות',
    'Rishon LeZion', 'Bet Shemesh', 'Haifa', 'Be\'er Sheva', 'Tel Aviv-Yafo', 'Golan Heights',
    'Eliyahu Navi St', 'Coral F Levinski St', 'GARO', 'Kiryat Ekron', 'Turque Or Yehuda',
    'Jerusalem', 'BRADT Tel Aviv-Yafo', 'Sderot Ben Gurion', 'Balfour St', 'Tchernihovski St',
    'HaHistadrut Ave', 'HaBankim St', 'Yokhanan ha-Sandlar St', 'לא צוין'
  ];

  // האזנה לעדכוני לידים חדשים
  React.useEffect(() => {
    const handleLeadsUpdate = () => {
      setLeads(getCurrentLeads());
    };

    window.addEventListener('leadsUpdated', handleLeadsUpdate);
    return () => window.removeEventListener('leadsUpdated', handleLeadsUpdate);
  }, []);

  // טעינת מועדפים
  React.useEffect(() => {
    const loadFavoritesData = async () => {
      try {
        const favoritesSet = await loadFavorites(email || 'guest');
        setFavorites(favoritesSet);
      } catch (error) {
        console.warn('Failed to load favorites:', error);
      }
    };
    
    loadFavoritesData();
  }, [email]);

  const filteredLeads = leads.filter(lead => {
    return (
      (searchTerm === '' || 
       lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       lead.phone.includes(searchTerm) ||
       lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
      ) &&
      (selectedCategory === '' || lead.category === selectedCategory) &&
      (selectedCity === '' || lead.city === selectedCity) &&
      (selectedStatus === '' || lead.status === selectedStatus)
    );
  });

  const handleEditLead = (lead: Lead) => {
    if (user?.role === 'guest') {
      alert('❌ אורחים יכולים רק לצפות. היכנס עם Google לעריכה');
      return;
    }
    console.log('Edit lead:', lead);
    alert(`✏️ עריכת ליד: ${lead.name}\nתכונה זו תיושם בקרוב`);
  };

  const handleDeleteLead = (id: string) => {
    if (user?.role === 'guest') {
      alert('❌ אורחים יכולים רק לצפות. היכנס עם Google למחיקה');
      return;
    }
    if (confirm('האם אתה בטוח שברצונך למחוק ליד זה?')) {
      const currentUser = JSON.parse(localStorage.getItem('crm_user') || 'null');
      if (!currentUser) return;
      
      const userDataKey = `crm_leads_${currentUser.id}`;
      const userData = JSON.parse(localStorage.getItem(userDataKey) || '{"leads": []}');
      
      const updatedLeads = leads.filter(lead => lead.id !== id);
      setLeads(updatedLeads);
      
      // עדכון localStorage הנכון
      userData.leads = updatedLeads;
      localStorage.setItem(userDataKey, JSON.stringify(userData));
      
      // עדכון הרכיבים
      window.dispatchEvent(new CustomEvent('leadsUpdated'));
    }
  };

  const handleToggleStar = (id: string) => {
    const handleToggleStarAsync = async () => {
      try {
        const lead = leads.find(l => l.id === id);
        if (!lead) return;

        const isCurrentlyFavorite = favorites.has(id);
        const updatedFavorites = await saveFavorite(email || 'guest', id, !isCurrentlyFavorite);
        setFavorites(updatedFavorites);
        
        // עדכון הליד בלוקאל
        const updatedLeads = leads.map(l => 
          l.id === id ? { ...l, starred: !isCurrentlyFavorite } : l
        );
        setLeads(updatedLeads);
        
        // עדכון localStorage הנכון
        const currentUser = JSON.parse(localStorage.getItem('crm_user') || 'null');
        if (currentUser) {
          const userDataKey = `crm_leads_${currentUser.id}`;
          const userData = JSON.parse(localStorage.getItem(userDataKey) || '{"leads": []}');
          userData.leads = updatedLeads;
          localStorage.setItem(userDataKey, JSON.stringify(userData));
        }
        
        // שמירה גם בפורמט הישן לתאימות לאחור
        if (!isCurrentlyFavorite) {
          const favoriteData = {
            id: lead.id,
            name: lead.name,
            phone: lead.phone,
            address: lead.city,
            category: lead.category,
            rating: '4.5',
            reviews: '50',
            website: '',
            email: lead.email || '',
            quickNotes: lead.notes || '',
            addedAt: new Date().toISOString(),
            source: 'manual' as const,
            searchQuery: lead.category,
            searchLocation: lead.city,
            reminders: []
          };
          
          const savedFavorites = JSON.parse(localStorage.getItem('favorite_leads') || '[]');
          const exists = savedFavorites.some((fav: any) => fav.id === id);
          if (!exists) {
            const updatedFavorites = [...savedFavorites, favoriteData];
            localStorage.setItem('favorite_leads', JSON.stringify(updatedFavorites));
          }
          alert(`⭐ ${lead.name} נוסף למועדפים!`);
        } else {
          // הסרה מהפורמט הישן
          const savedFavorites = JSON.parse(localStorage.getItem('favorite_leads') || '[]');
          const updatedFavorites = savedFavorites.filter((fav: any) => fav.id !== id);
          localStorage.setItem('favorite_leads', JSON.stringify(updatedFavorites));
          alert(`⭐ ${lead.name} הוסר מהמועדפים`);
        }
        
        // עדכון הסיידבר
        window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      } catch (error) {
        console.warn('Failed to toggle favorite:', error);
      }
    };
    
    handleToggleStarAsync();
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

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`האם אתה בטוח שברצונך למחוק ${selectedLeads.size} לידים?`)) {
      const currentUser = JSON.parse(localStorage.getItem('crm_user') || 'null');
      if (!currentUser) return;
      
      const userDataKey = `crm_leads_${currentUser.id}`;
      const userData = JSON.parse(localStorage.getItem(userDataKey) || '{"leads": []}');
      
      const updatedLeads = leads.filter(lead => !selectedLeads.has(lead.id));
      setLeads(updatedLeads);
      setSelectedLeads(new Set());
      
      // עדכון localStorage הנכון
      userData.leads = updatedLeads;
      localStorage.setItem(userDataKey, JSON.stringify(userData));
      
      // עדכון הרכיבים
      window.dispatchEvent(new CustomEvent('leadsUpdated'));
    }
  };

  const handleBulkAddToFavorites = () => {
    const selectedLeadsData = leads.filter(lead => selectedLeads.has(lead.id));
    const savedFavorites = JSON.parse(localStorage.getItem('favorite_leads') || '[]');
    let addedCount = 0;
    
    selectedLeadsData.forEach(lead => {
      // בדיקה אם כבר קיים במועדפים
      const exists = savedFavorites.some((fav: any) => fav.id === lead.id);
      if (!exists) {
        const favoriteData = {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          address: lead.city,
          category: lead.category,
          rating: '4.5',
          reviews: '50',
          website: '',
          email: lead.email || '',
          quickNotes: lead.notes || '',
          addedAt: new Date().toISOString(),
          source: 'manual' as const,
          searchQuery: lead.category,
          searchLocation: lead.city
        };
        savedFavorites.push(favoriteData);
        addedCount++;
      }
    });
    
    localStorage.setItem('favorite_leads', JSON.stringify(savedFavorites));
    
    // עדכון הלידים כמסומנים בכוכב
    const updatedLeads = leads.map(lead => 
      selectedLeads.has(lead.id) ? { ...lead, starred: true } : lead
    );
    setLeads(updatedLeads);
    
    // עדכון localStorage הנכון
    const currentUser = JSON.parse(localStorage.getItem('crm_user') || 'null');
    if (currentUser) {
      const userDataKey = `crm_leads_${currentUser.id}`;
      const userData = JSON.parse(localStorage.getItem(userDataKey) || '{"leads": []}');
      userData.leads = updatedLeads;
      localStorage.setItem(userDataKey, JSON.stringify(userData));
    }
    
    setSelectedLeads(new Set());
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    
    alert(`✅ נוספו ${addedCount} לידים למועדפים (${selectedLeadsData.length - addedCount} כבר היו במועדפים)`);
  };

  const handleBulkExport = () => {
    const selectedLeadsData = leads.filter(lead => selectedLeads.has(lead.id));
    const csvContent = [
      'שם,חברה,טלפון,מייל,עיר,קטגוריה,סטטוס,ערך',
      ...selectedLeadsData.map(lead => 
        `"${lead.name}","${lead.company || ''}","${lead.phone}","${lead.email || ''}","${lead.city}","${lead.category}","${lead.status}","${lead.value || 0}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `selected_leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setSelectedLeads(new Set());
  };

  const handleBackToClient = (lead: Lead) => {
    const message = `שלום ${lead.name},\n\nאשמח לחזור אליך בנושא שדיברנו עליו.\n\nהאם זה זמן נוח לשיחה קצרה?\n\nתודה,\nצוות המכירות`;
    
    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/[^\d]/g, '');
      const whatsappUrl = `https://wa.me/972${cleanPhone.substring(1)}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else if (lead.email) {
      const subject = encodeURIComponent('חזרה ללקוח - מעקב');
      const body = encodeURIComponent(message);
      window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, '_self');
    } else {
      alert(`📞 חזור ללקוח: ${lead.name}\n\nהודעה מוכנה:\n${message}`);
    }
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result as string;
        const lines = data.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          alert('❌ הקובץ ריק או לא מכיל נתונים');
          setIsImporting(false);
          return;
        }

        // קריאת כותרות (שורה ראשונה)
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
        console.log('🔍 כותרות שנמצאו:', headers);
        
        const importedLeads: any[] = [];
        
        // עיבוד שורה אחר שורה
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue; // דלג על שורות ריקות
          
          // פיצול CSV מתקדם שמטפל בפסיקים בתוך גרשיים
          const values = [];
          let current = '';
          let inQuotes = false;
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim()); // הוסף את הערך האחרון
          
          // יצירת אובייקט ליד מהנתונים לפי הכותרות
          const leadData: any = {};
          headers.forEach((header, index) => {
            leadData[header] = values[index] ? values[index].replace(/^"|"$/g, '') : ''; // הסר גרשיים
          });
          
          // מיפוי שדות חכם - תמיכה בכותרות מהתמונה שלך
          const mappedLead = {
            business_name: leadData.business_name || leadData.contact || leadData.title || leadData.name || `ליד ${i}`,
            phone: leadData.phone || '',
            email: leadData.email || '',
            website: leadData.website || '',
            category: leadData.category || 'אחר',
            notes: leadData.notes || '',
            schedule: leadData.schedul || leadData.schedule || leadData.hours || '', // תיקון schedul
            contact_person: leadData.contact || leadData.contact_person || leadData.title || '',
            title: leadData.title || '',
            address: leadData.address || 'לא צוין',
            type: leadData.type || '',
            hours: leadData.hours || '',
            source: leadData.source || 'ייבוא Excel',
            status: leadData.status || 'חדש'
          };
          
          importedLeads.push(mappedLead);
          
          // עדכון התקדמות
          const progress = Math.round((i / (lines.length - 1)) * 100);
          setImportProgress(progress);
          
          // המתנה קצרה לאנימציה
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        if (importedLeads.length === 0) {
          alert('❌ לא נמצאו נתונים תקינים בקובץ');
          setIsImporting(false);
          return;
        }
        
        // הוספת הלידים למערכת
        const addedCount = addNewLeads(importedLeads);
        
        alert(`🎉 ייבוא הושלם בהצלחה!\n\n📊 נמצאו ${importedLeads.length} לידים בקובץ\n📥 נוספו ${addedCount} לידים חדשים למערכת\n\n🔍 הלידים החדשים מופיעים ברשימה!`);
        
        // רענון הרשימה
        setLeads(getCurrentLeads());
        
      } catch (error) {
        console.error('Error importing Excel:', error);
        alert(`❌ שגיאה בייבוא הקובץ:\n\n${error}\n\n💡 וודא שהקובץ בפורמט CSV או Excel תקין`);
      } finally {
        setIsImporting(false);
        setImportProgress(0);
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'חדש': return 'bg-blue-100 text-blue-800';
      case 'בטיפול': return 'bg-yellow-100 text-yellow-800';
      case 'הצעה': return 'bg-purple-100 text-purple-800';
      case 'נסגר': return 'bg-green-100 text-green-800';
      case 'לא רלוונטי': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleManualImport = () => {
    if (!manualImportData.trim()) {
      alert('❌ אנא הדבק נתונים');
      return;
    }

    try {
      const lines = manualImportData.trim().split('\n');
      if (lines.length < 2) {
        alert('❌ נדרשות לפחות 2 שורות (כותרות + נתונים)');
        return;
      }
      
      const headers = lines[0].split('\t').map(h => h.trim().toLowerCase());
      const importedLeads: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // דלג על שורות ריקות
        
        const values = lines[i].split('\t');
        const leadData: any = {};
        
        headers.forEach((header, index) => {
          leadData[header] = values[index] || '';
        });

        const mappedLead = {
          business_name: leadData.business_name || leadData.contact || leadData.title || `ליד ${i}`,
          phone: leadData.phone || '',
          email: leadData.email || '',
          website: leadData.website || '',
          category: leadData.category || 'אחר',
          notes: leadData.notes || '',
          schedule: leadData.schedul || leadData.schedule || leadData.hours || '',
          contact_person: leadData.contact || leadData.contact_person || leadData.title || '',
          title: leadData.title || '',
          address: leadData.address || 'לא צוין',
          type: leadData.type || '',
          hours: leadData.hours || '',
          source: 'העתק הדבק',
          status: leadData.status || 'חדש'
        };

        importedLeads.push(mappedLead);
      }

      if (importedLeads.length === 0) {
        alert('❌ לא נמצאו נתונים תקינים');
        return;
      }
      
      const addedCount = addNewLeads(importedLeads);
      alert(`🎉 הושלם! נוספו ${addedCount} לידים חדשים`);
      setLeads(getCurrentLeads());
      setShowManualImport(false);
      setManualImportData('');
    } catch (error) {
      console.error('Import error:', error);
      alert(`❌ שגיאה בעיבוד הנתונים: ${error}`);
    }
  };

  const handleShareCategory = (category: string) => {
    const permissions = prompt('בחר סוג הרשאה:\n1. view - צפייה בלבד\n2. edit - עריכה\n3. select - בחירה וייצוא\n\nהזן: view, edit או select') || 'view';
    
    if (!['view', 'edit', 'select'].includes(permissions)) {
      alert('❌ הרשאה לא תקינה. בחר: view, edit או select');
      return;
    }
    
    setSelectedCategoryToShare(category);
    const { shareCategory } = require('../../data/mockData');
    const url = shareCategory(category, leads, permissions as 'view' | 'edit' | 'select');
    setShareUrl(url);
    setShowShareModal(true);
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('🔗 לינק השיתוף הועתק ללוח!');
  };

  const handleAddNewLead = () => {
    if (!newLeadForm.name.trim() || !newLeadForm.phone.trim()) {
      alert('❌ שם וטלפון הם שדות חובה');
      return;
    }

    const leadData = {
      business_name: newLeadForm.name,
      phone: newLeadForm.phone,
      email: newLeadForm.email,
      website: '',
      category: newLeadForm.category || 'אחר',
      notes: newLeadForm.notes,
      contact_person: newLeadForm.name,
      title: '',
      address: newLeadForm.city,
      type: '',
      hours: '',
      source: 'הוספה ידנית',
      status: 'חדש'
    };

    const addedCount = addNewLeads([leadData]);
    if (addedCount > 0) {
      alert(`✅ ${newLeadForm.name} נוסף בהצלחה!`);
      setLeads(getCurrentLeads());
      setShowNewLeadForm(false);
      setNewLeadForm({
        name: '',
        company: '',
        phone: '',
        email: '',
        city: '',
        category: '',
        notes: ''
      });
    } else {
      alert('⚠️ הליד כבר קיים במערכת');
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <button 
            onClick={() => setShowNewLeadForm(true)}
            className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse text-sm md:text-base"
          >
            <Plus className="h-4 md:h-5 w-4 md:w-5" />
            <span>ליד חדש</span>
          </button>
          <div className="relative group">
            <ShareButton 
              title="לידים - קטגוריה"
              text="רשימת לידים מהמערכת"
              className="bg-purple-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2 space-x-reverse text-sm md:text-base"
            >
              <Share className="h-4 md:h-5 w-4 md:w-5" />
              <span>שתף קטגוריה</span>
            </ShareButton>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2 max-h-60 overflow-y-auto">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleShareCategory(category)}
                    className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={handleBulkExport}
            className="bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 space-x-reverse text-sm md:text-base"
          >
            <Download className="h-4 md:h-5 w-4 md:w-5" />
            <span>ייצוא</span>
          </button>
          <div className="relative">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImportExcel}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isImporting}
            />
            <button 
              className={`px-3 md:px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse text-sm md:text-base ${
                isImporting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700'
              } text-white`}
              disabled={isImporting}
            >
              <FileSpreadsheet className="h-4 md:h-5 w-4 md:w-5" />
              <span>{isImporting ? `מייבא... ${importProgress}%` : 'ייבא Excel'}</span>
            </button>
          </div>
          <button 
            onClick={() => setShowManualImport(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 md:px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 flex items-center space-x-2 space-x-reverse text-sm md:text-base"
          >
            <Upload className="h-4 md:h-5 w-4 md:w-5" />
            <span>העתק הדבק</span>
          </button>
          <button 
            onClick={() => setShowPhoneCleanup(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 md:px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center space-x-2 space-x-reverse text-sm md:text-base"
          >
            <Phone className="h-4 md:h-5 w-4 md:w-5" />
            <span>ניקוי טלפונים</span>
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
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">ניהול לידים</h1>
          <p className="text-sm md:text-base text-gray-600">{filteredLeads.length} לידים מתוך {leads.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש לפי שם, חברה, טלפון..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-sm md:text-base"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-sm md:text-base"
          >
            <option value="">כל הקטגוריות</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-sm md:text-base"
          >
            <option value="">כל הערים</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-sm md:text-base"
          >
            <option value="">כל הסטטוסים</option>
            <option value="חדש">חדש</option>
            <option value="בטיפול">בטיפול</option>
            <option value="הצעה">הצעה</option>
            <option value="נסגר">נסגר</option>
            <option value="לא רלוונטי">לא רלוונטי</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">לא נמצאו לידים</h3>
          <p className="text-gray-500">נסה לשנות את פרמטרי החיפוש או הסינון</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 md:px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-8 md:w-12">
                    <input
                      type="checkbox"
                      checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-2 md:px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32 md:min-w-40">
                    שם
                  </th>
                  <th className="hidden md:table-cell px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                    חברה
                  </th>
                  <th className="px-2 md:px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-28 md:min-w-32">
                    טלפון
                  </th>
                  <th className="hidden lg:table-cell px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48">
                    מייל
                  </th>
                  <th className="hidden md:table-cell px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-24">
                    עיר
                  </th>
                  <th className="px-2 md:px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-20 md:min-w-24">
                    סטטוס
                  </th>
                  <th className="hidden lg:table-cell px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-24">
                    ערך
                  </th>
                  <th className="px-2 md:px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32 md:min-w-48">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 md:px-3 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => handleSelectLead(lead.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-2 md:px-3 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleToggleStar(lead.id)}
                          className={`p-1 rounded-full transition-colors ${
                            favorites.has(lead.id)
                              ? 'text-yellow-400 hover:text-gray-400' 
                              : 'text-gray-400 hover:text-yellow-400'
                          }`}
                          title={favorites.has(lead.id) ? "הסר מהמועדפים" : "הוסף למועדפים"}
                        >
                          <Star className={`h-3 md:h-4 w-3 md:w-4 ${favorites.has(lead.id) ? 'fill-current' : ''}`} />
                        </button>
                        <div>
                          <div className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-24 md:max-w-32">{lead.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-24 md:max-w-32">{lead.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 py-4 text-right">
                      <div className="text-sm text-gray-900 truncate max-w-32">{lead.company || '-'}</div>
                    </td>
                    <td className="px-2 md:px-3 py-4 whitespace-nowrap text-right">
                      <div className="text-xs md:text-sm text-gray-900">{lead.phone}</div>
                    </td>
                    <td className="hidden lg:table-cell px-3 py-4 text-right">
                      <div className="text-sm text-gray-900 truncate max-w-48">{lead.email || '-'}</div>
                    </td>
                    <td className="hidden md:table-cell px-3 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900 truncate max-w-24">{lead.city}</div>
                    </td>
                    <td className="px-2 md:px-3 py-4 whitespace-nowrap text-right">
                      <span className={`inline-flex px-1 md:px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-3 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {lead.value ? `₪${lead.value.toLocaleString()}` : '-'}
                      </div>
                    </td>
                    <td className="px-2 md:px-3 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1 space-x-reverse flex-wrap gap-1">
                        <button
                          onClick={() => handleBackToClient(lead)}
                          className="p-1 md:p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors"
                          title="חזור ללקוח"
                        >
                          <MessageSquare className="h-3 md:h-3.5 w-3 md:w-3.5" />
                        </button>
                        <button
                          onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                          className="p-1 md:p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                          title="התקשר"
                        >
                          <Phone className="h-3 md:h-3.5 w-3 md:w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const message = encodeURIComponent(`שלום ${lead.name}, אשמח ליצור קשר`);
                            const cleanPhone = lead.phone.replace(/[^\d]/g, '');
                            window.open(`https://wa.me/972${cleanPhone.substring(1)}?text=${message}`, '_blank');
                          }}
                          className="p-1 md:p-1.5 text-green-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare className="h-3 md:h-3.5 w-3 md:w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (lead.email) {
                              const subject = encodeURIComponent('פנייה עסקית');
                              const body = encodeURIComponent(`שלום ${lead.name},\n\nאשמח ליצור קשר.\n\nתודה,`);
                              window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, '_self');
                            } else {
                              alert('אין כתובת מייל עבור ליד זה');
                            }
                          }}
                          className="p-1 md:p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="שלח מייל"
                        >
                          <Mail className="h-3 md:h-3.5 w-3 md:w-3.5" />
                        </button>
                        <button
                          onClick={() => handleEditLead(lead)}
                          className="p-1 md:p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
                          title="ערוך"
                        >
                          <Edit className="h-3 md:h-3.5 w-3 md:w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1 md:p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="מחק"
                        >
                          <Trash2 className="h-3 md:h-3.5 w-3 md:w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Bulk Actions */}
          {selectedLeads.size > 0 && (
            <div className="bg-gray-50 px-4 md:px-6 py-3 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleBulkAddToFavorites}
                    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                  >
                    הוסף למועדפים
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    מחק נבחרים
                  </button>
                  <button
                    onClick={handleBulkExport}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    ייצא נבחרים
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  נבחרו {selectedLeads.size} לידים
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Import Modal */}
      {showManualImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <button
                onClick={() => setShowManualImport(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold text-gray-900 text-right">
                ייבוא ידני - העתק הדבק
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  הדבק נתונים מ-Excel (Ctrl+C מ-Excel ואז Ctrl+V כאן)
                </label>
                <textarea
                  value={manualImportData}
                  onChange={(e) => setManualImportData(e.target.value)}
                  placeholder="הדבק כאן נתונים מ-Excel..."
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right font-mono text-sm"
                />
              </div>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2 text-right">הוראות:</h4>
                <ol className="text-sm text-blue-800 space-y-1 text-right">
                  <li>1. בחר את הנתונים ב-Excel (כולל כותרות)</li>
                  <li>2. לחץ Ctrl+C להעתקה</li>
                  <li>3. הדבק כאן עם Ctrl+V</li>
                  <li>4. לחץ "ייבא נתונים"</li>
                </ol>
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowManualImport(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={handleManualImport}
                  disabled={!manualImportData.trim()}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    manualImportData.trim() 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  ייבא נתונים
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Lead Form Modal */}
      {showNewLeadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <button
                onClick={() => setShowNewLeadForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold text-gray-900 text-right">
                ליד חדש
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  שם *
                </label>
                <input
                  type="text"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
                  placeholder="שם הליד"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  חברה
                </label>
                <input
                  type="text"
                  value={newLeadForm.company}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
                  placeholder="שם החברה"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  טלפון *
                </label>
                <input
                  type="tel"
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
                  placeholder="מספר טלפון"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  מייל
                </label>
                <input
                  type="email"
                  value={newLeadForm.email}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
                  placeholder="כתובת מייל"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  עיר
                </label>
                <input
                  type="text"
                  value={newLeadForm.city}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
                  placeholder="עיר"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  קטגוריה
                </label>
                <select
                  value={newLeadForm.category}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
                >
                  <option value="">בחר קטגוריה</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  הערות
                </label>
                <textarea
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
                  rows={3}
                  placeholder="הערות נוספות"
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setShowNewLeadForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={handleAddNewLead}
                  disabled={!newLeadForm.name.trim() || !newLeadForm.phone.trim()}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    newLeadForm.name.trim() && newLeadForm.phone.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  הוסף ליד
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold text-gray-900 text-right">
                שיתוף קטגוריה: {selectedCategoryToShare}
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  לינק שיתוף
                </label>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={copyShareUrl}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    העתק
                  </button>
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 text-right">איך זה עובד?</h4>
                <ul className="text-sm text-blue-800 space-y-1 text-right">
                  <li>• שלח את הלינק למי שאתה רוצה לשתף איתו</li>
                  <li>• הם יוכלו לראות רק את הלידים מהקטגוריה הזו</li>
                  <li>• הנתונים הרגישים מוסתרים</li>
                  <li>• הלינק תקף ל-7 ימים</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone Cleanup Modal */}
      {showPhoneCleanup && (
        <PhoneCleanupModal
          leads={leads}
          onClose={() => setShowPhoneCleanup(false)}
          onUpdate={(updatedLeads) => {
            setLeads(updatedLeads);
            
            // עדכון localStorage
            const currentUser = JSON.parse(localStorage.getItem('crm_user') || 'null');
            if (currentUser) {
              const userDataKey = `crm_leads_${currentUser.id}`;
              const userData = JSON.parse(localStorage.getItem(userDataKey) || '{"leads": []}');
              userData.leads = updatedLeads;
              localStorage.setItem(userDataKey, JSON.stringify(userData));
              window.dispatchEvent(new CustomEvent('leadsUpdated'));
            }
          }}
        />
      )}
    </div>
  );
};

export default LeadsManager;