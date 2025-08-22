import { sb } from './supabase';

const NETLIFY_ENDPOINT = '/.netlify/functions/serpapi';

export type NormalizedLead = {
  place_id: string;
  rank?: number;
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews_count?: number;
  lat?: number;
  lng?: number;
  categories?: string[];
  status?: string;
};

function normalizeSerpItem(item: any, rank?: number): NormalizedLead {
  const gps = item?.gps_coordinates || {};
  const open = item?.opening_hours?.open_now;
  const cats = Array.isArray(item?.type) ? item.type :
               Array.isArray(item?.category) ? item.category :
               item?.type ? String(item.type).split(',').map((s:string)=>s.trim()) : undefined;

  return {
    place_id: item.place_id || item.cid || item.data_id || `${item.title}-${item.address}-${rank ?? ''}`,
    rank,
    name: item.title ?? item.name,
    address: item.address,
    phone: item.phone?.replace(/\s+/g, '') || undefined,
    website: item.website,
    rating: typeof item.rating === 'number' ? item.rating : undefined,
    reviews_count: typeof item.reviews === 'number' ? item.reviews : undefined,
    lat: typeof gps.latitude === 'number' ? gps.latitude : undefined,
    lng: typeof gps.longitude === 'number' ? gps.longitude : undefined,
    categories: cats,
    status: open === true ? 'open' : open === false ? 'closed' : 'unknown',
  };
}

// פונקציה לשמירת גיבוי אוטומטי של לידים
function saveLeadsBackup(leads: NormalizedLead[], searchTerm: string) {
  const timestamp = new Date().toISOString();
  const backupKey = `leads_backup_${timestamp.split('T')[0]}`;
  const backup = {
    timestamp,
    searchTerm,
    leads,
    count: leads.length
  };
  
  // שמירה ב-localStorage עם מפתח ייחודי
  localStorage.setItem(backupKey, JSON.stringify(backup));
  
  // שמירה ברשימת גיבויים
  const backupsList = JSON.parse(localStorage.getItem('leads_backups_list') || '[]');
  backupsList.push({ key: backupKey, timestamp, searchTerm, count: leads.length });
  
  // שמירת רק 50 גיבויים אחרונים
  const limitedBackups = backupsList.slice(-50);
  localStorage.setItem('leads_backups_list', JSON.stringify(limitedBackups));
  
  console.log(`💾 גיבוי נשמר: ${backupKey} (${leads.length} לידים)`);
}

// פונקציה לשחזור לידים מגיבויים
export function restoreLeadsFromBackups(): NormalizedLead[] {
  console.log('🔍 מחפש לידים בגיבויים...');
  
  const backupsList = JSON.parse(localStorage.getItem('leads_backups_list') || '[]');
  const allRestoredLeads: NormalizedLead[] = [];
  
  // שחזור מכל הגיבויים
  backupsList.forEach((backup: any) => {
    try {
      const backupData = localStorage.getItem(backup.key);
      if (backupData) {
        const parsed = JSON.parse(backupData);
        if (parsed.leads && Array.isArray(parsed.leads)) {
          allRestoredLeads.push(...parsed.leads);
          console.log(`✅ שוחזרו ${parsed.leads.length} לידים מ-${backup.key}`);
        }
      }
    } catch (error) {
      console.warn(`⚠️ שגיאה בשחזור ${backup.key}:`, error);
    }
  });
  
  // הסרת כפילויות לפי place_id
  const uniqueLeads = allRestoredLeads.filter((lead, index, self) =>
    index === self.findIndex(l => l.place_id === lead.place_id)
  );
  
  console.log(`🎉 שוחזרו ${uniqueLeads.length} לידים ייחודיים מגיבויים`);
  return uniqueLeads;
}

