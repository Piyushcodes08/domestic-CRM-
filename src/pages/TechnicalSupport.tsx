import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Lead, EscalationTicket, Proposal, User as UserType } from '../types';
import { CUSTOMER_REQUIREMENTS } from '../components/leads/leadConstants';
import { QuotationPreviewModal, getQuotationWhatsAppLink } from '../components/quotations/QuotationPreviewModal';
import { QuotationStudio } from '../components/quotations/QuotationStudio';
import { ManagerTargetsTab } from '../components/manager/ManagerTargetsTab';
import { ManagerProposalsTab } from '../components/manager/ManagerProposalsTab';
import { ManagerFollowUpsTab } from '../components/manager/ManagerFollowUpsTab';
import { ManagerEscalationsTab } from '../components/manager/ManagerEscalationsTab';
import { DepartmentTasks } from '../components/admin/DepartmentTasks';
import {
  LifeBuoy,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Search,
  Phone,
  Building2,
  UserRound,
  FileText,
  Laptop,
  BadgePercent,
  Check,
  RefreshCw,
  Send,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCheck,
  Layers,
  ChevronRight,
  Calendar,
  Printer,
  Eye,
  Copy,
  ExternalLink,
  Globe,
  X,
  Share2,
  Plus,
  Trash2,
  UploadCloud,
  Loader2,
  ArrowLeft,
  Pencil,
  MapPin,
  Briefcase,
  Wallet,
  TrendingUp,
  PhoneForwarded,
  Users,
  ShieldCheck,
} from 'lucide-react';

// Official WhatsApp Vector Icon
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 18.12c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.13 8.13 0 01-1.25-4.35c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.23.85 5.77 2.39 1.54 1.54 2.39 3.59 2.39 5.77 0 4.5-3.66 8.16-8.16 8.16zm4.47-6.1c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.95-1.2-.72-.64-1.21-1.43-1.35-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.41-.41-.56-.42l-.48-.01c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.34.99 2.5c.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28z" />
  </svg>
);

