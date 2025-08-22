import { sb } from './supabase';

export interface UserPlan {
  id: string;
  user_id: string;
  plan: 'trial' | 'premium';
  cycle_start: Date;
  cycle_end: Date;
  leads_limit: number;
  leads_used: number;
}

export interface QuotaStatus {
  remaining: number;
  limit: number;
  used: number;
  daysLeft: number;
  canSearch: boolean;
}

export class QuotaManager {
  static async getCurrentPlan(): Promise<UserPlan | null> {
    try {
      const { data, error } = await sb
        .from('user_plans')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching user plan:', error);
        return null;
      }
      
      return {
        ...data,
        cycle_start: new Date(data.cycle_start),
        cycle_end: new Date(data.cycle_end)
      };
    } catch (error) {
      console.error('Error in getCurrentPlan:', error);
      return null;
    }
  }

  static async getQuotaStatus(): Promise<QuotaStatus> {
    const plan = await this.getCurrentPlan();
    
    if (!plan) {
      return {
        remaining: 0,
        limit: 0,
        used: 0,
        daysLeft: 0,
        canSearch: false
      };
    }

    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((plan.cycle_end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const remaining = Math.max(0, plan.leads_limit - plan.leads_used);

    return {
      remaining,
      limit: plan.leads_limit,
      used: plan.leads_used,
      daysLeft,
      canSearch: remaining > 0 && daysLeft > 0
    };
  }

  static async consumeLeads(count: number): Promise<boolean> {
    try {
      const { data, error } = await sb.rpc('consume_leads', { n: count });
      
      if (error) {
        console.error('Error consuming leads:', error);
        return false;
      }
      
      return data === true;
    } catch (error) {
      console.error('Error in consumeLeads:', error);
      return false;
    }
  }

  static async createTrialPlan(userId: string): Promise<boolean> {
    try {
      const { error } = await sb
        .from('user_plans')
        .upsert({
          user_id: userId,
          plan: 'trial',
          cycle_start: new Date().toISOString(),
          cycle_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          leads_limit: 40,
          leads_used: 0
        });
      
      if (error) {
        console.error('Error creating trial plan:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in createTrialPlan:', error);
      return false;
    }
  }
}