export async function searchSerpAndSave(q: string, location?: string) {
  console.log('🔍 searchSerpAndSave called with:', { q, location });
  
  if (!q?.trim()) {
    throw new Error('חסר פרמטר חיפוש');
  }
  
  console.log('📡 מנסה Supabase Edge Function קודם...');
  
  try {
    // נסה קודם Supabase Edge Function
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/serpapi-search`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      };
      
      console.log('🌐 API URL:', apiUrl);
      console.log('🔐 Headers configured:', !!headers.Authorization);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: q,
          location: location || 'Israel',
          maxResults: 60
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.local_results && data.local_results.length > 0) {
          const rows = data.local_results.map((item: any, index: number) => ({
            ...item,
            place_id: item.place_id || `temp_${Date.now()}_${index}`,
            name: item.title || item.name,
            address: item.address,
            phone: item.phone,
            website: item.website,
            rating: item.rating,
            reviews_count: item.reviews,
            categories: item.type ? [item.type] : []
          }));
          
          console.log('✅ Supabase Edge Function success:', rows.length);
          return { searchId: null, rows };
        }
      }
      
      console.log('⚠️ Supabase Edge Function failed, trying Netlify...');
    } catch (supabaseError) {
      console.log('⚠️ Supabase Edge Function error, trying Netlify...', supabaseError);
    }
    
    // Fallback ל-Netlify Function
    console.log('📡 מנסה Netlify Function...');
    const netlifyUrl = '/.netlify/functions/serpapi';
    const netlifyParams = new URLSearchParams({
      q: q,
      location: location || 'Israel',
      engine: 'google_local',
      hl: 'he',
      gl: 'il'
    });
    
    const netlifyResponse = await fetch(`${netlifyUrl}?${netlifyParams}`);
    
    console.log('📡 Netlify Response status:', netlifyResponse.status);
    
    if (!netlifyResponse.ok) {
      const errorText = await netlifyResponse.text();
      console.error('❌ Netlify Function Error:', netlifyResponse.status, errorText);
      
      if (netlifyResponse.status === 500 && errorText.includes('SERPAPI_KEY')) {
        throw new Error('🔑 API Key לא מוגדר ב-Netlify - צור קשר עם התמיכה');
      }
      
      throw new Error(`Netlify Function Error: ${netlifyResponse.status}`);
    }
    
    const netlifyData = await netlifyResponse.json();
    
    if (netlifyData.error) {
      console.error('❌ SerpAPI returned error:', netlifyData.error);
      throw new Error(netlifyData.message || netlifyData.error);
    }
    
    const items = netlifyData?.local_results || [];
    console.log('📋 Netlify results count:', items.length);
    
    if (items.length === 0) {
      console.warn('⚠️ SerpAPI לא החזיר תוצאות');
      return { searchId: null, rows: [] };
    }
    
    const rows = items.map((item: any, index: number) => ({
      ...item,
      place_id: item.place_id || item.data_id || `temp_${Date.now()}_${index}`,
      name: item.title || item.name,
      address: item.address,
      phone: item.phone,
      website: item.website,
      rating: item.rating,
      reviews_count: item.reviews,
      categories: item.type ? [item.type] : []
    }));
    
    console.log('✅ Netlify Function success:', rows.length);
    return { searchId: null, rows };
    
  } catch (error: any) {
    console.error('❌ All SerpAPI methods failed:', error);
    
    // אם זה שגיאת API Key, תן הודעה ברורה
    if (error.message?.includes('Invalid API key') || 
        error.message?.includes('401') || 
        error.message?.includes('403') ||
        error.message?.includes('SERPAPI_KEY')) {
      throw new Error('🔑 בעיית API Key - צור קשר עם התמיכה לתיקון');
    }
    
    // שגיאות אחרות
    throw new Error(`שגיאה בחיפוש: ${error.message}`);
  }
}

interface SerpApiResult {
  position: number;
  title: string;
  place_id: string;
  data_id: string;
  data_cid: string;
  reviews_link: string;
  photos_link: string;
  gps_coordinates: {
    latitude: number;
    longitude: number;
  };
  place_id_search: string;
  provider_id: string;
  rating: number;
  reviews: number;
  type: string;
  types: string[];
  type_id: string;
  address: string;
  open_state: string;
  hours: string;
  operating_hours: {
    [key: string]: string;
  };
  phone: string;
  website: string;
  description: string;
  service_options: {
    dine_in: boolean;
    takeout: boolean;
    delivery: boolean;
  };
  thumbnail: string;
}

interface SerpApiResponse {
  search_metadata: {
    id: string;
    status: string;
    json_endpoint: string;
    created_at: string;
    processed_at: string;
    google_maps_url: string;
    raw_html_file: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    q: string;
    google_domain: string;
    hl: string;
    gl: string;
    type: string;
  };
  search_information: {
    local_results_state: string;
    query_displayed: string;
  };
  local_results: SerpApiResult[];
}

class SerpApiManager {
  private readonly ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/serpapi-search`;
  private readonly FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sdWpuZWpqd2hqa29mY3N4Z2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMTI2NzQsImV4cCI6MjA0OTU4ODY3NH0.VQxJZhZvQQGjNQXLrwJQxQGjNQXLrwJQxQGjNQXLrwJQ';

  async searchGoogleMapsWithProgress(
    query: string, 
    location: string = 'Israel', 
    maxResults: number = 100,
    onProgress?: (progress: { current: number; total: number; page: number }) => void
  ): Promise<SerpApiResult[]> {
    console.log('🚀 מתחיל חיפוש מתקדם עם SerpAPI...');
    console.log(`🎯 מטרה: ${maxResults} תוצאות מקסימליות`);
    
    const allResults: SerpApiResult[] = [];
    let start = 0;
    const resultsPerPage = 20; // SerpAPI מחזיר עד 20 תוצאות בכל קריאה
    let totalPages = Math.ceil(maxResults / resultsPerPage);
    
    console.log(`📄 מתכנן ${totalPages} עמודים לחיפוש מקסימלי`);
    
    for (let page = 0; page < totalPages; page++) {
      console.log(`📄 עמוד ${page + 1}/${totalPages} - מתחיל מתוצאה ${start}`);
      
      // עדכון התקדמות
      if (onProgress) {
        onProgress({
          current: allResults.length,
          total: maxResults,
          page: page + 1
        });
      }
      
      const pageResults = await this.searchSinglePage(query, location, start);
      
      if (pageResults.length === 0) {
        console.log('🏁 אין עוד תוצאות - מסיים חיפוש');
        break;
      }
      
      allResults.push(...pageResults);
      console.log(`✅ עמוד ${page + 1}: נמצאו ${pageResults.length} תוצאות (סה"כ: ${allResults.length})`);
      
      // אם הגענו למספר המבוקש
      if (allResults.length >= maxResults) {
        console.log(`🎯 הגענו למטרה: ${allResults.length} תוצאות`);
        break;
      }
      
      // אם זה לא העמוד האחרון, המתן קצת למניעת rate limiting
      if (page < totalPages - 1 && pageResults.length === resultsPerPage) {
        console.log('⏳ המתנה 2 שניות למניעת rate limiting...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      start += resultsPerPage;
    }
    
    const finalResults = allResults.slice(0, maxResults);
    console.log(`🎉 חיפוש הושלם! סה"כ: ${finalResults.length} תוצאות אמיתיות`);
    
    // עדכון התקדמות סופי
    if (onProgress) {
      onProgress({
        current: finalResults.length,
        total: maxResults,
        page: Math.ceil(finalResults.length / resultsPerPage)
      });
    }
    
    return finalResults;
  }

  async searchGoogleMaps(query: string, location: string = 'Israel', maxResults: number = 100): Promise<SerpApiResult[]> {
    console.log('🚀 מתחיל חיפוש מתקדם עם SerpAPI...');
    console.log(`🎯 מטרה: ${maxResults} תוצאות מקסימליות`);
    
    const allResults: SerpApiResult[] = [];
    let start = 0;
    const resultsPerPage = 20; // SerpAPI מחזיר עד 20 תוצאות בכל קריאה
    let totalPages = Math.ceil(maxResults / resultsPerPage);
    
    console.log(`📄 מתכנן ${totalPages} עמודים לחיפוש מקסימלי`);
    
    for (let page = 0; page < totalPages; page++) {
      console.log(`📄 עמוד ${page + 1}/${totalPages} - מתחיל מתוצאה ${start}`);
      
      const pageResults = await this.searchSinglePage(query, location, start);
      
      if (pageResults.length === 0) {
        console.log('🏁 אין עוד תוצאות - מסיים חיפוש');
        break;
      }
      
      allResults.push(...pageResults);
      console.log(`✅ עמוד ${page + 1}: נמצאו ${pageResults.length} תוצאות (סה"כ: ${allResults.length})`);
      
      // אם הגענו למספר המבוקש
      if (allResults.length >= maxResults) {
        console.log(`🎯 הגענו למטרה: ${allResults.length} תוצאות`);
        break;
      }
      
      // אם זה לא העמוד האחרון, המתן קצת למניעת rate limiting
      if (page < totalPages - 1 && pageResults.length === resultsPerPage) {
        console.log('⏳ המתנה 2 שניות למניעת rate limiting...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      start += resultsPerPage;
    }
    
    const finalResults = allResults.slice(0, maxResults);
    console.log(`🎉 חיפוש הושלם! סה"כ: ${finalResults.length} תוצאות אמיתיות`);
    
    return finalResults;
  }
  
  private async searchSinglePage(query: string, location: string, start: number): Promise<SerpApiResult[]> {
    console.log(`🔍 SerpAPI עמוד ${Math.floor(start/20) + 1}:`, query, 'ב-', location, `(start: ${start})`);
    
    try {
      const response = await fetch(NETLIFY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || this.FALLBACK_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          location,
          start,
          maxResults: 20
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        // הגנה על HTML 404
        if (errorText.includes('<html>') || errorText.includes('<!DOCTYPE')) {
          throw new Error('Netlify Function לא נמצאת - החזירה HTML במקום JSON');
        }
        
        throw new Error(`SerpAPI proxy error ${response.status}: ${errorText.substring(0, 200)}`);
      }
      
      const ct = response.headers.get('content-type') || '';
      const text = await response.text();
      
      // הגנה על HTML 404
      if (text.includes('<html>') || text.includes('<!DOCTYPE')) {
        throw new Error('Netlify Function החזירה HTML במקום JSON - כנראה 404');
      }
      
      if (!ct.includes('application/json')) {
        throw new Error(`Non-JSON response (status ${response.status}). Content-Type: ${ct}`);
      }
      
      try {
        const data = JSON.parse(text);
        return data.local_results || [];
      } catch (parseError) {
        throw new Error(`JSON parse failed (status ${response.status})`);
      }
      
    } catch (error) {
      console.error(`❌ SerpAPI Error עמוד ${Math.floor(start/20) + 1}:`, error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<any> {
    try {
      const response = await fetch(NETLIFY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          place_id: placeId
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SerpAPI proxy error ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Non-JSON response (status ${response.status})`);
      }
      return data;

    } catch (error) {
      console.error('❌ SerpAPI Details Error:', error);
      throw error;
    }
  }

  // פונקציה לבדיקת תקינות API Key
  async testApiKey(): Promise<boolean> {
    try {
      const response = await fetch(NETLIFY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: 'test',
          location: 'Israel',
          maxResults: 1
        })
      });
      
      return true;
    } catch (error: any) {
      if (error.message.includes('401') || error.message.includes('403')) {
        console.error('❌ API Key לא תקין');
        return false;
      }
      // שגיאות אחרות עדיין מצביעות על API Key תקין
      return true;
    }
  }

  // פונקציה לקבלת מידע על השימוש
  async getUsageInfo(): Promise<any> {
    try {
      const response = await fetch(NETLIFY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'account'
        })
      });
      
      if (response.ok) {
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          return null;
        }
        return data;
      }
      return null;
    } catch (error) {
      console.error('❌ לא ניתן לקבל מידע על השימוש:', error);
      return null;
    }
  }
}

export const serpApi = new SerpApiManager();

// Backward compatibility shim