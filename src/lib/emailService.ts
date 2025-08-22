interface AccessCode {
  id: string;
  email: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
}

class EmailService {
  private readonly ADMIN_EMAIL = 'seannon29@gmail.com';
  private readonly CODE_EXPIRY_MINUTES = 15;

  async sendAccessCode(email: string, code: string): Promise<boolean> {
    try {
      console.log(`📧 שולח קוד גישה מ-${this.ADMIN_EMAIL} ל-${email}`);
      
      // שמירת הקוד בהיסטוריה
      this.saveCodeToHistory(email, code);
      
      // שליחת מייל אמיתי דרך EmailJS
      const templateParams = {
        to_email: email,
        from_email: this.ADMIN_EMAIL,
        access_code: code,
        expires_in: this.CODE_EXPIRY_MINUTES,
        login_link: `${window.location.origin}?email=${encodeURIComponent(email)}&code=${code}`
      };

      // EmailJS configuration
      const serviceId = 'service_crm_israel';
      const templateId = 'template_access_code';
      const publicKey = 'YOUR_EMAILJS_PUBLIC_KEY';

      // For now, simulate email sending
      console.log('📧 מייל נשלח בהצלחה:', templateParams);
      
      // TODO: Replace with actual EmailJS call
      // await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      return true;
    } catch (error) {
      console.error('❌ שגיאה בשליחת מייל:', error);
      return false;
    }
  }

  private saveCodeToHistory(email: string, code: string): void {
    const codeData: AccessCode = {
      id: `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      code,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000),
      used: false
    };

    const history = this.getCodeHistory();
    history.push(codeData);
    
    // שמירת רק 100 קודים אחרונים
    const limitedHistory = history.slice(-100);
    localStorage.setItem('access_codes_history', JSON.stringify(limitedHistory));
    
    console.log(`💾 קוד נשמר בהיסטוריה: ${code} עבור ${email}`);
  }

  getCodeHistory(): AccessCode[] {
    try {
      const saved = localStorage.getItem('access_codes_history');
      if (!saved) return [];
      
      const parsed = JSON.parse(saved);
      return parsed.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        expiresAt: new Date(item.expiresAt),
        usedAt: item.usedAt ? new Date(item.usedAt) : undefined
      }));
    } catch (error) {
      console.error('Error loading code history:', error);
      return [];
    }
  }

  validateCode(email: string, code: string): boolean {
    const history = this.getCodeHistory();
    const codeEntry = history.find(c => 
      c.email === email && 
      c.code === code && 
      !c.used && 
      c.expiresAt > new Date()
    );

    if (codeEntry) {
      // סימון הקוד כמשומש
      this.markCodeAsUsed(codeEntry.id);
      return true;
    }

    return false;
  }

  private markCodeAsUsed(codeId: string): void {
    const history = this.getCodeHistory();
    const updatedHistory = history.map(code => 
      code.id === codeId 
        ? { ...code, used: true, usedAt: new Date() }
        : code
    );
    localStorage.setItem('access_codes_history', JSON.stringify(updatedHistory));
  }

  generateLoginLink(email: string, code: string): string {
    return `${window.location.origin}?email=${encodeURIComponent(email)}&code=${code}`;
  }

  getValidCodesForEmail(email: string): AccessCode[] {
    const history = this.getCodeHistory();
    return history.filter(c => 
      c.email === email && 
      !c.used && 
      c.expiresAt > new Date()
    );
  }

  // פונקציה לניקוי קודים שפגו
  cleanExpiredCodes(): void {
    const history = this.getCodeHistory();
    const validCodes = history.filter(c => c.expiresAt > new Date() || c.used);
    localStorage.setItem('access_codes_history', JSON.stringify(validCodes));
  }
}

export const emailService = new EmailService();