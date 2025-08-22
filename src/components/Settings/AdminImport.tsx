import React, { useRef, useState } from 'react';
import { Upload, Database, FileText, RefreshCw, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { syncFavorites, getLocal } from '../../lib/favorites';

export default function AdminImport() {
  const { user, email } = useAuth();
  if (user?.role !== 'admin') return null;

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const favoritesRef = useRef<HTMLInputElement>(null);

  const handleFileImport = async (files: FileList | null) => {
    if (!files?.[0]) return;
    
    setBusy(true);
    setStatus('קורא קובץ...');
    
    try {
      const text = await files[0].text();
      let rows: any[] = [];

      // Detect format and parse
      if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
        // JSON format
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          rows = parsed;
        } else if (parsed.leads) {
          rows = parsed.leads;
        } else if (parsed.results) {
          rows = parsed.results;
        } else if (parsed.items) {
          rows = parsed.items;
        }
      } else {
        // CSV format
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) throw new Error('CSV ריק או לא תקין');
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });
      }

      if (rows.length === 0) {
        throw new Error('לא נמצאו נתונים בקובץ');
      }

      setStatus(`מייבא ${rows.length} רשומות...`);

      // Map to leads format
      const mappedLeads = rows.map((row, index) => ({
        id: row.id || row.place_id || `imported_${Date.now()}_${index}`,
        source: 'imported',
        external_id: row.external_id || row.place_id || `imp_${index}`,
        name: row.name || row.business_name || row.title || `ליד ${index + 1}`,
        address: row.address || row.formatted_address || '',
        phone: row.phone || row.formatted_phone_number || '',
        website: row.website || '',
        rating: parseFloat(row.rating) || null,
        reviews_count: parseInt(row.reviews_count || row.user_ratings_total) || null,
        lat: parseFloat(row.lat || row.latitude) || null,
        lng: parseFloat(row.lng || row.longitude) || null,
        categories: row.categories || (row.category ? [row.category] : null),
        status: row.status || 'imported',
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        raw: row
      }));

      // Send in chunks of 200
      let totalImported = 0;
      for (let i = 0; i < mappedLeads.length; i += 200) {
        const chunk = mappedLeads.slice(i, i + 200);
        setStatus(`מייבא ${i + 1}-${Math.min(i + 200, mappedLeads.length)} מתוך ${mappedLeads.length}...`);
        
        const response = await fetch('/.netlify/functions/save_serpapi_results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            p_term: 'imported_data',
            p_location: 'various',
            p_rows: chunk
          })
        });

        if (response.ok) {
          totalImported += chunk.length;
        }
      }

      setStatus(`הושלם! יובאו ${totalImported} לידים`);
      setTimeout(() => setStatus(''), 3000);
      
    } catch (error) {
      setStatus(`שגיאה: ${error}`);
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleFavoritesImport = async (files: FileList | null) => {
    if (!files?.[0]) return;
    
    setBusy(true);
    setStatus('מייבא מועדפים...');
    
    try {
      const text = await files[0].text();
      const json = JSON.parse(text);
      
      // תומך במפתחות שכיחים
      const keys = ['favorites', 'tracked', 'watchlist', 'tracked_leads', 'favorites_set', 'favorite_leads'];
      const set = new Set<string>();
      
      for (const k of keys) {
        const v = json?.localStorage?.[k] || json?.[k];
        try {
          const parsed = Array.isArray(v) ? v : JSON.parse(v || '[]');
          parsed.forEach((item: any) => {
            // תומך גם באובייקטים עם id וגם במחרוזות
            const id = typeof item === 'string' ? item : item?.id;
            if (id) set.add(String(id));
          });
        } catch (error) {
          console.warn(`Failed to parse favorites from key ${k}:`, error);
        }
      }
      
      // שמירה לוקאלית ואז סנכרון
      localStorage.setItem(`favorites:${(email || 'guest').toLowerCase()}`, JSON.stringify([...set]));
      const syncedSet = await syncFavorites(email || 'guest');
      
      setStatus(`יובאו ${syncedSet.size} מועדפים מהגיבוי`);
      setTimeout(() => setStatus(''), 3000);
      
      // עדכון הרכיבים
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      
    } catch (error) {
      setStatus(`שגיאה בייבוא מועדפים: ${error}`);
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setBusy(false);
      if (favoritesRef.current) favoritesRef.current.value = '';
    }
  };

  const handleSyncFavorites = async () => {
    setBusy(true);
    setStatus('מסנכרן מועדפים...');
    
    try {
      const syncedFavorites = await syncFavorites(email || 'guest');
      setStatus(`סונכרנו ${syncedFavorites.size} מועדפים עם DB`);
      setTimeout(() => setStatus(''), 3000);
      
      // עדכון הרכיבים
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      
    } catch (error) {
      setStatus(`שגיאה בסנכרון: ${error}`);
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setBusy(false);
    }
  };
  const handleDBRestore = async () => {
    setBusy(true);
    setStatus('מחפש גיבויים...');
    
    try {
      const response = await fetch('/.netlify/functions/restore_from_backup', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.ok) {
        setStatus(`שוחזרו ${result.totalRestored || 0} לידים מגיבוי DB`);
      } else {
        setStatus('לא נמצאו גיבויים ב-DB');
      }
      
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus(`שגיאה בשחזור: ${error}`);
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
      <h4 className="font-medium text-yellow-900 mb-3 text-right">🔧 ייבוא לידים (Admin בלבד)</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <input
            type="file"
            accept=".csv,.json"
            ref={fileRef}
            onChange={(e) => handleFileImport(e.target.files)}
            disabled={busy}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center space-x-2 space-x-reverse"
          >
            <FileText className="h-4 w-4" />
            <span>ייבוא CSV/JSON</span>
          </button>
        </div>
        
        <button
          onClick={handleDBRestore}
          disabled={busy}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center space-x-2 space-x-reverse"
        >
          <Database className="h-4 w-4" />
          <span>שחזור מגיבוי DB</span>
        </button>
        
        <div>
          <input
            type="file"
            accept=".json"
            ref={favoritesRef}
            onChange={(e) => handleFavoritesImport(e.target.files)}
            disabled={busy}
            className="hidden"
          />
          <button
            onClick={() => favoritesRef.current?.click()}
            disabled={busy}
            className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 flex items-center justify-center space-x-2 space-x-reverse"
          >
            <Star className="h-4 w-4" />
            <span>ייבוא מועדפים</span>
          </button>
        </div>
        
        <button
          onClick={handleSyncFavorites}
          disabled={busy}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center space-x-2 space-x-reverse"
        >
          <RefreshCw className="h-4 w-4" />
          <span>סנכרן מועדפים</span>
        </button>
      </div>
      
      {status && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 text-right">
          {busy && <RefreshCw className="h-3 w-3 animate-spin inline ml-1" />}
          {status}
        </div>
      )}
      
      <div className="mt-3 text-xs text-yellow-700 text-right">
        תומך CSV (id,name,phone,email,city,created_at) ו-JSON עם מפתחות leads/results/items
      </div>
    </div>
  );
}