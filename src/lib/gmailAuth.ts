interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    body?: {
      data?: string;
    };
    parts?: Array<{
      body?: {
        data?: string;
      };
      mimeType: string;
    }>;
  };
  internalDate: string;
}

interface ExtractedInvoice {
  id: string;
  date: Date;
  supplier: string;
  amount: number;
  currency: string;
  subject: string;
  source: string;
  rawEmail?: string;
}

// Global type declarations for Google GSI
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            redirect_uri: string;
            ux_mode: 'redirect' | 'popup';
            state?: string;
          }) => {
            requestCode: () => void;
          };
        };
      };
    };
  }
}

class GmailManager {
  private accessToken: string | null = null;
  private clientId = '44819422978-mvljcf530s56usua64u8evamq1beaohj.apps.googleusercontent.com';

  requestGoogleCode(): void {
    console.log('🔐 מתחיל OAuth flow עם Google...');
    
    // Wait for Google GSI to load
    const initOAuth = () => {
      if (!window.google?.accounts?.oauth2) {
        console.log('⏳ מחכה ל-Google GSI...');
        setTimeout(initOAuth, 100);
        return;
      }

      try {
        const redirectUri = import.meta.env.DEV
          ? 'http://localhost:5173/oauth2/callback'
          : 'https://sean-control-cash.com/oauth2/callback';

        const client = window.google.accounts.oauth2.initCodeClient({
          client_id: this.clientId,
          scope: 'https://www.googleapis.com/auth/gmail.readonly email profile',
          redirect_uri: redirectUri,
          ux_mode: 'redirect',
          state: 'gmail_auth'
        });
        
        console.log('🚀 מפעיל OAuth redirect...');
        client.requestCode();
      } catch (error) {
        console.error('❌ שגיאה ב-OAuth setup:', error);
        alert('❌ שגיאה בהתחברות ל-Google. נסה שוב.');
      }
    };

    initOAuth();
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    console.log('🔄 מחליף קוד ב-access token...');
    
    try {
      const redirectUri = import.meta.env.DEV
        ? 'http://localhost:5173/oauth2/callback'
        : 'https://sean-control-cash.com/oauth2/callback';

      const response = await fetch('/.netlify/functions/google-exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          redirect_uri: redirectUri
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('לא התקבל access token');
      }

      this.accessToken = data.access_token;
      localStorage.setItem('gmail_access_token', data.access_token);
      localStorage.setItem('gmail_connected', 'true');
      
      console.log('✅ Access token נשמר בהצלחה');
      return data.access_token;
      
    } catch (error) {
      console.error('❌ שגיאה בהחלפת קוד:', error);
      throw error;
    }
  }

