/**
 * Shared constants for the Leads & Pipeline module.
 * Used by LeadDetailPanel, LeadAddForm, and LeadPipelineTable.
 */

import {
  FileText,
  Clock,
  Laptop,
  BadgePercent,
  Phone,
  UserRound,
  FileCheck,
  Handshake,
  Trophy,
  XCircle,
} from 'lucide-react';
import { Lead } from '../../types';

// ── Customer requirement options ────────────────────────────────────────────
export const CUSTOMER_REQUIREMENTS = [
  {
    id: 'share_details' as const,
    label: 'Service Details / Brochure Requested',
    shortLabel: 'Details Needed',
    desc: 'Customer requested service information, package details, deliverables, pricing plans, or a company brochure via WhatsApp or email.',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: FileText,
    whatsappPrefix:
      'Hello {name}, thank you for your interest in {service} from Vahlay Digital. As discussed, we are sharing the service details, package inclusions, and relevant information for {company}. Please let us know if you have any questions.'
  },
  {
    id: 'callback' as const,
    label: 'Customer Busy / Callback Requested',
    shortLabel: 'Callback Scheduled',
    desc: 'Customer was unavailable to speak and requested a follow-up call at a specific date or time. The sales agent should reconnect as scheduled.',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
    whatsappPrefix:
      'Hello {name}, this is a follow-up from Vahlay Digital regarding {service} for {company}. As discussed, we are scheduled to reconnect with you. Please let us know if the planned callback time is convenient.'
  },
  {
    id: 'demo_requested' as const,
    label: 'Demo / Portfolio / Previous Work Requested',
    shortLabel: 'Demo Requested',
    desc: 'Customer wants to review a live demonstration, previous projects, portfolio samples, case studies, or relevant work before making a decision.',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Laptop,
    whatsappPrefix:
      'Hello {name}, thank you for your interest in {service} from Vahlay Digital. We are sharing relevant portfolio samples and project references to help you understand our work. If required, we can also arrange a demo or walkthrough for {company}.'
  },
  {
    id: 'rate_negotiation' as const,
    label: 'Price Negotiation / Discount Requested',
    shortLabel: 'Rate Negotiation',
    desc: 'Customer is interested in the service but has requested a better price, special discount, revised package, or customized commercial terms. Management approval may be required.',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: BadgePercent,
    whatsappPrefix:
      'Hello {name}, thank you for discussing your requirements for {service} with Vahlay Digital. We are reviewing your budget and requested commercial terms for {company}. We will update you once the revised pricing or available options are confirmed.'
  },
  {
    id: 'quotation_needed' as const,
    label: 'Customer Needs Quotation',
    shortLabel: 'Quotation Needed',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: FileText,
    whatsappPrefix:
      'Hello {name}, thank you for sharing your requirements with Vahlay Digital. We are preparing the quotation for {service} based on your requirements for {company}. We will share the pricing, scope of work, deliverables, and applicable terms for your review. Please let us know if you have any additional requirements.'
  }
];

// ── Pipeline kanban stages ───────────────────────────────────────────────────
export const KANBAN_STAGES: {
  id: Lead['status'];
  label: string;
  badge: string;
  dotColor: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
}[] = [
  { id: 'new',           label: 'New Lead',      badge: 'bg-slate-100 text-slate-700 border-slate-200',   dotColor: 'bg-slate-400',   icon: UserRound,  iconBg: 'bg-slate-100 text-slate-500'  },
  { id: 'contacted',     label: 'Contacted',     badge: 'bg-blue-50 text-blue-700 border-blue-200',       dotColor: 'bg-blue-600',    icon: Phone,      iconBg: 'bg-blue-100 text-blue-600'    },
  { id: 'qualified',     label: 'Qualified',     badge: 'bg-teal-50 text-teal-700 border-teal-200',       dotColor: 'bg-teal-600',    icon: FileCheck,  iconBg: 'bg-teal-100 text-teal-600'    },
  { id: 'proposal_sent', label: 'Proposal Sent', badge: 'bg-purple-50 text-purple-700 border-purple-200', dotColor: 'bg-purple-600',  icon: FileText,   iconBg: 'bg-purple-100 text-purple-600'},
  { id: 'negotiation',   label: 'Negotiation',   badge: 'bg-amber-50 text-amber-700 border-amber-200',   dotColor: 'bg-amber-500',   icon: Handshake,  iconBg: 'bg-amber-100 text-amber-600'  },
  { id: 'won',           label: 'Deal Won',      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-600', icon: Trophy, iconBg: 'bg-emerald-100 text-emerald-600'},
  { id: 'lost',          label: 'Closed Lost',   badge: 'bg-rose-50 text-rose-700 border-rose-200',       dotColor: 'bg-rose-600',    icon: XCircle,    iconBg: 'bg-rose-100 text-rose-600'    },
];

// ── Callback time slot options ───────────────────────────────────────────────
export const CALLBACK_TIME_SLOTS = [
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
];

// ── Service options (shared dropdown list) ───────────────────────────────────
export const SERVICE_OPTIONS = [
  'Static Website Development',
  'Dynamic Website Development',
  'E-commerce Website Development',
  'CRM Development',
  'ERP Development',
  'Search Engine Optimization (SEO)',
  'Google Business Profile (GMB)',
  'Reels Shooting & Editing',
];