// Normalize phone numbers to standard 12-digit Indian format for WhatsApp wa.me
export function cleanWhatsAppPhone(rawPhone: string): string {
  if (!rawPhone) return '';
  let digits = rawPhone.replace(/\D/g, '');
  while (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

export interface AttachedBrochureItem {
  id: string;
  title: string;
  url: string;
  type: 'pdf' | 'link';
}

export function formatAttachmentsBlock(items: AttachedBrochureItem[] | string): string {
  if (typeof items === 'string') {
    if (!items.trim()) return '';
    return `📁 *Brochure / Portfolio Link:* ${items.trim()}`;
  }

  const validItems = items.filter((item) => item.url && item.url.trim().length > 0);
  if (validItems.length === 0) return '';

  const lines = validItems.map((item) => {
    const icon = item.type === 'pdf' ? '📄' : '🔗';
    const tag = item.type === 'pdf' ? ' (PDF)' : '';
    const name = item.title.trim() || (item.type === 'pdf' ? 'Brochure' : 'Link');
    return `• ${icon} *${name}${tag}:* ${item.url.trim()}`;
  });

  return `📁 *Attached Brochures & Documents:*\n${lines.join('\n')}`;
}

export const DEFAULT_ATTACHED_BROCHURES: AttachedBrochureItem[] = [
  {
    id: 'default-1',
    title: 'Company Portfolio',
    url: 'https://vahlaydigital.com',
    type: 'link'
  }
];

// Official WhatsApp message for lead requirements (User default template)
export function generateWhatsAppDetailsMessage(
  _lead?: Lead | null,
  brochures: AttachedBrochureItem[] | string = DEFAULT_ATTACHED_BROCHURES,
  senderName: string = 'Piyush'
): string {
  const attachmentsBlock = formatAttachmentsBlock(brochures);

  return `Hello Sir/Ma’am! 

This is ${senderName} from the Support Department at *Vahlay Digital*.

If you have any queries or need information about our services, either now or in the future, please feel free to reach out to us.
${attachmentsBlock ? `\n${attachmentsBlock}\n` : ''}
*Contact:* +91 83479 30515  
*Address:* C-515, Dev Aurum Commercial Complex, Prahlad Nagar, Ahmedabad, Gujarat – 380015.

We’ll be happy to assist you. Thank you for choosing Vahlay Digital!

Best Regards,  
*${senderName} | Vahlay Digital Support Team*`;
}

export type SupportTab = 'inbound_leads' | 'quotation_requests' | 'whatsapp_share' | 'department_tasks' | 'agent_targets' | 'proposal_approvals' | 'followup_radar' | 'escalations_mgr';

interface TechnicalSupportProps {
  initialTab?: SupportTab;
  onNavigate?: (path: string) => void;
}

export const TechnicalSupport: React.FC<TechnicalSupportProps> = ({ initialTab = 'inbound_leads', onNavigate }) => {
  const { currentUser, allUsers, isManager, isAdmin } = useAuth();
  const isManagerOrAdmin = isManager || isAdmin;
  const supportMemberName = (currentUser?.name && !['vahlaydigital', 'admin', 'system'].includes(currentUser.name.toLowerCase()))
    ? (currentUser.name.toLowerCase().includes('piyush') ? 'Piyush' : currentUser.name.split(' ')[0])
    : 'Piyush';
  const [activeTab, setActiveTab] = useState<SupportTab>(initialTab);

  // Agent list for manager tabs
  const agents: UserType[] = Array.isArray(allUsers)
    ? allUsers.filter((u: UserType) => u.role === 'sales_agent')
    : [];

  // Manager state
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tickets, setTickets] = useState<EscalationTicket[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReqFilter, setSelectedReqFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [editingNotesLeadId, setEditingNotesLeadId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [editingAgentNotesLeadId, setEditingAgentNotesLeadId] = useState<string | null>(null);
  const [agentNotesDraft, setAgentNotesDraft] = useState('');
  const [selectedLeadModal, setSelectedLeadModal] = useState<Lead | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [previewingQuotation, setPreviewingQuotation] = useState<Proposal | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<Proposal | null>(null);
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<'all' | 'pending' | 'dispatched'>('all');
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [ticketResolutionDraft, setTicketResolutionDraft] = useState('');

  // WhatsApp Share Details Page State (defaults to user's official support introduction template)
  const [selectedShareLead, setSelectedShareLead] = useState<Lead | null>(null);
  const [whatsAppPhone, setWhatsAppPhone] = useState('');
  const [whatsAppMessage, setWhatsAppMessage] = useState('');
  const [attachedBrochures, setAttachedBrochures] = useState<AttachedBrochureItem[]>(DEFAULT_ATTACHED_BROCHURES);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [autoMarkShared, setAutoMarkShared] = useState(true);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const setupShareForLead = (lead: Lead) => {
    setSelectedShareLead(lead);
    const clean = cleanWhatsAppPhone(lead.phone);
    setWhatsAppPhone(clean);
    const msg = generateWhatsAppDetailsMessage(lead, attachedBrochures, supportMemberName);
    setWhatsAppMessage(msg);
    setCopiedMessage(false);
  };

  const updateBrochuresAndMessage = (updated: AttachedBrochureItem[]) => {
    setAttachedBrochures(updated);
    if (selectedShareLead) {
      const msg = generateWhatsAppDetailsMessage(selectedShareLead, updated, supportMemberName);
      setWhatsAppMessage(msg);
    }
  };

  const handleAddBrochureItem = (type: 'pdf' | 'link' = 'pdf', title = '', url = '') => {
    const newItem: AttachedBrochureItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      title: title || (type === 'pdf' ? `Service Brochure ${attachedBrochures.length + 1} (PDF)` : `Web Link ${attachedBrochures.length + 1}`),
      url: url,
      type
    };
    updateBrochuresAndMessage([...attachedBrochures, newItem]);
  };

  const handleRemoveBrochureItem = (id: string) => {
    const updated = attachedBrochures.filter((b) => b.id !== id);
    updateBrochuresAndMessage(updated);
  };

  const handleUpdateBrochureItem = (id: string, field: 'title' | 'url' | 'type', value: string) => {
    const updated = attachedBrochures.map((b) => (b.id === id ? { ...b, [field]: value } : b));
    updateBrochuresAndMessage(updated);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showNotification('Please select a valid PDF file (.pdf)', 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showNotification('PDF file size exceeds 25MB limit', 'error');
      return;
    }

    setIsUploadingPdf(true);
    try {
      // 1. Read file as base64 using FileReader
      const base64Promise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      const fileBase64 = await base64Promise;

      // 2. Upload to local server endpoint /api/upload-pdf
      let downloadUrl = '';
      try {
        const res = await fetch('/api/upload-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileBase64
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && (data.url || data.relativeUrl)) {
            downloadUrl = data.url || `${window.location.origin}${data.relativeUrl}`;
          }
        }
      } catch (serverErr) {
        console.warn('Local /api/upload-pdf request error:', serverErr);
      }

      // 3. Fallback: if server endpoint did not return URL, create a direct URL
      if (!downloadUrl) {
        downloadUrl = `${window.location.origin}/uploads/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      }

      const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      const newItem: AttachedBrochureItem = {
        id: Date.now().toString(),
        title: cleanTitle,
        url: downloadUrl,
        type: 'pdf'
      };

      updateBrochuresAndMessage([...attachedBrochures, newItem]);
      showNotification(`Uploaded & attached "${file.name}" to WhatsApp message!`, 'success');
    } catch (err: any) {
      console.error('PDF upload error:', err);
      const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      const fallbackItem: AttachedBrochureItem = {
        id: Date.now().toString(),
        title: cleanTitle,
        url: '',
        type: 'pdf'
      };
      updateBrochuresAndMessage([...attachedBrochures, fallbackItem]);
      showNotification('PDF attached. Please paste your Google Drive / cloud link.', 'error');
    } finally {
      setIsUploadingPdf(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOpenWhatsAppShare = (lead: Lead) => {
    setupShareForLead(lead);
    setActiveTab('whatsapp_share');
    if (onNavigate) {
      window.history.pushState({}, '', `/support/whatsapp-share?leadId=${lead.id}`);
    }
  };

  const handleSelectShareLeadId = (leadId: string) => {
    const found = leads.find((l) => l.id === leadId);
    if (found) {
      setupShareForLead(found);
      if (onNavigate) {
        window.history.pushState({}, '', `/support/whatsapp-share?leadId=${found.id}`);
      }
    }
  };

  const handleBackToLeads = () => {
    setActiveTab('inbound_leads');
    if (onNavigate) {
      onNavigate('/support');
    }
  };

  const handleSendWhatsApp = async () => {
    if (!selectedShareLead || !whatsAppPhone.trim()) {
      showNotification('Please enter a valid phone number', 'error');
      return;
    }

    const cleanPhone = cleanWhatsAppPhone(whatsAppPhone);
    const encodedMsg = encodeURIComponent(whatsAppMessage);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

    // Open WhatsApp in a new tab
    window.open(waUrl, '_blank');

    // Auto-update lead status to details_shared and record support notes if enabled
    if (autoMarkShared) {
      try {
        const existingNotes = selectedShareLead.supportNotes || '';
        const timeStr = new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        const appendNote = `[WhatsApp Shared]: Service details shared with CX on ${timeStr} to ${cleanPhone}.`;
        const updatedNotes = existingNotes ? `${existingNotes}\n${appendNote}` : appendNote;

        const updated = await api.updateLead(selectedShareLead.id, {
          supportStatus: 'details_shared',
          assignedSupportName: 'Support Team',
          supportNotes: updatedNotes
        });

        setLeads((prev) => prev.map((l) => (l.id === selectedShareLead.id ? updated : l)));
        setSelectedShareLead(updated);
        showNotification(`WhatsApp opened & status updated to "Details Shared" for ${updated.businessName}!`, 'success');
      } catch (err) {
        console.error('Failed to auto-update lead status:', err);
        showNotification('WhatsApp opened! (Status auto-update failed)', 'error');
      }
    } else {
      showNotification(`WhatsApp opened for ${selectedShareLead.businessName}!`, 'success');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsRes, ticketsRes, propsRes] = await Promise.all([
        api.getAllLeads(),
        api.getEscalations(),
        api.getProposals()
      ]);
      setLeads(leadsRes);
      setTickets(ticketsRes);
      setProposals(propsRes);
    } catch (err) {
      console.error('Failed to load support data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();

    const unsubLeads = api.subscribeLeads((updatedLeads) => {
      setLeads((prev) => {
        if (updatedLeads.length > 1) {
          return updatedLeads;
        }
        if (updatedLeads.length === 1) {
          const single = updatedLeads[0];
          const exists = prev.some((l) => l.id === single.id);
          return exists ? prev.map((l) => (l.id === single.id ? { ...l, ...single } : l)) : [single, ...prev];
        }
        return prev;
      });
    });

    const unsubProps = api.subscribeProposals((updatedProps) => {
      setProposals((prev) => {
        const merged = new Map<string, Proposal>();
        for (const p of updatedProps) {
          const key = (p.proposalNumber && p.proposalNumber.trim()) || p.id;
          merged.set(key, p);
        }
        for (const p of prev) {
          const key = (p.proposalNumber && p.proposalNumber.trim()) || p.id;
          if (!merged.has(key)) {
            merged.set(key, p);
          }
        }
        return Array.from(merged.values());
      });
    });

    const unsubEscs = api.subscribeEscalations((updatedEscs) => {
      setTickets((prev) => {
        if (updatedEscs.length > 1) {
          return updatedEscs;
        }
        if (updatedEscs.length === 1) {
          const single = updatedEscs[0];
          const exists = prev.some((e) => e.id === single.id);
          return exists ? prev.map((e) => (e.id === single.id ? { ...e, ...single } : e)) : [single, ...prev];
        }
        return prev;
      });
    });

    return () => {
      unsubLeads();
      unsubProps();
      unsubEscs();
    };
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter leads that were submitted with a customer requirement or need support fulfillment
  const inboundLeads = useMemo(() => {
    return leads.filter((l) => {
      // Leads with customer requirement or supportStatus or non-won/lost qualified leads
      return l.customerRequirement || l.supportStatus || l.status === 'qualified' || l.status === 'proposal_sent' || l.status === 'new';
    });
  }, [leads]);

  // Auto-select lead when on WhatsApp share page if none selected
  useEffect(() => {
    if (activeTab === 'whatsapp_share' && leads.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const paramLeadId = params.get('leadId');
      if (paramLeadId) {
        const found = leads.find((l) => l.id === paramLeadId);
        if (found && (!selectedShareLead || selectedShareLead.id !== found.id)) {
          setupShareForLead(found);
          return;
        }
      }
      if (!selectedShareLead) {
        const defaultLead = inboundLeads[0] || leads[0];
        if (defaultLead) {
          setupShareForLead(defaultLead);
        }
      }
    }
  }, [activeTab, leads, selectedShareLead, inboundLeads]);

  // Filtered by search & chips
  const filteredLeads = useMemo(() => {
    return inboundLeads.filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        l.businessName.toLowerCase().includes(q) ||
        l.contactPerson.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.city && l.city.toLowerCase().includes(q)) ||
        (l.serviceInterest && l.serviceInterest.toLowerCase().includes(q)) ||
        (l.agentName && l.agentName.toLowerCase().includes(q));

      const matchesReq =
        selectedReqFilter === 'all' || l.customerRequirement === selectedReqFilter;

      const matchesStatus =
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'pending' && (!l.supportStatus || l.supportStatus === 'pending_support')) ||
        l.supportStatus === selectedStatusFilter;

      return matchesSearch && matchesReq && matchesStatus;
    });
  }, [inboundLeads, search, selectedReqFilter, selectedStatusFilter]);

  // Support Metric counters
  const metrics = useMemo(() => {
    const total = inboundLeads.length;
    const detailsPending = inboundLeads.filter(
      (l) => l.customerRequirement === 'share_details' && l.supportStatus !== 'completed' && l.supportStatus !== 'details_shared'
    ).length;
    const demoPending = inboundLeads.filter(
      (l) => l.customerRequirement === 'demo_requested' && l.supportStatus !== 'completed' && l.supportStatus !== 'demo_sent'
    ).length;
    const negotiationPending = inboundLeads.filter(
      (l) => l.customerRequirement === 'rate_negotiation' && l.supportStatus !== 'completed' && l.supportStatus !== 'negotiation_approved'
    ).length;
    const callbacksPending = inboundLeads.filter(
      (l) => l.customerRequirement === 'callback' && l.supportStatus !== 'completed'
    ).length;
    const completed = inboundLeads.filter((l) => l.supportStatus === 'completed').length;

    return { total, detailsPending, demoPending, negotiationPending, callbacksPending, completed };
  }, [inboundLeads]);

  // Quotation Dispatch Status Helper
  const isProposalDispatched = (prop: Proposal) => {
    return (
      prop.approvalStatus === 'sent_to_client' ||
      prop.approvalStatus === 'sent' ||
      prop.approvalStatus === 'approved'
    );
  };

  // PENDING QUOTATIONS STRICTLY ON TOP (Sorted by pending-first, then newest date)
  const sortedProposals = useMemo(() => {
    return [...proposals].sort((a, b) => {
      const aDispatched = isProposalDispatched(a);
      const bDispatched = isProposalDispatched(b);

      // 1. Pending (not yet dispatched) strictly on top!
      if (!aDispatched && bDispatched) return -1;
      if (aDispatched && !bDispatched) return 1;

      // 2. Within same dispatch status group, sort newest first
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      if (!isNaN(dateA) && !isNaN(dateB) && dateA !== dateB) {
        return dateB - dateA;
      }
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [proposals]);

  const pendingProposalsCount = useMemo(() => {
    return proposals.filter((p) => !isProposalDispatched(p)).length;
  }, [proposals]);

  const dispatchedProposalsCount = useMemo(() => {
    return proposals.filter((p) => isProposalDispatched(p)).length;
  }, [proposals]);

  const filteredProposals = useMemo(() => {
    return sortedProposals.filter((p) => {
      const isDispatched = isProposalDispatched(p);
      if (quoteStatusFilter === 'pending' && isDispatched) return false;
      if (quoteStatusFilter === 'dispatched' && !isDispatched) return false;

      if (quoteSearch.trim()) {
        const q = quoteSearch.toLowerCase().trim();
        return (
          (p.clientCompany && p.clientCompany.toLowerCase().includes(q)) ||
          (p.clientName && p.clientName.toLowerCase().includes(q)) ||
          (p.proposalNumber && p.proposalNumber.toLowerCase().includes(q)) ||
          (p.clientPhone && p.clientPhone.includes(q)) ||
          (p.agentName && p.agentName.toLowerCase().includes(q)) ||
          (p.serviceCategory && p.serviceCategory.toLowerCase().includes(q)) ||
          (p.clientCity && p.clientCity.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [sortedProposals, quoteStatusFilter, quoteSearch]);

  // Update lead support status
  const handleUpdateSupportStatus = async (
    leadId: string,
    newStatus: Lead['supportStatus'],
    statusLabel: string
  ) => {
    try {
      setUpdatingLeadId(leadId);
      const updated = await api.updateLead(leadId, {
        supportStatus: newStatus,
        assignedSupportName: 'Support Team'
      });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      setSelectedLeadModal((prev) => (prev?.id === leadId ? updated : prev));
      showNotification(`Status updated to "${statusLabel}" for ${updated.businessName}`);
    } catch (err) {
      console.error(err);
      showNotification('Failed to update support status.', 'error');
    } finally {
      setUpdatingLeadId(null);
    }
  };

  // Save Support Notes
  const handleSaveNotes = async (leadId: string) => {
    try {
      setUpdatingLeadId(leadId);
      const updated = await api.updateLead(leadId, {
        supportNotes: noteDraft
      });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      setSelectedLeadModal((prev) => (prev?.id === leadId ? updated : prev));
      setEditingNotesLeadId(null);
      setNoteDraft('');
      showNotification('Support notes updated successfully.');
    } catch (err) {
      console.error(err);
      showNotification('Failed to save support notes.', 'error');
    } finally {
      setUpdatingLeadId(null);
    }
  };

  // Save Agent Calling Notes
  const handleSaveAgentNotes = async (leadId: string) => {
    try {
      setUpdatingLeadId(leadId);
      const updated = await api.updateLead(leadId, {
        notes: agentNotesDraft
      });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      setSelectedLeadModal((prev) => (prev?.id === leadId ? updated : prev));
      setEditingAgentNotesLeadId(null);
      setAgentNotesDraft('');
      showNotification('Agent calling notes updated successfully.');
    } catch (err) {
      console.error(err);
      showNotification('Failed to save agent notes.', 'error');
    } finally {
      setUpdatingLeadId(null);
    }
  };

  // Move Lead Stage Shortcut
  const handleMoveStage = async (leadId: string, nextStage: Lead['status'], stageLabel: string) => {
    try {
      setUpdatingLeadId(leadId);
      const updated = await api.updateLead(leadId, {
        status: nextStage,
        supportStatus: nextStage === 'won' ? 'completed' : 'in_progress'
      });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      setSelectedLeadModal((prev) => (prev?.id === leadId ? updated : prev));
      showNotification(`Lead moved to "${stageLabel}"!`);
    } catch (err) {
      console.error(err);
      showNotification('Failed to update stage.', 'error');
    } finally {
      setUpdatingLeadId(null);
    }
  };


  const handleDispatchProposal = async (proposalId: string) => {
    try {
      const updated = await api.updateProposalDispatch(proposalId, {
        status: 'sent_to_client',
        dispatchedBy: 'Support Team',
        supportNotes: 'Official quotation verified & dispatched to customer.'
      });
      setProposals(prev => prev.map(p => p.id === proposalId ? updated : p));
      showNotification(`Quotation ${updated.proposalNumber} dispatched to ${updated.clientCompany}!`);
    } catch (err) {
      console.error(err);
      showNotification('Failed to dispatch quotation.', 'error');
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    if (!ticketResolutionDraft.trim()) return;
    try {
      const updated = await api.updateEscalation(ticketId, {
        status: 'resolved',
        resolution: ticketResolutionDraft.trim(),
        resolvedAt: new Date().toISOString()
      });
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? updated : t)));
      setResolvingTicketId(null);
      setTicketResolutionDraft('');
      showNotification(`Ticket ${updated.ticketNumber} marked as resolved & synced!`);
    } catch (err) {
      console.error(err);
      showNotification('Failed to resolve escalation ticket.', 'error');
    }
  };

  // ── Manager Handlers ──────────────────────────────────────────────────────
  const handleApproveProposal = async (proposalId: string, comments?: string) => {
    const updated = await api.updateProposalStatus(proposalId, 'approved', comments);
    setProposals((prev) => prev.map((p) => (p.id === proposalId ? updated : p)));
    showNotification(`Proposal approved successfully.`);
  };

  const handleRejectProposal = async (proposalId: string, comments: string) => {
    const updated = await api.updateProposalStatus(proposalId, 'rejected', comments);
    setProposals((prev) => prev.map((p) => (p.id === proposalId ? updated : p)));
    showNotification(`Proposal rejected with feedback sent to agent.`);
  };

  const handleUpdateLeadNotes = async (leadId: string, notes: string) => {
    const updated = await api.updateLead(leadId, { notes });
    setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
  };

  const handleUpdateEscalationStatus = async (
    id: string,
    status: EscalationTicket['status'],
    resolution?: string
  ) => {
    const updated = await api.updateEscalation(id, {
      status,
      resolution,
      resolvedAt: new Date().toISOString()
    });
    setTickets((prev) => prev.map((e) => (e.id === id ? updated : e)));
    showNotification(`Escalation ticket ${updated.ticketNumber} updated.`);
  };

  const handleJumpToAgentProposals = (agentId: string) => {
    setSelectedAgentFilter(agentId);
    setActiveTab('proposal_approvals');
  };

  const handleJumpToAgentFollowups = (agentId: string) => {
    setSelectedAgentFilter(agentId);
    setActiveTab('followup_radar');
  };

  const tabTitle: Record<SupportTab, string> = {
    inbound_leads: 'Support Center & Inbound Leads Queue',
    quotation_requests: 'Quotation Requests & Customer Dispatch',
    whatsapp_share: 'Official WhatsApp Collateral Share Hub',
    department_tasks: 'Department Project Task Board',
    agent_targets: 'Monthly Revenue Targets',
    proposal_approvals: 'Proposal Approvals & Deal Review',
    followup_radar: 'Follow-up Radar — All Agents',
    escalations_mgr: 'Escalations & Waiver Resolution',
  };

  const tabSubtitle: Record<SupportTab, string> = {
    inbound_leads: 'Dialer qualified lead routing, customer requirement fulfillment, and stage progression.',
    quotation_requests: 'Review, verify, edit, and dispatch official commercial quotations to customers via WhatsApp & PDF.',
    whatsapp_share: 'Send customized service brochures, company portfolio links, and formal intro messages directly to client WhatsApp.',
    department_tasks: 'Work on Admin-assigned Digital and Developer department projects and keep task progress current.',
    agent_targets: 'Track monthly ₹ targets, won revenue, and client progress for each sales agent.',
    proposal_approvals: 'Approve or reject agent proposals. Proposals with >10% discount require manager sign-off.',
    followup_radar: 'View all agent follow-ups — overdue, due today, and upcoming — across the full sales pipeline.',
    escalations_mgr: 'Resolve custom pricing waivers, technical feasibility escalations, and SLA queries raised by agents.',
  };

  return (
    <div className="space-y-5 pb-12 w-full">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#041622] via-[#072435] to-[#0A3D52] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.18)] relative overflow-hidden text-white border border-[#103448]">
        {/* Subtle geometric & mountain landscape SVG silhouettes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
          <svg
            className="absolute bottom-0 right-0 w-[600px] h-[180px] text-teal-800/20"
            viewBox="0 0 600 180"
            fill="none"
            preserveAspectRatio="none"
          >
            <path d="M0 180 L120 70 L240 130 L380 40 L490 110 L600 20 L600 180 Z" fill="currentColor" />
            <path d="M60 180 L180 90 L300 145 L420 75 L520 125 L600 60 L600 180 Z" fill="currentColor" opacity="0.5" />
          </svg>
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#00D4DD]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-72 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl sm:text-[27px] font-bold tracking-tight text-white leading-tight">
              {tabTitle[activeTab]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1">
              {tabSubtitle[activeTab]}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                void loadData();
                window.dispatchEvent(new CustomEvent('vahlay:department_tasks_changed'));
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-sm transition active:scale-[0.98] border border-slate-200/50 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#00BCD4] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs transition-all ${notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
            : 'bg-rose-50 text-rose-900 border border-rose-300'
            }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-4 hover:opacity-75 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {activeTab === 'department_tasks' && (
        <DepartmentTasks canAssign={false} supportUsers={[]} />
      )}

      {/* ── MANAGER TAB: Agent Targets ──────────────────────────────────────── */}
      {activeTab === 'agent_targets' && isManagerOrAdmin && (
        <ManagerTargetsTab
          agents={agents}
          leads={leads}
          onSelectAgentProposals={handleJumpToAgentProposals}
          onSelectAgentFollowups={handleJumpToAgentFollowups}
        />
      )}

      {/* ── MANAGER TAB: Proposal Approvals ────────────────────────────────── */}
      {activeTab === 'proposal_approvals' && isManagerOrAdmin && (
        <ManagerProposalsTab
          proposals={proposals}
          agents={agents}
          selectedAgentFilter={selectedAgentFilter}
          onSelectAgentFilter={setSelectedAgentFilter}
          onApproveProposal={handleApproveProposal}
          onRejectProposal={handleRejectProposal}
        />
      )}

      {/* ── MANAGER TAB: Follow-up Radar ───────────────────────────────────── */}
      {activeTab === 'followup_radar' && isManagerOrAdmin && (
        <ManagerFollowUpsTab
          leads={leads}
          agents={agents}
          selectedAgentFilter={selectedAgentFilter}
          onSelectAgentFilter={setSelectedAgentFilter}
          onUpdateLeadNotes={handleUpdateLeadNotes}
        />
      )}

      {/* ── MANAGER TAB: Escalations ───────────────────────────────────────── */}
      {activeTab === 'escalations_mgr' && isManagerOrAdmin && (
        <ManagerEscalationsTab
          escalations={tickets}
          onUpdateEscalationStatus={handleUpdateEscalationStatus}
        />
      )}

      {/* TAB 1: Inbound Leads from Dialer */}
      {activeTab === 'inbound_leads' && (
        <div className="space-y-5">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-lg bg-white border border-slate-200/90 shadow-none">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Leads</span>
              <p className="text-xl font-semibold text-slate-900 mt-1">{metrics.total}</p>
              <span className="text-[11px] text-slate-500 mt-0.5 font-medium block">From Dialer calls</span>
            </div>

            <div className="p-4 rounded-lg bg-white border border-slate-200/90 shadow-none">
              <div className="flex items-center gap-1.5 text-blue-700">
                <FileText className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Details Due</span>
              </div>
              <p className="text-xl font-bold text-blue-900 mt-1">{metrics.detailsPending}</p>
              <span className="text-[10px] text-blue-600 mt-0.5 block">Brochures to share</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-indigo-700">
                <Laptop className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Demo Requests</span>
              </div>
              <p className="text-xl font-bold text-indigo-900 mt-1">{metrics.demoPending}</p>
              <span className="text-[10px] text-indigo-600 mt-0.5 block">Portfolios to send</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-amber-700">
                <BadgePercent className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Negotiations</span>
              </div>
              <p className="text-xl font-bold text-amber-900 mt-1">{metrics.negotiationPending}</p>
              <span className="text-[10px] text-amber-600 mt-0.5 block">Rate approval needed</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-purple-700">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Callbacks</span>
              </div>
              <p className="text-xl font-bold text-purple-900 mt-1">{metrics.callbacksPending}</p>
              <span className="text-[10px] text-purple-600 mt-0.5 block">Scheduled later</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Fulfilled</span>
              </div>
              <p className="text-xl font-bold text-emerald-900 mt-1">{metrics.completed}</p>
              <span className="text-[10px] text-emerald-600 mt-0.5 block">Completed by Support</span>
            </div>
          </div>

          {/* Search & Requirement Filter Bar */}
          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search lead by business name, contact, phone, city, or agent..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="all">All Fulfillment Statuses</option>
                  <option value="pending">⏳ Pending Support Action</option>
                  <option value="details_shared">📄 Details Shared</option>
                  <option value="demo_sent">💻 Demo Sent</option>
                  <option value="negotiation_approved">💰 Price Approved</option>
                  <option value="completed">✅ Completed</option>
                </select>
              </div>
            </div>

            {/* Requirement Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Filter by Cx Requirement:
              </span>
              <button
                onClick={() => setSelectedReqFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${selectedReqFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                All Requirements ({inboundLeads.length})
              </button>
              {CUSTOMER_REQUIREMENTS.map((req) => {
                const count = inboundLeads.filter((l) => l.customerRequirement === req.id).length;
                const Icon = req.icon;
                return (
                  <button
                    key={req.id}
                    onClick={() => setSelectedReqFilter(req.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${selectedReqFilter === req.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{req.shortLabel}</span>
                    <span className="text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inbound Leads Queue Table */}
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-300 shadow-2xs">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900">No leads found in this filter</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Jaise hi sales agents dialer se calling karke leads submit karenge, wo automatic is queue mein show ho jayengi.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-slate-300 shadow-[0_8px_30px_rgba(15,23,42,0.07)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs table-fixed min-w-[760px]">
                  <thead>
                    <tr className="bg-[#F1F5F9] border-b border-slate-300 text-slate-700 font-bold uppercase text-[10.5px] tracking-wider select-none">
                      <th className="py-3.5 px-4 text-left w-[29%]">Lead & Business</th>
                      <th className="py-3.5 px-3 text-left w-[18%]">Requirement</th>
                      <th className="py-3.5 px-3 text-left w-[17%]">Phone Number</th>
                      <th className="py-3.5 px-3 text-left w-[16%]">Service Interest</th>
                      <th className="py-3.5 px-2 text-center w-[10%]">Status</th>
                      <th className="py-3.5 px-4 text-right w-[10%]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium bg-white">
                    {filteredLeads.map((lead) => {
                      const reqMeta = CUSTOMER_REQUIREMENTS.find((r) => r.id === lead.customerRequirement);
                      const isDetailsShared = lead.supportStatus === 'details_shared' || lead.supportStatus === 'demo_sent' || lead.supportStatus === 'negotiation_approved' || lead.supportStatus === 'completed';
                      const isFulfilled = lead.supportStatus === 'completed';
                      const isProposal = lead.status === 'proposal_sent' || lead.status === 'won';

                      return (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLeadModal(lead)}
                          className="hover:bg-blue-50/50 cursor-pointer text-slate-800 transition-colors group border-b border-slate-200 last:border-b-0"
                        >
                          {/* 1. Lead & Business */}
                          <td className="py-3.5 px-4">
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-[13px] tracking-tight group-hover:text-blue-600 transition-colors truncate">
                                {lead.businessName}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate mt-0.5">
                                <UserRound className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate text-slate-600 font-medium">{lead.contactPerson || 'Decision Maker'}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[10px] text-slate-400">{lead.agentName || 'Sales Agent'}</span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Requirement */}
                          <td className="py-3.5 px-3">
                            {reqMeta ? (
                              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border truncate max-w-full shadow-2xs ${reqMeta.badge}`}>
                                <reqMeta.icon className="w-3 h-3 shrink-0 opacity-80" />
                                <span className="truncate">{reqMeta.label}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>

                          {/* 3. Phone */}
                          <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50/80 border border-slate-300 hover:border-blue-300 transition-all group/phone max-w-full shadow-2xs">
                              <Phone className="w-3 h-3 text-slate-500 group-hover/phone:text-blue-600 transition-colors shrink-0" />
                              <a
                                href={`tel:${lead.phone}`}
                                className="font-mono font-bold text-slate-800 text-xs group-hover/phone:text-blue-700 tracking-tight transition truncate"
                              >
                                {lead.phone}
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(lead.phone);
                                  showNotification(`Phone ${lead.phone} copied!`);
                                }}
                                className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-white transition cursor-pointer"
                                title="Copy phone"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          {/* 4. Service Interest */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-xs font-semibold text-slate-700 truncate" title={lead.serviceInterest}>
                                {lead.serviceInterest || 'General Service'}
                              </span>
                            </div>
                          </td>

                          {/* 5. Status */}
                          <td className="py-3.5 px-2 text-center">
                            {isProposal ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                <Send className="w-2.5 h-2.5 text-purple-600" />
                                <span>Proposal</span>
                              </span>
                            ) : isFulfilled ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Fulfilled</span>
                              </span>
                            ) : isDetailsShared ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <CheckCircle2 className="w-2.5 h-2.5 text-blue-600" />
                                <span>Shared</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-2.5 h-2.5 text-amber-600" />
                                <span>New</span>
                              </span>
                            )}
                          </td>

                          {/* 6. Action Button: View */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLeadModal(lead);
                              }}
                              className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>View</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Quotation Requests to Dispatch to Customers */}
      {activeTab === 'quotation_requests' && (
        <div className="space-y-5">
          {/* Header Card with Counters, Filter Tabs & Search */}
          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-slate-900">
                    Agent Quotation Requests Queue
                  </h2>
                  {pendingProposalsCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      <span>{pendingProposalsCount} Action Required</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Agents direct quotes send nahi karte. Support Team yahan se quotation verify, customize/edit karke customer ko WhatsApp & PDF format me deliver karegi.
                </p>
              </div>

              {/* Status Counters Strip */}
              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {proposals.length} Total
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  pendingProposalsCount > 0
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  ⏳ {pendingProposalsCount} Pending
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ✓ {dispatchedProposalsCount} Dispatched
                </span>
              </div>
            </div>

            {/* Filter Pills & Live Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setQuoteStatusFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    quoteStatusFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({proposals.length})
                </button>
                <button
                  type="button"
                  onClick={() => setQuoteStatusFilter('pending')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    quoteStatusFilter === 'pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  ⏳ Pending Dispatch ({pendingProposalsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setQuoteStatusFilter('dispatched')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    quoteStatusFilter === 'dispatched'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  ✓ Dispatched ({dispatchedProposalsCount})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search client, quote #, phone, agent..."
                  value={quoteSearch}
                  onChange={(e) => setQuoteSearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
                {quoteSearch && (
                  <button
                    type="button"
                    onClick={() => setQuoteSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Pending Priority Alert Banner */}
          {pendingProposalsCount > 0 && quoteStatusFilter !== 'dispatched' && !quoteSearch && (
            <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                <span className="font-semibold">
                  <strong>{pendingProposalsCount} pending quotation(s)</strong> require Support review & customer dispatch. (Pending quotations pinned at the top).
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full self-start sm:self-auto border border-amber-200">
                ⚡ Priority: Top of Queue
              </span>
            </div>
          )}

          {/* Quotations List */}
          <div className="space-y-4">
            {filteredProposals.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-white border border-slate-200 shadow-2xs">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-900">
                  {quoteSearch || quoteStatusFilter !== 'all' ? 'No matching quotation requests' : 'No quotation requests yet'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {quoteSearch || quoteStatusFilter !== 'all'
                    ? 'Try clearing your search or status filter to see all quotation requests.'
                    : 'Jaise hi sales agents quotation request raise karenge, wo yahan queue me show hongi customer dispatch ke liye.'}
                </p>
                {(quoteSearch || quoteStatusFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuoteSearch('');
                      setQuoteStatusFilter('all');
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              filteredProposals.map((prop) => {
                const isDispatched = isProposalDispatched(prop);

                return (
                  <div
                    key={prop.id}
                    className={`p-5 sm:p-6 rounded-xl bg-white transition-all space-y-4 ${
                      !isDispatched
                        ? 'border-2 border-amber-300 shadow-xs hover:shadow-md ring-1 ring-amber-200/50'
                        : 'border border-slate-200/90 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {/* Top Row: Client & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 tracking-tight">
                            {prop.clientCompany}
                          </h3>
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {prop.proposalNumber}
                          </span>
                          {prop.clientCity && (
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              📍 {prop.clientCity}
                            </span>
                          )}
                          {!isDispatched && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                              Top Priority
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Requested by Sales Agent: <strong className="text-slate-800">{prop.agentName}</strong> • Date: {prop.createdAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          isDispatched
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : prop.approvalStatus === 'pending_manager_approval'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isDispatched ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span>
                            {isDispatched
                              ? 'Dispatched to Customer'
                              : prop.approvalStatus === 'pending_manager_approval'
                                ? 'Manager Approval Due'
                                : 'Pending Support Recheck & Dispatch'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Middle Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Contact Person</span>
                        <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                          <UserRound className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prop.clientName || 'Decision Maker'}</span>
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Customer Mobile / WhatsApp</span>
                        <p className="font-mono font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prop.clientPhone || 'Not provided'}</span>
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Service Scope</span>
                        <p className="font-bold text-blue-900 mt-0.5 truncate">
                          {prop.serviceCategory}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Commercial Value</span>
                        <p className="font-bold text-emerald-700 mt-0.5 text-sm">
                          ₹{prop.totalINR.toLocaleString('en-IN')}
                          {prop.discountPercentage > 0 && (
                            <span className="text-[10px] text-amber-600 font-semibold ml-1">
                              ({prop.discountPercentage}% off)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Scope of Work Deliverables */}
                    {prop.scopeOfWork && prop.scopeOfWork.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1">
                        <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                          Scope Inclusions:
                        </span>
                        <ul className="text-slate-600 space-y-0.5 list-disc list-inside">
                          {prop.scopeOfWork.slice(0, 3).map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Agent Notes / Manager Comments */}
                    {prop.managerComments && (
                      <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs text-amber-950">
                        <strong>Agent Instructions / Notes: </strong>{prop.managerComments}
                      </div>
                    )}

                    {/* Bottom Action Controls */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
                      <div className="text-xs text-slate-500 font-medium">
                        {prop.items && prop.items.length > 0 ? (
                          <span className="text-blue-700 font-semibold">📄 {prop.items.length} line item(s) included</span>
                        ) : (
                          <span className="text-slate-400">Standard single-package quotation</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 1. Review & Recheck Modal Button */}
                        <button
                          type="button"
                          onClick={() => setPreviewingQuotation(prop)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Review Quotation</span>
                        </button>

                        {/* 2. Direct Support Team Edit Quotation Button (Only before sending to customer) */}
                        {!isDispatched && (
                          <button
                            type="button"
                            onClick={() => setEditingQuotation(prop)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                            title="Edit quotation pricing, services, items or client details"
                          >
                            <Pencil className="w-3.5 h-3.5 text-amber-700" />
                            <span>Edit Quotation</span>
                          </button>
                        )}

                        {/* 3. Official WhatsApp Dispatch Button (Support Interface Only) */}
                        {prop.clientPhone && (
                          <a
                            href={getQuotationWhatsAppLink(prop)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              if (!isDispatched) {
                                handleDispatchProposal(prop.id);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                            title="Directly send official quotation via WhatsApp to customer"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {/* 4. Customer Dispatch Button */}
                        {!isDispatched && (
                          <button
                            type="button"
                            onClick={() => handleDispatchProposal(prop.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                          >
                            <CheckCheck className="w-4 h-4" />
                            <span>Mark as Sent to Customer</span>
                          </button>
                        )}

                        {isDispatched && (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Sent on {prop.dispatchedAt || prop.createdAt}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Inbound Customer Details & Action Modal (View Full CX Details) ── */}
      {selectedLeadModal && (() => {
        const reqMeta = CUSTOMER_REQUIREMENTS.find((r) => r.id === selectedLeadModal.customerRequirement);
        const isDetailsShared = selectedLeadModal.supportStatus === 'details_shared' || selectedLeadModal.supportStatus === 'demo_sent' || selectedLeadModal.supportStatus === 'negotiation_approved' || selectedLeadModal.supportStatus === 'completed';
        const isFulfilled = selectedLeadModal.supportStatus === 'completed';
        const isProposal = selectedLeadModal.status === 'proposal_sent' || selectedLeadModal.status === 'won';
        const isUpdating = updatingLeadId === selectedLeadModal.id;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[92vh] flex flex-col">
              
              {/* Header */}
              <div className="p-4 sm:px-6 bg-gradient-to-r from-slate-900 via-[#072435] to-[#0A3D52] text-white flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                        {selectedLeadModal.businessName}
                      </h2>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span>STAGE: {selectedLeadModal.status.toUpperCase()}</span>
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 flex items-center gap-2 truncate mt-0.5 flex-wrap">
                      <span>Submitted by <strong>{selectedLeadModal.agentName || 'Sales Agent'}</strong></span>
                      {(selectedLeadModal.lastContactDate || selectedLeadModal.scrapedDate) && (
                        <span>• {selectedLeadModal.lastContactDate || selectedLeadModal.scrapedDate}</span>
                      )}
                      {selectedLeadModal.city && <span>• <MapPin className="w-3 h-3 inline text-slate-400" /> {selectedLeadModal.city}</span>}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLeadModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/50">
                
                {/* 1. Quick Info Metric Cards (4 Grid) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                      <UserRound className="w-3.5 h-3.5 text-slate-500" />
                      <span>Contact Person</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {selectedLeadModal.contactPerson || 'Decision Maker'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Phone & Calling</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${selectedLeadModal.phone}`}
                        className="text-xs sm:text-sm font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline truncate"
                      >
                        {selectedLeadModal.phone}
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedLeadModal.phone);
                          showNotification(`Phone ${selectedLeadModal.phone} copied!`);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                        title="Copy Phone"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                      <span>Service Interested</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={selectedLeadModal.serviceInterest}>
                      {selectedLeadModal.serviceInterest || 'General Service'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                      <Wallet className="w-3.5 h-3.5 text-slate-500" />
                      <span>Quoted Budget</span>
                    </div>
                    <div className="text-xs sm:text-sm font-mono font-bold text-emerald-700">
                      ₹{(selectedLeadModal.estimatedBudgetINR || selectedLeadModal.quotationINR || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* 2. Customer Requirement Details */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Client Requirement / Support Need
                    </div>
                    {reqMeta ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border shadow-2xs ${reqMeta.badge}`}>
                          <reqMeta.icon className="w-4 h-4 shrink-0" />
                          <span>{reqMeta.label}</span>
                        </span>
                        <span className="text-xs text-slate-600">{reqMeta.desc}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-600">No specific requirement tagged by agent.</div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Status:</span>
                    {isProposal ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                        <Send className="w-3 h-3 text-purple-600" />
                        <span>Proposal Stage</span>
                      </span>
                    ) : isFulfilled ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Fulfilled</span>
                      </span>
                    ) : isDetailsShared ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        <span>Details Shared</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Pending Support</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Agent Calling Notes */}
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-700" />
                      <span>Agent Dialer Calling Notes</span>
                    </div>
                    {editingAgentNotesLeadId !== selectedLeadModal.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAgentNotesLeadId(selectedLeadModal.id);
                          setAgentNotesDraft(selectedLeadModal.notes || '');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 transition cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit Notes</span>
                      </button>
                    ) : null}
                  </div>

                  {editingAgentNotesLeadId === selectedLeadModal.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={agentNotesDraft}
                        onChange={(e) => setAgentNotesDraft(e.target.value)}
                        placeholder="Edit calling conversation notes..."
                        rows={3}
                        className="w-full p-2.5 rounded-lg bg-white border border-amber-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingAgentNotesLeadId(null)}
                          className="px-3 py-1 rounded-lg border border-slate-300 text-slate-600 hover:bg-white text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveAgentNotes(selectedLeadModal.id)}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {isUpdating ? 'Saving...' : 'Save Notes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-800 font-medium leading-relaxed bg-white/70 p-3 rounded-lg border border-amber-200/60">
                      {selectedLeadModal.notes || 'No agent notes recorded yet.'}
                    </p>
                  )}
                </div>

                {/* 4. Support Desk Notes */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Support Desk Notes & Activity</span>
                    </div>
                    {editingNotesLeadId !== selectedLeadModal.id ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNotesLeadId(selectedLeadModal.id);
                          setNoteDraft(selectedLeadModal.supportNotes || '');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2.5 py-1 rounded-lg border border-blue-300 transition cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>{selectedLeadModal.supportNotes ? 'Edit Support Note' : '+ Add Support Note'}</span>
                      </button>
                    ) : null}
                  </div>

                  {editingNotesLeadId === selectedLeadModal.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Add internal technical notes, customer call details, WhatsApp delivery logs, etc."
                        rows={3}
                        className="w-full p-2.5 rounded-lg bg-white border border-blue-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingNotesLeadId(null)}
                          className="px-3 py-1 rounded-lg border border-slate-300 text-slate-600 hover:bg-white text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(selectedLeadModal.id)}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {isUpdating ? 'Saving...' : 'Save Support Note'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-700 font-normal leading-relaxed bg-white/70 p-3 rounded-lg border border-blue-200/60 whitespace-pre-wrap">
                      {selectedLeadModal.supportNotes || 'No support notes added yet. Click "+ Add Support Note" to log technical advice, brochure delivery or customer follow-up.'}
                    </p>
                  )}
                </div>

                {/* 5. Workflow Stepper */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Lead Lifecycle Workflow:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateSupportStatus(selectedLeadModal.id, 'pending_support', 'New Request')}
                      disabled={isUpdating}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        !isDetailsShared && !isFulfilled && !isProposal
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>1. New Request</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateSupportStatus(selectedLeadModal.id, 'details_shared', 'Details Shared')}
                      disabled={isUpdating}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isDetailsShared && !isFulfilled && !isProposal
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : isFulfilled || isProposal
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>2. Details Shared</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateSupportStatus(selectedLeadModal.id, 'completed', 'Fulfilled')}
                      disabled={isUpdating}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isFulfilled && !isProposal
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : isProposal
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>3. Fulfilled</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveStage(selectedLeadModal.id, 'proposal_sent', 'Proposal Sent')}
                      disabled={isUpdating}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isProposal
                          ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>4. Proposal</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Footer */}
              <div className="p-4 sm:px-6 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* WhatsApp Details Button */}
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenWhatsAppShare(selectedLeadModal);
                      setSelectedLeadModal(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>WhatsApp Details</span>
                  </button>

                  <span className="text-slate-300 hidden sm:inline">|</span>
                  <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Next Action:</span>

                  <button
                    type="button"
                    onClick={() => handleUpdateSupportStatus(selectedLeadModal.id, 'details_shared', 'Details Shared')}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3 h-3" />
                    <span>Details Shared</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateSupportStatus(selectedLeadModal.id, 'completed', 'Fulfilled')}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Fulfilled</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveStage(selectedLeadModal.id, 'proposal_sent', 'Proposal Sent')}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>Advance to Proposal</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLeadModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── Support Desk Quotation Document Recheck & Dispatch Modal ── */}
      {previewingQuotation && (
        <QuotationPreviewModal
          proposal={previewingQuotation}
          onClose={() => setPreviewingQuotation(null)}
          onDispatch={(id) => {
            handleDispatchProposal(id);
            setPreviewingQuotation(null);
          }}
          onEdit={(prop) => {
            setPreviewingQuotation(null);
            setEditingQuotation(prop);
          }}
          isSupportView={true}
        />
      )}

      {/* ── Support Desk Live Quotation Editor Modal ── */}
      {editingQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[96vh] flex flex-col">
            <div className="p-4 sm:px-6 bg-gradient-to-r from-slate-900 via-[#072435] to-[#0A3D52] text-white flex items-center justify-between gap-4 shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00BCD4]/20 border border-[#00BCD4]/40 text-[#00BCD4] flex items-center justify-center shrink-0">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Edit Quotation: {editingQuotation.proposalNumber}
                    </h2>
                    <span className="font-semibold text-xs text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800">
                      {editingQuotation.clientCompany}
                    </span>
                    {editingQuotation.agentName && (
                      <span className="text-xs text-slate-300">
                        • Agent: <strong className="text-white">{editingQuotation.agentName}</strong>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Support Desk Live Editor • Edit line items, quantities, rates, customer details or terms before customer dispatch.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingQuotation(null)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Close editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
              <QuotationStudio
                initialProposal={editingQuotation}
                isSupportEdit={true}
                onCancel={() => setEditingQuotation(null)}
                onQuotationSubmitted={(updatedProp) => {
                  setProposals((prev) => {
                    const key = (updatedProp.proposalNumber && updatedProp.proposalNumber.trim()) || updatedProp.id;
                    const exists = prev.some((p) => ((p.proposalNumber && p.proposalNumber.trim()) || p.id) === key);
                    if (exists) {
                      return prev.map((p) => (((p.proposalNumber && p.proposalNumber.trim()) || p.id) === key ? { ...p, ...updatedProp } : p));
                    }
                    return [updatedProp, ...prev];
                  });
                  setEditingQuotation(null);
                  showNotification(`Quotation #${updatedProp.proposalNumber} updated successfully!`, 'success');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB: Dedicated Full-Page WhatsApp Collateral & Service Share Hub */}
      {activeTab === 'whatsapp_share' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Hub Header & Navigation Bar */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBackToLeads}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>Back to Leads Queue</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    WhatsApp Collateral &amp; Service Share Studio
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#25D366] text-[10px] font-bold border border-emerald-200">
                    Direct CX Chat
                  </span>
                </div>
               
              </div>
            </div>

            {/* Quick Customer Switcher Dropdown */}
            {inboundLeads.length > 0 && (
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">Active Customer:</span>
                <select
                  value={selectedShareLead?.id || ''}
                  onChange={(e) => handleSelectShareLeadId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 max-w-[240px] truncate"
                >
                  {inboundLeads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.businessName} {l.contactPerson ? `(${l.contactPerson})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {!selectedShareLead ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <WhatsAppIcon className="w-6 h-6 fill-[#25D366]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Customer Lead Selected</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Please select a customer lead from the queue to compose and share tailored PDFs and collateral.
              </p>
              <button
                type="button"
                onClick={handleBackToLeads}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
              >
                <span>Go to Inbound Leads Queue</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Customer Details, Templates, Multi-PDF/Link Hub (span 7) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Customer Overview Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Target Customer</span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>{selectedShareLead.businessName}</span>
                        {selectedShareLead.contactPerson && selectedShareLead.contactPerson !== selectedShareLead.businessName && (
                          <span className="text-xs font-semibold text-slate-500">({selectedShareLead.contactPerson})</span>
                        )}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-600" />
                      <span>Ready to Send</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Customer Mobile / WhatsApp</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <input
                          type="text"
                          value={whatsAppPhone}
                          onChange={(e) => setWhatsAppPhone(e.target.value)}
                          placeholder="e.g. 919426499499"
                          className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs w-full focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Service Requested</span>
                      <p className="font-bold text-blue-900 mt-1 text-xs truncate">
                        {selectedShareLead.serviceInterest || 'Digital & Web Services'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Calling Sales Agent</span>
                      <p className="font-bold text-slate-700 mt-1 text-xs truncate">
                        {selectedShareLead.agentName || 'Sales Desk'}
                      </p>
                    </div>
                  </div>

                  {selectedShareLead.notes && (
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                        <span>Dialer Calling Note from Agent:</span>
                      </span>
                      <p className="text-amber-950 font-semibold leading-relaxed">{selectedShareLead.notes}</p>
                    </div>
                  )}
                </div>

                {/* 2. Multi-PDF & Multi-Link Collateral Hub */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Brochures, PDFs &amp; Web Links (Multi-share supported):</span>
                      </label>
                    
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf,application/pdf"
                        onChange={handlePdfUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        disabled={isUploadingPdf}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                        title="Upload PDF from device"
                      >
                        {isUploadingPdf ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                            <span>Upload Local PDF</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddBrochureItem('pdf', 'Service Brochure PDF', '')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-rose-600" />
                        <span>+ PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddBrochureItem('link', 'Website Link', '')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-xs font-bold transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-600" />
                        <span>+ Link</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Presets Bar */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => handleAddBrochureItem('link', 'Company Portfolio & Work Samples', 'https://vahlaydigital.com')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition cursor-pointer"
                    >
                      + Company Portfolio
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBrochureItem('pdf', 'Web & App Development Scope (PDF)', 'https://vahlaydigital.com/services')}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold transition cursor-pointer"
                    >
                      + Web Development Brochure
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBrochureItem('pdf', 'Digital Marketing & SEO Deck (PDF)', 'https://vahlaydigital.com/marketing')}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-bold transition cursor-pointer"
                    >
                      + Digital Marketing Deck
                    </button>
                  </div>

                  {/* Attached Items List */}
                  <div className="space-y-2 mt-3">
                    {attachedBrochures.length === 0 ? (
                      <div className="p-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs">
                        No documents or links added yet. Click <strong>"Upload Local PDF"</strong>, <strong>"+ PDF"</strong>, or <strong>"Quick Presets"</strong> above to attach.
                      </div>
                    ) : (
                      attachedBrochures.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition"
                        >
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateBrochureItem(item.id, 'type', item.type === 'pdf' ? 'link' : 'pdf')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border transition cursor-pointer ${
                                item.type === 'pdf'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                              title="Click to toggle between PDF and Link"
                            >
                              {item.type === 'pdf' ? '📄 PDF' : '🔗 Link'}
                            </button>
                          </div>

                          <div className="w-full sm:w-48 shrink-0">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handleUpdateBrochureItem(item.id, 'title', e.target.value)}
                              placeholder={item.type === 'pdf' ? 'PDF Title' : 'Link Title'}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            />
                          </div>

                          <div className="relative flex-1 min-w-0">
                            <input
                              type="text"
                              value={item.url}
                              onChange={(e) => handleUpdateBrochureItem(item.id, 'url', e.target.value)}
                              placeholder={
                                item.type === 'pdf'
                                  ? 'Paste PDF link (Google Drive / cloud link)'
                                  : 'https://example.com'
                              }
                              className="w-full px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                            />
                          </div>

                          <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                                title="Test link (opens in new tab)"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveBrochureItem(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Message Preview & Send Actions (span 5) */}
              <div className="lg:col-span-5 space-y-5 sticky top-6">
                <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden space-y-0">
                  {/* Card Header */}
                  <div className="p-4 bg-gradient-to-r from-emerald-950 via-[#0b2b1a] to-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <WhatsAppIcon className="w-5 h-5 fill-[#25D366]" />
                      <span className="font-bold text-sm">Live WhatsApp Message Preview</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono font-medium">
                      {whatsAppMessage.length} chars
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Message Content (Fully Editable):</span>
                        <span className="text-[10px] text-slate-400 font-normal">Real-time synced</span>
                      </label>
                      <textarea
                        rows={13}
                        value={whatsAppMessage}
                        onChange={(e) => setWhatsAppMessage(e.target.value)}
                        className="w-full p-3.5 rounded-xl border border-slate-300 text-xs font-sans text-slate-800 leading-relaxed focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={autoMarkShared}
                        onChange={(e) => setAutoMarkShared(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="text-emerald-950 font-semibold">
                        Auto-update status to <strong className="text-emerald-800">"Details Shared"</strong> &amp; log CRM note
                      </span>
                    </label>

                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSendWhatsApp}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <WhatsAppIcon className="w-5 h-5 fill-white" />
                        <span>Open &amp; Send in WhatsApp</span>
                        <ExternalLink className="w-4 h-4 text-white/90" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(whatsAppMessage);
                          setCopiedMessage(true);
                          setTimeout(() => setCopiedMessage(false), 2500);
                        }}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs transition cursor-pointer"
                      >
                        {copiedMessage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                        <span>{copiedMessage ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleBackToLeads}
                        className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-800 font-semibold transition cursor-pointer"
                      >
                        Cancel &amp; Return to Inbound Queue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
