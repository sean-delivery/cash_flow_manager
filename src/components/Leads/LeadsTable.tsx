import React from 'react';
import { Phone, Globe, MapPin, Star, Clock, RefreshCw, StarOff } from 'lucide-react';
import { sb } from '../../lib/supabase';
import { syncFavorites, toggleFavorite, getLocal, loadFavorites } from '../../lib/favorites';
import { useAuth } from '../../contexts/AuthContext';
import StarButton from '../common/StarButton';

type LeadRow = {
  id: string;
  name: string | null;
  rating: number | null;
  reviews_count: number | null;
  phone: string | null;
  address: string | null;
  categories: string[] | null;
  status: string | null;
  website: string | null;
  source: string;
  first_seen: string;
  last_seen: string;
};

export default function LeadsTable() {
  const [rows, setRows] = React.useState<LeadRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { email } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await sb
        .from('leads')
        .select('*')
        .order('last_seen', { ascending: false })
        .limit(1000);
      
      if (error) {
        console.warn('⚠️ טבלת leads לא קיימת:', error.message);
        setRows([]);
      } else {
        setRows(data || []);
      }
    } catch (error) {
      console.warn('⚠️ טבלת leads לא קיימת, מציג רשימה ריקה');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { 
    void load(); 
  }, []);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'open': return 'פתוח';
      case 'closed': return 'סגור';
      default: return 'לא ידוע';
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={load}
          disabled={loading}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse ${
            loading 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'טוען...' : 'רענן טבלה'}</span>
        </button>
        <h3 className="text-lg font-semibold text-gray-900 text-right">
          היסטוריית לידים ({rows.length})
        </h3>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-auto max-h-96">
          <table role="grid" className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <Th>שם</Th>
                <Th>דירוג</Th>
                <Th>ביקורות</Th>
                <Th>טלפון</Th>
                <Th>כתובת</Th>
                <Th>קטגוריות</Th>
                <Th>סטטוס</Th>
                <Th>מקור</Th>
                <Th>נראה לראשונה</Th>
                <Th>נראה לאחרונה</Th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <Td>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <StarButton leadId={r.id} />
                    {r.website ? (
                      <a 
                        href={r.website.startsWith('http') ? r.website : `https://${r.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 space-x-reverse"
                      >
                        <Globe className="h-3 w-3" />
                        <span>{r.name || '-'}</span>
                      </a>
                    ) : (
                      r.name || '-'
                    )}
                    </div>
                  </Td>
                  <Td>
                    {r.rating ? (
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span>{r.rating}</span>
                      </div>
                    ) : '-'}
                  </Td>
                  <Td>{r.reviews_count ?? '-'}</Td>
                  <Td>
                    {r.phone ? (
                      <a 
                        href={`tel:${r.phone}`}
                        className="text-green-600 hover:text-green-700 flex items-center space-x-1 space-x-reverse"
                      >
                        <Phone className="h-3 w-3" />
                        <span>{r.phone}</span>
                      </a>
                    ) : '-'}
                  </Td>
                  <Td>
                    {r.address ? (
                      <div className="flex items-center space-x-1 space-x-reverse max-w-48">
                        <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{r.address}</span>
                      </div>
                    ) : '-'}
                  </Td>
                  <Td>
                    {r.categories?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {r.categories.slice(0, 2).map((cat, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {cat}
                          </span>
                        ))}
                        {r.categories.length > 2 && (
                          <span className="text-xs text-gray-500">+{r.categories.length - 2}</span>
                        )}
                      </div>
                    ) : '-'}
                  </Td>
                  <Td>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(r.status)}`}>
                      {getStatusText(r.status)}
                    </span>
                  </Td>
                  <Td>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                      {r.source}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {new Date(r.first_seen).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {new Date(r.last_seen).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                  </Td>
                </tr>
              ))}
              {(!loading && rows.length === 0) && (
                <tr>
                  <Td colSpan={10} className="text-center text-gray-500 py-8">
                    אין לידים בהיסטוריה. השתמש בחיפוש כדי להוסיף לידים חדשים.
                  </Td>
                </tr>
              )}
              {loading && (
                <tr>
                  <Td colSpan={10} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2 space-x-reverse">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-gray-600">טוען לידים...</span>
                    </div>
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children, ...props }: any) {
  return (
    <th 
      className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 z-10"
      {...props}
    >
      {children}
    </th>
  );
}

function Td({ children, className = '', ...props }: any) {
  return (
    <td 
      className={`px-4 py-3 text-right text-sm text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}