import { Lead, Task } from '../types';

// פונקציה לשחזור לידים שנעלמו
export const restoreLeadsFromAllSources = (): Lead[] => {
  console.log('🔍 מחפש לידים שנעלמו בכל המקורות...');
  
  const currentUser = JSON.parse(localStorage.getItem('crm_user') || 'null');
  if (!currentUser) {
    console.warn('⚠️ אין משתמש מחובר');
    return [];
  }
  
  const restoredLeads: Lead[] = [];
  
  // שלב 1: חיפוש בכל מפתחות localStorage
  const allKeys = Object.keys(localStorage);
  
  // חיפוש גיבויים של לידים
  const leadBackupKeys = allKeys.filter(key => 
    key.includes('leads_backup_') || 
    key.includes('search_backup_') ||
    key.includes('crm_leads_') ||
    key.includes('favorite_leads') ||
    key.includes('google_search_results')
  );
  
  console.log(`🔍 נמצאו ${leadBackupKeys.length} מפתחות גיבוי`);
  
  leadBackupKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return;
      
      const parsed = JSON.parse(data);
      
      // טיפול בפורמטים שונים
      let leadsToAdd: any[] = [];
      
      if (Array.isArray(parsed)) {
        leadsToAdd = parsed;
      } else if (parsed.leads && Array.isArray(parsed.leads)) {
        leadsToAdd = parsed.leads;
      } else if (parsed.results && Array.isArray(parsed.results)) {
        leadsToAdd = parsed.results;
      } else if (parsed.rows && Array.isArray(parsed.rows)) {
        leadsToAdd = parsed.rows;
      }
      
      // המרה לפורמט Lead
      leadsToAdd.forEach((item: any) => {
        if (!item) return;
        
        const lead: Lead = {
          id: item.id || item.place_id || `restored_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: item.name || item.business_name || item.title || 'ליד משוחזר',
          company: item.company || item.category || '',
          phone: item.phone || item.formatted_phone_number || '',
          email: item.email || '',
          city: item.city || item.address || item.formatted_address || 'לא צוין',
          category: item.category || item.searchQuery || 'משוחזר',
          status: item.status || 'חדש',
          priority: item.priority || 3,
          starred: item.starred || false,
          notes: item.notes || `משוחזר מ-${key} ב-${new Date().toLocaleString('he-IL')}`,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          lastContact: item.lastContact ? new Date(item.lastContact) : undefined,
          source: item.source || 'משוחזר',
          value: item.value || 0,
          userId: currentUser.id
        };
        
        restoredLeads.push(lead);
      });
      
      console.log(`✅ שוחזרו ${leadsToAdd.length} לידים מ-${key}`);
      
    } catch (error) {
      console.warn(`⚠️ שגיאה בשחזור מ-${key}:`, error);
    }
  });
  
  // הסרת כפילויות לפי phone או name+city
  const uniqueLeads = restoredLeads.filter((lead, index, self) =>
    index === self.findIndex(l => 
      (lead.phone && l.phone === lead.phone) ||
      (l.name === lead.name && l.city === lead.city)
    )
  );
  
  console.log(`🎉 סה"כ שוחזרו ${uniqueLeads.length} לידים ייחודיים`);
  
  // שמירה חזרה במקום הנכון
  if (uniqueLeads.length > 0) {
    const userDataKey = `crm_leads_${currentUser.id}`;
    const userData = JSON.parse(localStorage.getItem(userDataKey) || '{"leads": []}');
    
    // מיזוג עם לידים קיימים
    const existingLeads = userData.leads || [];
    const allLeads = [...existingLeads, ...uniqueLeads];
    
    // הסרת כפילויות סופית
    const finalLeads = allLeads.filter((lead, index, self) =>
      index === self.findIndex(l => 
        (lead.phone && l.phone === lead.phone) ||
        (l.name === lead.name && l.city === lead.city)
      )
    );
    
    userData.leads = finalLeads;
    localStorage.setItem(userDataKey, JSON.stringify(userData));
    
    console.log(`💾 שמירה סופית: ${finalLeads.length} לידים`);
  }
  
  return uniqueLeads;
};
// פונקציה להוספת לידים חדשים ללא כפילויות
export const addNewLeads = (newLeads: any[]) => {
  // קבלת המשתמש הנוכחי
  const currentUser = JSON.parse(localStorage.getItem('crm_user') || 'null');
  if (!currentUser) {
    console.warn('⚠️ אין משתמש מחובר');
    return 0;
  }
  
  const userDataKey = `crm_leads_${currentUser.id}`;
  const userData = JSON.parse(localStorage.getItem(userDataKey) || '{"leads": []}');
  
  if (!Array.isArray(newLeads) || newLeads.length === 0) {
    console.warn('⚠️ לא נתקבלו לידים להוספה');
    return 0;
  }
  
  const existingLeads = userData.leads || [];
  const updatedLeads = [...existingLeads];
  let addedCount = 0;
  
  // שמירת גיבוי לפני הוספה
  const backupKey = `leads_before_add_${Date.now()}`;
  localStorage.setItem(backupKey, JSON.stringify({
    timestamp: new Date().toISOString(),
    existingLeads,
    newLeads,
    action: 'add_new_leads'
  }));
  
  newLeads.forEach(newLead => {
    // וידוא שיש נתונים בסיסיים
    if (!newLead.business_name && !newLead.contact_person && !newLead.title) {
      console.warn('⚠️ דלג על ליד ללא שם:', newLead);
      return;
    }
    
    // בדיקת כפילויות לפי טלפון או שם+כתובת
    const isDuplicate = existingLeads.some((existing: Lead) => 
      (newLead.phone && existing.phone === newLead.phone) ||
      (existing.name.toLowerCase() === (newLead.business_name || newLead.name || '').toLowerCase() && 
       existing.city.toLowerCase() === (newLead.address || '').toLowerCase())
    );
    
    if (!isDuplicate) {
      const leadData: Lead = {
        id: `lead_${currentUser.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newLead.business_name || newLead.contact_person || newLead.name || newLead.title || 'לא צוין',
        company: newLead.category || newLead.type || '',
        phone: newLead.phone || '',
        email: newLead.email || '',
        city: newLead.address || newLead.city || 'לא צוין',
        category: newLead.category || 'אחר',
        status: newLead.status || 'חדש',
        priority: 3,
        starred: false,
        notes: [
          newLead.notes,
          newLead.title && `תפקיד: ${newLead.title}`,
          newLead.hours && `שעות: ${newLead.hours}`,
          newLead.schedule && `לוח זמנים: ${newLead.schedule}`,
          newLead.website && `אתר: ${newLead.website}`,
          `נוסף ב-${new Date().toLocaleDateString('he-IL')}`
        ].filter(Boolean).join(' | '),
        createdAt: new Date(),
        source: newLead.source || 'ייבוא',
        value: 0,
        userId: currentUser.id
      };
      updatedLeads.push(leadData);
      addedCount++;
      console.log('✅ נוסף ליד:', leadData.name);
      
      // שמירת גיבוי של כל ליד שנוסף
      const leadBackupKey = `lead_${leadData.id}_${Date.now()}`;
      localStorage.setItem(leadBackupKey, JSON.stringify(leadData));
    } else {
      console.log('⚠️ ליד כפול נדחה:', newLead.business_name || newLead.contact_person);
    }
  });
  
  userData.leads = updatedLeads;
  localStorage.setItem(userDataKey, JSON.stringify(userData));
  
  // שמירת גיבוי סופי
  const finalBackupKey = `leads_after_add_${Date.now()}`;
  localStorage.setItem(finalBackupKey, JSON.stringify({
    timestamp: new Date().toISOString(),
    leads: updatedLeads,
    addedCount,
    action: 'final_save'
  }));
  
  // עדכון הרכיבים
  window.dispatchEvent(new CustomEvent('leadsUpdated', { 
    detail: { newCount: addedCount }
  }));
  
  console.log(`📊 סיכום ייבוא: ${addedCount} לידים חדשים מתוך ${newLeads.length}`);
  return addedCount;
};

// פונקציה לקבלת הלקוחות הנוכחיים
export const getCurrentCustomers = (): Lead[] => {
  // קבלת המשתמש הנוכחי
  const currentUser = JSON.parse(localStorage.getItem('crm_user') || 'null');
  if (!currentUser) {
    return getDefaultLeads();
  }
  
  const userDataKey = `crm_leads_${currentUser.id}`;
  const userData = JSON.parse(localStorage.getItem(userDataKey) || '{"leads": []}');
  
  if (userData.leads && userData.leads.length > 0) {
    try {
      return userData.leads.filter((lead: any) => lead.userId === currentUser.id).map((lead: any) => ({
        ...lead,
        createdAt: new Date(lead.createdAt),
        lastContact: lead.lastContact ? new Date(lead.lastContact) : undefined
      }));
    } catch (error) {
      console.error('Error parsing saved leads:', error);
      return getDefaultLeads(currentUser);
    }
  }
  return getDefaultLeads(currentUser);
};

// Backward compatibility
export const getCurrentLeads = getCurrentCustomers;

// פונקציה לשיתוף קטגוריות
export const shareCategory = (category: string, leads: Lead[], permissions: 'view' | 'edit' | 'select' = 'view'): string => {
  const currentUser = JSON.parse(localStorage.getItem('crm_user') || 'null');
  if (!currentUser) return '';
  
  const categoryLeads = leads.filter(lead => lead.category === category);
  const shareData = {
    category,
    permissions,
    leads: categoryLeads.map(lead => ({
      name: lead.name,
      company: lead.company,
      phone: lead.phone,
      email: lead.email,
      city: lead.city,
      category: lead.category,
      notes: permissions === 'view' ? '' : lead.notes // הסתר הערות במצב צפייה
    })),
    sharedBy: currentUser.name,
    sharedAt: new Date().toISOString(),
    shareId: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  // שמירת נתוני השיתוף
  const shareKey = `shared_${shareData.shareId}`;
  localStorage.setItem(shareKey, JSON.stringify(shareData));
  
  // יצירת לינק שיתוף
  const shareUrl = `${window.location.origin}?share=${shareData.shareId}`;
  return shareUrl;
};

// פונקציה לקבלת נתונים משותפים
export const getSharedData = (shareId: string) => {
  const shareKey = `shared_${shareId}`;
  const sharedData = localStorage.getItem(shareKey);
  return sharedData ? JSON.parse(sharedData) : null;
};

// פונקציה לקבלת לקוחות ברירת מחדל למשתמש חדש
const getDefaultLeads = (currentUser?: any): Lead[] => {
  if (!currentUser) {
    return [];
  }
  
  const defaultLeads: Lead[] = [
    {
      id: `demo_${currentUser.id}_1`,
      name: 'דוד כהן',
      company: 'כהן טכנולוגיות',
      phone: '052-1234567',
      email: 'david@kohen-tech.co.il',
      city: 'תל אביב',
      category: 'טכנולוגיה',
      status: 'בטיפול',
      priority: 5,
      starred: true,
      notes: 'לקוח פוטנציאלי מעניין עם פרויקט גדול',
      createdAt: new Date('2024-01-15'),
      lastContact: new Date('2024-01-20'),
      source: 'אתר אינטרנט',
      value: 50000,
      userId: currentUser.id
    },
    {
      id: `demo_${currentUser.id}_2`,
      name: 'שרה לוי',
      company: 'לוי ושותפים',
      phone: '054-9876543',
      email: 'sara@levi-partners.co.il',
      city: 'ירושלים',
      category: 'יעוץ עסקי',
      status: 'הצעה',
      priority: 4,
      starred: false,
      notes: 'הגישו הצעה השבוע',
      createdAt: new Date('2024-01-10'),
      lastContact: new Date('2024-01-22'),
      source: 'המלצה',
      value: 25000,
      userId: currentUser.id
    },
    {
      id: `demo_${currentUser.id}_3`,
      name: 'אחמד עלי',
      company: 'עלי בנייה',
      phone: '050-5555555',
      email: 'ahmad@ali-construction.co.il',
      city: 'נצרת',
      category: 'בנייה',
      status: 'חדש',
      priority: 3,
      starred: false,
      notes: 'פרויקט בנייה באזור הצפון',
      createdAt: new Date('2024-01-22'),
      source: 'פרסום',
      value: 100000,
      userId: currentUser.id
    }
  ];
  
  // שמירת לקוחות ברירת מחדל למשתמש חדש
  const userDataKey = `crm_leads_${currentUser.id}`;
  const userData = JSON.parse(localStorage.getItem(userDataKey) || '{}');
  userData.leads = defaultLeads;
  localStorage.setItem(userDataKey, JSON.stringify(userData));
  
  return defaultLeads;
};

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'להתקשר לדוד כהן',
    description: 'לבדוק התקדמות הפרויקט',
    dueDate: new Date('2024-01-26'),
    completed: false,
    leadId: 'demo_1',
    priority: 'גבוהה',
    createdAt: new Date('2024-01-24')
  },
  {
    id: '2',
    title: 'להכין הצעת מחיר לשרה',
    description: 'הצעה מפורטת לפרויקט יעוץ',
    dueDate: new Date('2024-01-27'),
    completed: false,
    leadId: 'demo_2',
    priority: 'גבוהה',
    createdAt: new Date('2024-01-23')
  },
  {
    id: '3',
    title: 'פגישה עם אחמד בנצרת',
    description: 'סיור באתר הבנייה',
    dueDate: new Date('2024-01-28'),
    completed: false,
    leadId: 'demo_3',
    priority: 'בינונית',
    createdAt: new Date('2024-01-22')
  }
];