  async searchInvoices(daysBack: number = 30): Promise<ExtractedInvoice[]> {
    if (!this.accessToken) {
      throw new Error('לא מחובר ל-Gmail. יש להתחבר קודם.');
    }

    try {
      console.log(`🔍 מחפש חשבוניות ב-Gmail (${daysBack} ימים אחרונים)...`);
      
      // בניית שאילתת חיפוש מתקדמת
      const searchQuery = `(
        "חשבונית" OR "חשבונית מס" OR "קבלה" OR "אישור תשלום" OR "אישור עסקה" OR "מסמך תשלום" OR "תשלום בוצע" OR "חשבונית מס קבלה" OR
        "invoice" OR "tax invoice" OR "vat invoice" OR "receipt" OR "payment receipt" OR "payment confirmation" OR "payment received" OR "paid invoice" OR "billing" OR "bill" OR "order invoice" OR "tax receipt" OR
        "счёт" OR "счет" OR "счёт-фактура" OR "счет-фактура" OR "квитанция" OR "оплата получена" OR "подтверждение оплаты" OR
        "فاتورة" OR "إيصال" OR "ايصال" OR "تأكيد الدفع" OR "تم الدفع" OR "فاتورة ضريبية" OR
        "facture" OR "facture fiscale" OR "reçu" OR "confirmation de paiement" OR "paiement reçu" OR
        "factura" OR "factura fiscal" OR "recibo" OR "confirmación de pago" OR "pago recibido"
      ) newer_than:${daysBack}d`;

      // חיפוש מיילים
      const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=100`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired
          localStorage.removeItem('gmail_access_token');
          localStorage.removeItem('gmail_connected');
          throw new Error('אסימון פג תוקף. יש להתחבר מחדש.');
        }
        throw new Error(`Gmail API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.messages || data.messages.length === 0) {
        console.log('⚠️ לא נמצאו מיילים מתאימים');
        return [];
      }

      console.log(`📧 נמצאו ${data.messages.length} מיילים פוטנציאליים`);

      // שליפת פרטי כל מייל
      const invoices: ExtractedInvoice[] = [];
      const processedIds = new Set<string>();

      for (const message of data.messages.slice(0, 50)) { // מגביל ל-50 מיילים
        try {
          if (processedIds.has(message.id)) continue;
          processedIds.add(message.id);

          const messageDetails = await this.getMessageDetails(message.id);
          const extractedInvoice = this.extractInvoiceData(messageDetails);
          
          if (extractedInvoice) {
            invoices.push(extractedInvoice);
            console.log(`✅ חולץ: ${extractedInvoice.supplier} - ₪${extractedInvoice.amount}`);
          }
        } catch (error) {
          console.warn(`⚠️ שגיאה בעיבוד מייל ${message.id}:`, error);
        }
      }

      console.log(`🎉 הושלם! נמצאו ${invoices.length} חשבוניות`);
      return invoices;

    } catch (error) {
      console.error('❌ שגיאה בחיפוש Gmail:', error);
      throw error;
    }
  }

  private async getMessageDetails(messageId: string): Promise<GmailMessage> {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get message details: ${response.status}`);
    }

    return response.json();
  }

  private extractInvoiceData(message: GmailMessage): ExtractedInvoice | null {
    try {
      // חילוץ headers
      const headers = message.payload.headers;
      const fromHeader = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
      const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
      const dateHeader = headers.find(h => h.name.toLowerCase() === 'date')?.value || message.internalDate;

      // חילוץ תוכן המייל
      let emailContent = '';
      
      if (message.payload.body?.data) {
        emailContent = this.decodeBase64(message.payload.body.data);
      } else if (message.payload.parts) {
        for (const part of message.payload.parts) {
          if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
            if (part.body?.data) {
              emailContent += this.decodeBase64(part.body.data);
            }
          }
        }
      }

      // חילוץ שם ספק
      const supplier = this.extractSupplierName(fromHeader, subjectHeader, emailContent);
      
      // חילוץ סכום ומטבע
      const amountData = this.extractAmountAndCurrency(emailContent, subjectHeader);
      
      if (!amountData) {
        return null; // לא נמצא סכום - כנראה לא חשבונית
      }

      return {
        id: message.id,
        date: new Date(parseInt(message.internalDate)),
        supplier,
        amount: amountData.amount,
        currency: amountData.currency,
        subject: subjectHeader,
        source: 'Gmail',
        rawEmail: emailContent.substring(0, 500) // שמירת חלק מהתוכן לבדיקה
      };

    } catch (error) {
      console.warn('שגיאה בחילוץ נתוני חשבונית:', error);
      return null;
    }
  }

  private decodeBase64(data: string): string {
    try {
      return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
    } catch (error) {
      console.warn('שגיאה בפענוח Base64:', error);
      return '';
    }
  }

  private extractSupplierName(from: string, subject: string, content: string): string {
    // ניסיון לחלץ שם ספק מכותרת From
    const emailMatch = from.match(/<(.+@.+)>/);
    const email = emailMatch ? emailMatch[1] : from;
    
    // הסרת כתובת מייל ולקיחת השם
    const nameMatch = from.match(/^([^<]+)</);
    if (nameMatch) {
      return nameMatch[1].trim().replace(/"/g, '');
    }
    
    // אם לא נמצא שם, נסה לחלץ מהדומיין
    const domain = email.split('@')[1];
    if (domain) {
      return domain.split('.')[0];
    }
    
    return 'ספק לא ידוע';
  }

  private extractAmountAndCurrency(content: string, subject: string): { amount: number; currency: string } | null {
    const text = content + ' ' + subject;
    
    // רגקסים לזיהוי סכומים במטבעות שונים
    const patterns = [
      // שקל ישראלי
      /(?:₪|שקל|ש"ח|ILS)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
      /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:₪|שקל|ש"ח|ILS)/gi,
      
      // דולר
      /(?:\$|USD|dollar)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
      /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:\$|USD|dollar)/gi,
      
      // יורו
      /(?:€|EUR|euro)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
      /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:€|EUR|euro)/gi,
      
      // פאונד
      /(?:£|GBP|pound)\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
      /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:£|GBP|pound)/gi,
      
      // סכום כללי
      /(?:סכום|total|amount|sum)\s*:?\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        
        if (amount > 0 && amount < 1000000) { // סכום סביר
          // זיהוי מטבע
          let currency = 'ILS';
          const matchText = match[0].toLowerCase();
          
          if (matchText.includes('$') || matchText.includes('usd') || matchText.includes('dollar')) {
            currency = 'USD';
          } else if (matchText.includes('€') || matchText.includes('eur') || matchText.includes('euro')) {
            currency = 'EUR';
          } else if (matchText.includes('£') || matchText.includes('gbp') || matchText.includes('pound')) {
            currency = 'GBP';
          }
          
          return { amount, currency };
        }
      }
    }
    
    return null;
  }

  async testConnection(): Promise<boolean> {
    if (!this.accessToken) {
      return false;
    }

    try {
      // בדיקה פשוטה - קריאה לפרופיל
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('❌ בדיקת חיבור Gmail נכשלה:', error);
      return false;
    }
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('gmail_access_token', token);
    localStorage.setItem('gmail_connected', 'true');
  }

  isConnected(): boolean {
    const token = localStorage.getItem('gmail_access_token');
    if (token) {
      this.accessToken = token;
      return true;
    }
    return false;
  }
}

export const gmailManager = new GmailManager();
export type { ExtractedInvoice };