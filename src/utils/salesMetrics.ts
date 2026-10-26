import { Lead } from '../types';

export const getCurrentMonthWonRevenue = (leads: Lead[], agentId?: string): number => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return leads.reduce((revenue, lead) => {
    if (lead.status !== 'won' || (agentId && lead.agentId !== agentId)) return revenue;
    const wonDate = lead.wonAt || lead.lastContactDate;
    const date = new Date(`${wonDate}T00:00:00`);
    if (Number.isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month) return revenue;
    return revenue + (lead.quotationINR || lead.estimatedBudgetINR || 0);
  }, 0);
};
