import { googleAuth } from './googleAuth';

interface SheetData {
  values: string[][];
}

class GoogleSheetsManager {
  private accessToken: string | null = null;

  async authenticate() {
    try {
      this.accessToken = await googleAuth.getAccessToken();
      console.log('✅ Google Sheets - אימות הושלם');
      return true;
    } catch (error) {
      console.error('❌ Google Sheets - שגיאת אימות:', error);
      return false;
    }
  }

  async readSheet(spreadsheetId: string, range: string = 'A:Z'): Promise<any[]> {
    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('נכשל באימות Google');
      }
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${this.accessToken}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Sheets API Error: ${response.status} ${response.statusText}`);
      }

      const data: SheetData = await response.json();
      
      if (!data.values || data.values.length < 2) {
        console.warn('⚠️ הגיליון ריק או לא מכיל נתונים');
        return [];
      }

      // המרת נתונים לפורמט CRM
      const headers = data.values[0];
      const rows = data.values.slice(1);
      
      const leads = rows.map((row, index) => {
        const lead: any = {};
        headers.forEach((header, colIndex) => {
          const value = row[colIndex] || '';
          const normalizedHeader = header.toLowerCase().trim();
          
          // מיפוי חכם של כותרות
          if (normalizedHeader.includes('name') || normalizedHeader.includes('שם') || normalizedHeader.includes('business')) {
            lead.business_name = value;
          } else if (normalizedHeader.includes('phone') || normalizedHeader.includes('טלפון')) {
            lead.phone = value;
          } else if (normalizedHeader.includes('email') || normalizedHeader.includes('מייל')) {
            lead.email = value;
          } else if (normalizedHeader.includes('website') || normalizedHeader.includes('אתר')) {
            lead.website = value;
          } else if (normalizedHeader.includes('address') || normalizedHeader.includes('כתובת')) {
            lead.address = value;
          } else if (normalizedHeader.includes('category') || normalizedHeader.includes('קטגוריה')) {
            lead.category = value;
          } else if (normalizedHeader.includes('notes') || normalizedHeader.includes('הערות')) {
            lead.notes = value;
          } else {
            lead[normalizedHeader] = value;
          }
        });
        
        // ברירות מחדל
        lead.business_name = lead.business_name || lead.contact || lead.title || `ליד ${index + 1}`;
        lead.category = lead.category || 'אחר';
        lead.source = 'Google Sheets';
        lead.status = 'ייבוא מ-Sheets';
        
        return lead;
      });

      console.log(`✅ נקראו ${leads.length} לידים מ-Google Sheets`);
      return leads;

    } catch (error) {
      console.error('❌ שגיאה בקריאת Google Sheets:', error);
      throw error;
    }
  }

  extractSpreadsheetId(url: string): string | null {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }

  async testConnection(spreadsheetUrl: string): Promise<boolean> {
    try {
      const spreadsheetId = this.extractSpreadsheetId(spreadsheetUrl);
      if (!spreadsheetId) {
        throw new Error('URL לא תקין של Google Sheets');
      }

      await this.authenticate();
      
      // בדיקה פשוטה - קריאת תא A1
      const testData = await this.readSheet(spreadsheetId, 'A1:A1');
      console.log('✅ חיבור Google Sheets תקין');
      return true;
      
    } catch (error) {
      console.error('❌ בדיקת חיבור נכשלה:', error);
      return false;
    }
  }
}

export const googleSheets = new GoogleSheetsManager();