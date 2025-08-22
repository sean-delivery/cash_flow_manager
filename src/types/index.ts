export interface Lead {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email?: string;
  city: string;
  category: string;
  status: 'חדש' | 'בטיפול' | 'הצעה' | 'נסגר' | 'לא רלוונטי';
  priority: 1 | 2 | 3 | 4 | 5;
  starred: boolean;
  notes?: string;
  privateNotes?: string;
  createdAt: Date;
  lastContact?: Date;
  source?: string;
  value?: number;
  userId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  leadId?: string;
  priority: 'נמוכה' | 'בינונית' | 'גבוהה';
  createdAt: Date;
}

export interface Duplicate {
  leads: Lead[];
  similarity: number;
  reason: string;
}

export interface GoogleSearchResult {
  id: string;
  business_name: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  hours?: string;
  latitude?: number;
  longitude?: number;
  source: 'google_search';
  search_query: string;
  region: string;
  found_at: Date;
  selected?: boolean;
}

export interface SearchQuery {
  id: string;
  category: string;
  region: string;
  query: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  results_count: number;
  created_at: Date;
  completed_at?: Date;
}