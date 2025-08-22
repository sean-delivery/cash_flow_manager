import React from 'react';
import { getCurrentLeads } from '../../data/mockData';

class NotificationManager {
  static init() {
  }

  static async sendNotification(title: string, body: string, icon?: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }

  static scheduleDailySummary() {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(18, 0, 0, 0); // 6 PM

    let timeUntilSummary = endOfDay.getTime() - now.getTime();
    
    // אם עבר 6 PM, תזמן למחר
    if (timeUntilSummary < 0) {
      endOfDay.setDate(endOfDay.getDate() + 1);
      timeUntilSummary = endOfDay.getTime() - now.getTime();
    }

    console.log(`📅 תזמון סיכום יומי בעוד ${Math.round(timeUntilSummary / 1000 / 60)} דקות`);
    
    setTimeout(() => {
      this.sendDailySummary();
      // תזמן שוב למחר
      setInterval(() => this.sendDailySummary(), 24 * 60 * 60 * 1000);
    }, timeUntilSummary);
  }

  static sendDailySummary() {
    console.log('📊 שולח סיכום יומי...');
    
    const leads = getCurrentLeads();
    const cashflowEntries = JSON.parse(localStorage.getItem('cashflow_entries') || '[]');
    
    // חישוב יתרה
    let balance = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    cashflowEntries.forEach((entry: any) => {
      const entryDate = new Date(entry.date);
      if (entryDate <= today) {
        balance += entry.type === 'income' ? entry.amount : -entry.amount;
      }
    });

    const title = '📊 סיכום יומי - CRM';
    const body = `לידים: ${leads.length} | יתרה: ₪${balance.toLocaleString()}`;
    
    console.log('📱 שולח התראה:', title, body);
    this.sendNotification(title, body);
  }

  static sendLeadNotification(leadName: string) {
    this.sendNotification(
      '🎯 ליד חדש!',
      `נוסף ליד חדש: ${leadName}`
    );
  }

  static sendTaskReminder(taskTitle: string) {
    this.sendNotification(
      '⏰ תזכורת משימה',
      `משימה: ${taskTitle}`
    );
  }
}

export default NotificationManager;