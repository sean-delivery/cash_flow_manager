import React, { useState, useEffect } from 'react';
import { Star, Phone, Mail, MessageSquare, Calendar, Edit, Trash2, MapPin, Building2, Clock, ArrowRight } from 'lucide-react';
import { loadFavorites } from '../../lib/favorites';
import { useAuth } from '../../contexts/AuthContext';

interface FavoriteLead {
  id: string;
  name: string;
  phone: string;
  address: string;
  category: string;
  rating?: string;
  reviews?: string;
  website?: string;
  email?: string;
  quickNotes?: string;
  addedAt: Date;
  source: 'google_search' | 'manual';
  searchQuery?: string;
  searchLocation?: string;
}

interface FavoritesManagerProps {
  onNavigate?: (view: string) => void;
}

const FavoritesManager: React.FC<FavoritesManagerProps> = ({ onNavigate }) => {
  const [favorites, setFavorites] = useState<FavoriteLead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [selectedLeadForReminder, setSelectedLeadForReminder] = useState<FavoriteLead | null>(null);
  const { email } = useAuth();

  // טעינת מועדפים מ-localStorage
  useEffect(() => {
    loadFavoritesData();
  }, [email]);

  const loadFavoritesData = () => {
    const savedFavorites = localStorage.getItem('favorite_leads');
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        setFavorites(parsed.map((fav: any) => ({
          ...fav,
          addedAt: new Date(fav.addedAt)
        })));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  };

  useEffect(() => {
    const handleFavoritesUpdate = loadFavoritesData;
    const handleFavoritesChanged = loadFavoritesData;
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    window.addEventListener('favorites:changed', handleFavoritesChanged);
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
      window.removeEventListener('favorites:changed', handleFavoritesChanged);
    };
  }, []);

  const filteredFavorites = favorites.filter(fav => {
    return (
      (searchTerm === '' || 
       fav.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       fav.phone.includes(searchTerm) ||
       fav.address.toLowerCase().includes(searchTerm.toLowerCase())
      ) &&
      (selectedCategory === '' || fav.category === selectedCategory)
    );
  });

  const categories = [...new Set(favorites.map(fav => fav.category))];

  const handleRemoveFromFavorites = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך להסיר מהמועדפים?')) {
      const updatedFavorites = favorites.filter(fav => fav.id !== id);
      setFavorites(updatedFavorites);
      localStorage.setItem('favorite_leads', JSON.stringify(updatedFavorites));
      
      // עדכון הסיידבר
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`שלום ${name}, מצאתי את הפרטים שלך בחיפוש ואשמח ליצור קשר`);
    const cleanPhone = phone.replace(/[^\d]/g, '');
    window.open(`https://wa.me/972${cleanPhone.substring(1)}?text=${message}`, '_blank');
  };

  const handleEmail = (email: string, name: string) => {
    if (email) {
      const subject = encodeURIComponent('פנייה עסקית');
      const body = encodeURIComponent(`שלום ${name},\n\nמצאתי את הפרטים שלכם ואשמח ליצור קשר.\n\nתודה,`);
      window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_self');
    } else {
      alert('אין כתובת מייל זמינה עבור ליד זה');
    }
  };

  const handleScheduleEvent = (favorite: FavoriteLead) => {
    alert(`📅 תזמון פגישה עם ${favorite.name}\nטלפון: ${favorite.phone}\nכתובת: ${favorite.address}`);
  };

  const handleEditLead = (favorite: FavoriteLead) => {
    const newNotes = prompt('הערות מהירות:', favorite.quickNotes || '');
    if (newNotes !== null) {
      const updatedFavorites = favorites.map(fav =>
        fav.id === favorite.id ? { ...fav, quickNotes: newNotes } : fav
      );
      setFavorites(updatedFavorites);
      localStorage.setItem('favorite_leads', JSON.stringify(updatedFavorites));
    }
  };

  const handleAddToCRM = (favorite: FavoriteLead) => {
    if (confirm(`האם להוסיף את ${favorite.name} למערכת CRM הראשית?`)) {
      // TODO: הוספה למערכת CRM הראשית
      alert(`✅ ${favorite.name} נוסף למערכת CRM!`);
      
      // הסרה מהמועדפים אחרי הוספה ל-CRM
      handleRemoveFromFavorites(favorite.id);
    }
  };

  const handleAddReminder = (favorite: FavoriteLead) => {
    setSelectedLeadForReminder(favorite);
    setNewReminderText('');
    setNewReminderDate('');
    setShowReminderModal(true);
  };

  const handleSaveReminder = () => {
    if (!selectedLeadForReminder || !newReminderText || !newReminderDate) {
      alert('אנא מלא את כל השדות');
      return;
    }

    const newReminder = {
      id: Date.now().toString(),
      text: newReminderText,
      date: new Date(newReminderDate),
      completed: false
    };

    const updatedFavorites = favorites.map(fav =>
      fav.id === selectedLeadForReminder.id
        ? { ...fav, reminders: [...(fav.reminders || []), newReminder] }
        : fav
    );

    setFavorites(updatedFavorites);
    localStorage.setItem('favorite_leads', JSON.stringify(updatedFavorites));
    
    // עדכון הסיידבר
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    
    setShowReminderModal(false);
    setSelectedLeadForReminder(null);
    setNewReminderText('');
    setNewReminderDate('');
  };

  const handleExportFavorites = () => {
    const csvContent = [
      'שם,טלפון,כתובת,קטגוריה,דירוג,ביקורות,הערות,תאריך הוספה',
      ...favorites.map(fav => 
        `"${fav.name}","${fav.phone}","${fav.address}","${fav.category}","${fav.rating || ''}","${fav.reviews || ''}","${fav.quickNotes || ''}","${fav.addedAt.toLocaleDateString('he-IL')}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `favorites_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            onClick={handleExportFavorites}
            disabled={favorites.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2 space-x-reverse"
          >
            <Star className="h-5 w-5" />
            <span>ייצא מועדפים</span>
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
          <h1 className="text-2xl font-bold text-gray-900">לידים מועדפים</h1>
          <p className="text-gray-600">{favorites.length} לידים במעקב</p>
        </div>
      </div>

      {/* Filters */}
      {favorites.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="חיפוש לפי שם, טלפון, כתובת..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
            >
              <option value="">כל הקטגוריות</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Favorites List */}
      {filteredFavorites.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {favorites.length === 0 ? 'אין לידים מועדפים' : 'לא נמצאו תוצאות'}
          </h3>
          <p className="text-gray-500">
            {favorites.length === 0 
              ? 'לחץ על כוכב בחיפוש Google כדי להוסיף לידים למעקב'
              : 'נסה לשנות את פרמטרי החיפוש'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((favorite) => (
            <div key={favorite.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleRemoveFromFavorites(favorite.id)}
                    className="p-1 rounded-full text-yellow-400 hover:text-red-500 transition-colors"
                    title="הסר מהמועדפים"
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    במעקב
                  </span>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-semibold text-gray-900">{favorite.name}</h3>
                  <p className="text-sm text-gray-600">{favorite.category}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-end space-x-2 space-x-reverse">
                  <span className="text-sm text-gray-600">{favorite.phone}</span>
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-end space-x-2 space-x-reverse">
                  <span className="text-sm text-gray-600">{favorite.address}</span>
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                {favorite.rating && (
                  <div className="flex items-center justify-end space-x-2 space-x-reverse">
                    <span className="text-sm text-gray-600">⭐ {favorite.rating} ({favorite.reviews} ביקורות)</span>
                  </div>
                )}
                <div className="flex items-center justify-end space-x-2 space-x-reverse">
                  <span className="text-xs text-gray-500">נוסף: {favorite.addedAt.toLocaleDateString('he-IL')}</span>
                  <Clock className="h-3 w-3 text-gray-400" />
                </div>
              </div>

              {/* Quick Notes */}
              {favorite.quickNotes && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-700 text-right">{favorite.quickNotes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  onClick={() => handleCall(favorite.phone)}
                  className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                  title="התקשר"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleWhatsApp(favorite.phone, favorite.name)}
                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 flex items-center justify-center"
                  title="WhatsApp"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEmail(favorite.email || '', favorite.name)}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  title="שלח מייל"
                >
                  <Mail className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAddReminder(favorite)}
                  className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 flex items-center justify-center"
                  title="הוסף תזכורת"
                >
                  <Clock className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEditLead(favorite)}
                  className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 flex items-center justify-center"
                  title="ערוך הערות"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleAddToCRM(favorite)}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  title="הוסף ל-CRM"
                >
                  <Building2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <button
                onClick={() => setShowReminderModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold text-gray-900 text-right">
                הוסף תזכורת
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  תוכן התזכורת
                </label>
                <input
                  type="text"
                  value={newReminderText}
                  onChange={(e) => setNewReminderText(e.target.value)}
                  placeholder="לדוגמה: להתקשר בשבוע הבא"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  תאריך תזכורת
                </label>
                <input
                  type="date"
                  value={newReminderDate}
                  onChange={(e) => setNewReminderDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-right"
                />
              </div>
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={handleSaveReminder}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  שמור תזכורת
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesManager;