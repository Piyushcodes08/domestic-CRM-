import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Proposal, ServiceItem, QuotationLineItem, CompanyProfile, Lead } from '../../types';
import {
  FileText,
  Printer,
  Download,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  UserRound,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  BadgeCheck,
  Share2,
  MessageCircle,
  Eye,
  RefreshCw,
  AlertCircle,
  Link2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export function numberToIndianWords(num: number): string {
  if (!num || num <= 0) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertThreeDigits = (n: number): string => {
    let str = '';
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + ' ';
    }
    return str.trim();
  };

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const remaining = Math.floor(num);

  let res = '';
  if (crore > 0) res += convertThreeDigits(crore) + ' Crore ';
  if (lakh > 0) res += convertThreeDigits(lakh) + ' Lakh ';
  if (thousand > 0) res += convertThreeDigits(thousand) + ' Thousand ';
  if (remaining > 0) res += convertThreeDigits(remaining) + ' ';

  return res.trim() + ' Rupees Only';
}

export const DEFAULT_COMPANIES: CompanyProfile[] = [
  {
    id: 'vahlay-digital-hq',
    name: 'Vahlay Digital',
    logoUrl: '/vahlay-vd-logo.png',
    tagline: 'Enterprise Digital Transformation & Web Engineering',
    address: '515, Dev Aurum Commercial Complex\nPrahlad Nagar',
    phone: '83479 30515',
    email: 'billing@vahlaydigital.com',
    website: 'https://vahlaydigital.com',
    gstin: '24AAFCV9821F1ZX',
    pan: 'AAFCV9821F',
    bankDetails: {
      bankName: 'HDFC Bank Ltd.',
      accountNo: '50200084920194',
      ifsc: 'HDFC0001234',
      upiId: 'vahlaydigital@hdfcbank'
    }
  }
];

interface QuotationStudioProps {
  onQuotationSubmitted?: (proposal: Proposal) => void;
  onCancel?: () => void;
  initialProposal?: Proposal | null;
  readOnly?: boolean;
  isSupportEdit?: boolean;
}

export const QuotationStudio: React.FC<QuotationStudioProps> = ({
  onQuotationSubmitted,
  onCancel,
  initialProposal,
  readOnly = false,
  isSupportEdit = false
}) => {
  const { currentUser, isSupport, isManager, isAdmin } = useAuth();

  // Company profile state
  const [companies, setCompanies] = useState<CompanyProfile[]>(DEFAULT_COMPANIES);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    initialProposal?.companyProfileId || DEFAULT_COMPANIES[0].id
  );
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyAddress, setNewCompanyAddress] = useState('');
  const [newCompanyGstin, setNewCompanyGstin] = useState('');
  const [newCompanyPhone, setNewCompanyPhone] = useState('');
  const [newCompanyEmail, setNewCompanyEmail] = useState('');

  // Client Details state
  const [clientName, setClientName] = useState(initialProposal?.clientName || '');
  const [clientBusiness, setClientBusiness] = useState(initialProposal?.clientCompany || '');
  const [clientPhone, setClientPhone] = useState(initialProposal?.clientPhone || '');
  const [clientEmail, setClientEmail] = useState(initialProposal?.clientEmail || '');
  const [clientAddress, setClientAddress] = useState(
    initialProposal?.clientAddress || initialProposal?.clientCity || ''
  );

  // Existing clients & leads for auto-complete datalist
  const [existingLeads, setExistingLeads] = useState<Lead[]>([]);

  // Quotation metadata
  const [quoteNumber, setQuoteNumber] = useState(
    initialProposal?.proposalNumber || 'VDBDS00001'
  );
  const [quoteDate, setQuoteDate] = useState(
    initialProposal?.createdAt || new Date().toISOString().split('T')[0]
  );
  const [quoteValidUntil, setQuoteValidUntil] = useState(
    initialProposal?.validUntil ||
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [preparedBy, setPreparedBy] = useState(
    initialProposal?.preparedBy || initialProposal?.agentName || currentUser?.name || 'Krishna Chouhan'
  );

  // Line items state
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceQuickAdd, setServiceQuickAdd] = useState('');
  const [items, setItems] = useState<QuotationLineItem[]>(() => {
    if (initialProposal?.items && initialProposal.items.length > 0) {
      return initialProposal.items;
    }
    if (initialProposal) {
      const scope = initialProposal.scopeOfWork || [];
      if (scope.length > 0) {
        return scope.map((s, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          moduleName: idx === 0 ? (initialProposal.serviceCategory || 'Service Scope') : 'Deliverable Inclusion',
          description: s,
          qty: 1,
          rate: idx === 0 ? (initialProposal.subtotalINR || initialProposal.totalINR || 0) : 0,
          amount: idx === 0 ? (initialProposal.subtotalINR || initialProposal.totalINR || 0) : 0
        }));
      }
      return [
        {
          id: `item-${Date.now()}`,
          moduleName: initialProposal.serviceCategory || 'Commercial Service',
          description: 'Scope as discussed with client',
          qty: 1,
          rate: initialProposal.subtotalINR || initialProposal.totalINR || 0,
          amount: initialProposal.subtotalINR || initialProposal.totalINR || 0
        }
      ];
    }
    // Default starter item matching user design
    return [
      {
        id: 'item-1',
        moduleName: 'Photo Creative Design',
        description: '1 Professional social media post or promotional photo design',
        qty: 1,
        rate: 500,
        amount: 500
      }
    ];
  });

  // GST & Totals
  const [gstSelect, setGstSelect] = useState<number>(
    initialProposal?.gstRate !== undefined ? initialProposal.gstRate : 18
  );

  // Terms and closing note
  const [termsText, setTermsText] = useState(
    initialProposal?.termsAndConditions?.join('\n') ||
    `Payment: 30% advance due before project start; remaining 70% payable as each feature/milestone is completed and approved.
Milestones & Review: Deliverables are split by feature; you'll have 5 business days to review and sign off on each one. Without feedback, milestones are deemed accepted.`
  );

  const [thanksText, setThanksText] = useState(
    initialProposal?.closingNote || 'Thank you for your business!'
  );

  const [supportInstructions, setSupportInstructions] = useState(
    initialProposal?.managerComments?.replace(/^Agent Notes for Support:\s*/, '') || ''
  );

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = React.useRef(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Synchronized Scrolling State & Refs
  const leftScrollRef = React.useRef<HTMLDivElement>(null);
  const rightScrollRef = React.useRef<HTMLDivElement>(null);
  const previewPaperRef = React.useRef<HTMLDivElement>(null);
  const isSyncing = React.useRef<boolean>(false);
  const [isSyncScroll, setIsSyncScroll] = useState<boolean>(true);
  const [activeSyncSection, setActiveSyncSection] = useState<string>('company-client');

  useEffect(() => {
    const leftEl = leftScrollRef.current;
    const rightEl = rightScrollRef.current;
    const previewEl = previewPaperRef.current;
    if (!leftEl || !rightEl || !previewEl) return;

    // Left form height = right quotation's full natural scrollHeight
    const syncPanelHeight = () => {
      if (window.innerWidth >= 1024) {
        leftEl.style.height = `${rightEl.scrollHeight}px`;
        leftEl.style.maxHeight = `${rightEl.scrollHeight}px`;
      } else {
        leftEl.style.height = '';
        leftEl.style.maxHeight = '';
      }
    };

    const resizeObserver = new ResizeObserver(syncPanelHeight);
    resizeObserver.observe(previewEl);
    window.addEventListener('resize', syncPanelHeight);
    syncPanelHeight();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncPanelHeight);
      leftEl.style.height = '';
      leftEl.style.maxHeight = '';
    };
  }, []);

  // Bidirectional synchronized scrolling between left form and right live preview
  const syncScroll = (source: 'left' | 'right') => {
    if (!isSyncScroll) return;
    if (isSyncing.current) return;

    const leftEl = leftScrollRef.current;
    const rightEl = rightScrollRef.current;
    if (!leftEl || !rightEl) return;

    const srcEl = source === 'left' ? leftEl : rightEl;
    const destEl = source === 'left' ? rightEl : leftEl;

    const maxSrc = srcEl.scrollHeight - srcEl.clientHeight;
    const maxDest = destEl.scrollHeight - destEl.clientHeight;

    if (maxDest <= 0) return;
    if (maxSrc <= 0) return;

    isSyncing.current = true;

    const sectionIds = [
      'company-client',
      'quotation-details',
      'line-items',
      'totals',
      'terms',
      'actions'
    ];

    const sPoints: number[] = [0];
    const dPoints: number[] = [0];

    const srcRect = srcEl.getBoundingClientRect();
    const destRect = destEl.getBoundingClientRect();

    for (const id of sectionIds) {
      const sNode = srcEl.querySelector(`[data-sync-id="${id}"]`) as HTMLElement | null;
      const dNode = destEl.querySelector(`[data-sync-id="${id}"]`) as HTMLElement | null;
      if (sNode && dNode) {
        const sOffset = Math.max(0, sNode.getBoundingClientRect().top - srcRect.top + srcEl.scrollTop);
        const dOffset = Math.max(0, dNode.getBoundingClientRect().top - destRect.top + destEl.scrollTop);
        sPoints.push(sOffset);
        dPoints.push(dOffset);
      }
    }

    sPoints.push(maxSrc);
    dPoints.push(maxDest);

    const currentScroll = srcEl.scrollTop;
    let targetScroll = 0;

    let found = false;
    for (let i = 0; i < sPoints.length - 1; i++) {
      const p1 = sPoints[i];
      const p2 = sPoints[i + 1];
      if (currentScroll >= p1 && currentScroll <= p2) {
        const seg = p2 - p1;
        const ratio = seg > 0 ? (currentScroll - p1) / seg : 0;
        targetScroll = dPoints[i] + ratio * (dPoints[i + 1] - dPoints[i]);
        found = true;
        break;
      }
    }

    if (!found) {
      if (currentScroll >= sPoints[sPoints.length - 1]) {
        targetScroll = maxDest;
      } else {
        const ratio = maxSrc > 0 ? currentScroll / maxSrc : 0;
        targetScroll = ratio * maxDest;
      }
    }

    destEl.scrollTop = Math.max(0, Math.min(maxDest, targetScroll));

    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  };

  // Wheel forwarding: when mouse is scrolled over preview, scroll left form smoothly
  const handleRightWheel = (e: React.WheelEvent) => {
    if (!isSyncScroll) return;
    const rightEl = rightScrollRef.current;
    const leftEl = leftScrollRef.current;
    if (!rightEl || !leftEl) return;
    const maxRight = rightEl.scrollHeight - rightEl.clientHeight;
    if (maxRight <= 0) {
      leftEl.scrollTop += e.deltaY;
    }
  };

  // Interactive section jump from preview to form
  const scrollToSectionInForm = (sectionId: string) => {
    const leftEl = leftScrollRef.current;
    if (!leftEl) return;
    const target = leftEl.querySelector(`[data-sync-id="${sectionId}"]`) as HTMLElement | null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSyncSection(sectionId);
    }
  };

  // Load services and leads on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [srvs, allLeads] = await Promise.all([api.getServices(), api.getAllLeads()]);
        setServices(srvs);
        setExistingLeads(allLeads);
      } catch (err) {
        console.error('Failed to fetch services or leads:', err);
      }
    };
    void fetchData();
  }, []);

  // Synchronize state when initialProposal prop changes (e.g. editing a quotation from queue)
  useEffect(() => {
    if (initialProposal) {
      setSelectedCompanyId(initialProposal.companyProfileId || DEFAULT_COMPANIES[0].id);
      setClientName(initialProposal.clientName || '');
      setClientBusiness(initialProposal.clientCompany || '');
      setClientPhone(initialProposal.clientPhone || '');
      setClientEmail(initialProposal.clientEmail || '');
      setClientAddress(initialProposal.clientAddress || initialProposal.clientCity || '');
      setQuoteNumber(initialProposal.proposalNumber || 'VDBDS00001');
      setQuoteDate(initialProposal.createdAt || new Date().toISOString().split('T')[0]);
      setQuoteValidUntil(
        initialProposal.validUntil ||
        new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
      );
      setPreparedBy(
        initialProposal.preparedBy || initialProposal.agentName || currentUser?.name || 'Krishna Chouhan'
      );
      if (initialProposal.items && initialProposal.items.length > 0) {
        setItems(initialProposal.items);
      } else if (initialProposal.scopeOfWork && initialProposal.scopeOfWork.length > 0) {
        setItems(
          initialProposal.scopeOfWork.map((s, idx) => ({
            id: `item-${Date.now()}-${idx}`,
            moduleName: idx === 0 ? (initialProposal.serviceCategory || 'Service Scope') : 'Deliverable Inclusion',
            description: s,
            qty: 1,
            rate: idx === 0 ? (initialProposal.subtotalINR || initialProposal.totalINR || 0) : 0,
            amount: idx === 0 ? (initialProposal.subtotalINR || initialProposal.totalINR || 0) : 0
          }))
        );
      } else {
        setItems([
          {
            id: `item-${Date.now()}`,
            moduleName: initialProposal.serviceCategory || 'Commercial Service',
            description: 'Scope as discussed with client',
            qty: 1,
            rate: initialProposal.subtotalINR || initialProposal.totalINR || 0,
            amount: initialProposal.subtotalINR || initialProposal.totalINR || 0
          }
        ]);
      }
      setGstSelect(initialProposal.gstRate !== undefined ? initialProposal.gstRate : 18);
      if (initialProposal.termsAndConditions && initialProposal.termsAndConditions.length > 0) {
        setTermsText(initialProposal.termsAndConditions.join('\n'));
      }
      if (initialProposal.closingNote) {
        setThanksText(initialProposal.closingNote);
      }
      if (initialProposal.managerComments) {
        setSupportInstructions(initialProposal.managerComments.replace(/^Agent Notes for Support:\s*/, ''));
      }
    }
  }, [initialProposal, currentUser?.name]);

  // Selected company profile object
  const currentCompany = useMemo(() => {
    return companies.find((c) => c.id === selectedCompanyId) || companies[0];
  }, [companies, selectedCompanyId]);

  // Handle client name/business autocomplete selection
  const handleClientNameChange = (val: string) => {
    setClientName(val);
    const matched = existingLeads.find(
      (l) => (l.contactPerson && l.contactPerson.toLowerCase() === val.toLowerCase()) ||
        (l.businessName && l.businessName.toLowerCase() === val.toLowerCase())
    );
    if (matched) {
      if (!clientBusiness && matched.businessName) setClientBusiness(matched.businessName);
      if (!clientPhone && matched.phone) setClientPhone(matched.phone);
      if (!clientEmail && matched.email) setClientEmail(matched.email);
      if (!clientAddress && (matched.fullAddress || matched.city)) {
        setClientAddress(matched.fullAddress || `${matched.city}, ${matched.state || ''}`);
      }
    }
  };

  const handleClientBusinessChange = (val: string) => {
    setClientBusiness(val);
    const matched = existingLeads.find(
      (l) => l.businessName && l.businessName.toLowerCase() === val.toLowerCase()
    );
    if (matched) {
      if (!clientName && matched.contactPerson) setClientName(matched.contactPerson);
      if (!clientPhone && matched.phone) setClientPhone(matched.phone);
      if (!clientEmail && matched.email) setClientEmail(matched.email);
      if (!clientAddress && (matched.fullAddress || matched.city)) {
        setClientAddress(matched.fullAddress || `${matched.city}, ${matched.state || ''}`);
      }
    }
  };

  // Add from Service Catalog
  const handleServiceQuickAdd = (servicePackageValue: string) => {
    if (!servicePackageValue) return;
    setServiceQuickAdd(servicePackageValue);

    const [srvId, pkgId] = servicePackageValue.split(':::');
    const srv = services.find((s) => s.id === srvId);
    if (!srv) return;

    const pkg = srv.packages.find((p) => p.id === pkgId) || srv.packages[0];
    const price = pkg?.priceINR || 12000;
    const inclusionsText = pkg?.inclusions ? pkg.inclusions.slice(0, 4).join(', ') : '';

    const newItem: QuotationLineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      moduleName: `${srv.name} - ${pkg?.name || 'Standard Package'}`,
      description: inclusionsText || srv.shortDescription || 'Professional implementation and configuration.',
      qty: 1,
      rate: price,
      amount: price
    };

    setItems((prev) => [...prev, newItem]);
    setServiceQuickAdd('');
  };

  // Add Custom Row
  const handleAddCustomRow = () => {
    const newItem: QuotationLineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      moduleName: '',
      description: '',
      qty: 1,
      rate: 0,
      amount: 0
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Update line item field
  const handleUpdateItem = (id: string, field: keyof QuotationLineItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate') {
          const qty = Number(field === 'qty' ? value : updated.qty) || 0;
          const rate = Number(field === 'rate' ? value : updated.rate) || 0;
          updated.amount = Math.round(qty * rate);
        }
        return updated;
      })
    );
  };

  // Remove line item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      setItems([{
        id: `item-${Date.now()}`,
        moduleName: '',
        description: '',
        qty: 1,
        rate: 0,
        amount: 0
      }]);
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Totals calculations (GST is not calculated into total, only displayed as +18% GST)
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [items]);

  const gstAmount = 0;

  const grandTotal = useMemo(() => {
    return subtotal;
  }, [subtotal]);

  const amountInWords = useMemo(() => {
    return numberToIndianWords(grandTotal);
  }, [grandTotal]);

  // Quick Add Company
  const handleCreateCompanyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    const newComp: CompanyProfile = {
      id: `comp-${Date.now()}`,
      name: newCompanyName.trim(),
      logoUrl: '/logo (3).png',
      address: newCompanyAddress.trim() || 'India Office',
      gstin: newCompanyGstin.trim(),
      phone: newCompanyPhone.trim() || '+91 88241 45761',
      email: newCompanyEmail.trim() || 'support@vahlaydigital.com',
      website: 'https://vahlaydigital.com',
      bankDetails: DEFAULT_COMPANIES[0].bankDetails
    };
    setCompanies((prev) => [...prev, newComp]);
    setSelectedCompanyId(newComp.id);
    setShowAddCompanyModal(false);
    setNewCompanyName('');
    setNewCompanyAddress('');
    setNewCompanyGstin('');
    setNewCompanyPhone('');
    setNewCompanyEmail('');
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Download PDF Handler (invokes standard browser print dialog set to PDF)
  const handleDownloadPdf = () => {
    window.print();
  };

  // Submit to Support Team for Recheck
  const handleSubmitToSupport = async (asDraft = false) => {
    if (isSubmittingRef.current || isSubmitting) return;

    if (!clientName.trim()) {
      setFeedbackMsg({ text: 'Please enter Client Name before submitting.', type: 'error' });
      return;
    }
    if (!clientBusiness.trim()) {
      setFeedbackMsg({ text: 'Please enter Business / Company Name.', type: 'error' });
      return;
    }
    if (items.length === 0 || !items.some((i) => i.moduleName.trim())) {
      setFeedbackMsg({ text: 'Please add at least one line item with a service/module name.', type: 'error' });
      return;
    }

    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      const parsedTerms = termsText
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);

      const scopeOfWorkList = items.map((i) => `${i.moduleName}: ${i.description || 'Included'}`);

      // Create proposal record (preserve initialProposal.id if editing existing)
      const proposalPayload: Partial<Proposal> = {
        ...initialProposal,
        id: initialProposal?.id,
        proposalNumber: quoteNumber,
        clientName: clientName.trim(),
        clientCompany: clientBusiness.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        clientAddress: clientAddress.trim(),
        clientCity: clientAddress.split(',')[0]?.trim() || initialProposal?.clientCity || 'Domestic',
        companyProfileId: selectedCompanyId,
        companyProfile: currentCompany,
        serviceCategory: items[0]?.moduleName || initialProposal?.serviceCategory || 'Digital Services',
        scopeOfWork: scopeOfWorkList,
        deliverables: items.map((i) => i.moduleName),
        timeline: initialProposal?.timeline || '7 to 10 working days',
        items: items,
        subtotalINR: subtotal,
        discountPercentage: initialProposal?.discountPercentage || 0,
        gstRate: gstSelect,
        gstAmount: gstAmount,
        totalINR: grandTotal,
        paymentMilestones: initialProposal?.paymentMilestones || [
          '50% Advance on project kickoff & scope confirmation',
          '50% Upon demo approval before live deployment'
        ],
        termsAndConditions: parsedTerms,
        closingNote: thanksText.trim(),
        preparedBy: preparedBy.trim(),
        agentId: initialProposal?.agentId || currentUser?.id || 'unknown',
        agentName: initialProposal?.agentName || 'Sales Executive',
        leadId: initialProposal?.leadId ?? '',
        approvalStatus: isSupportEdit
          ? (initialProposal?.approvalStatus || 'pending_support_dispatch')
          : (asDraft ? 'draft' : 'pending_support_dispatch'),
        managerComments: supportInstructions.trim()
          ? (isSupportEdit ? `Support Notes: ${supportInstructions.trim()}` : `Agent Notes for Support: ${supportInstructions.trim()}`)
          : initialProposal?.managerComments,
        createdAt: quoteDate,
        validUntil: quoteValidUntil
      };

      const created = await api.createProposal(proposalPayload);

      // Auto-save/update client in CRM leads table if new
      try {
        const clientExists = existingLeads.some(
          (l) => l.phone === clientPhone.trim() || l.businessName.toLowerCase() === clientBusiness.toLowerCase()
        );
        if (!clientExists && clientBusiness.trim()) {
          await api.createLead({
            businessName: clientBusiness.trim(),
            contactPerson: clientName.trim(),
            phone: clientPhone.trim() || '+91 99999 99999',
            email: clientEmail.trim(),
            fullAddress: clientAddress.trim(),
            city: clientAddress.split(',')[0]?.trim() || 'Domestic',
            industry: 'Commercial Client',
            serviceInterest: items[0]?.moduleName || 'Web & Digital Services',
            estimatedBudgetINR: grandTotal,
            quotationINR: grandTotal,
            status: 'proposal_sent',
            leadSource: 'Inbound',
            notes: `Quotation #${quoteNumber} generated by ${preparedBy}. Submitted to Support Desk for recheck.`
          });
        }
      } catch (clientErr) {
        console.warn('Note: Lead auto-save was skipped or handled:', clientErr);
      }

      setFeedbackMsg({
        text: isSupportEdit
          ? `Quotation #${quoteNumber} for "${clientBusiness}" updated successfully!`
          : asDraft
          ? `Draft saved for "${clientBusiness}" (Quotation #${quoteNumber}).`
          : `Quotation #${quoteNumber} for "${clientBusiness}" submitted to Support Team for recheck and customer dispatch!`,
        type: 'success'
      });

      if (onQuotationSubmitted) {
        onQuotationSubmitted(created);
      }

      setTimeout(() => setFeedbackMsg(null), 6000);
    } catch (err) {
      console.error('Failed to submit quotation:', err);
      setFeedbackMsg({ text: 'Failed to submit quotation. Please try again.', type: 'error' });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          role="status"
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in transition ${feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border border-rose-300 text-rose-950'
            }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-500 hover:text-slate-800 text-xs cursor-pointer font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 2-Column Layout: Right = full natural height, Left = sticky scrollable matching right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── LEFT: Form — sticky, scrolls within viewport, height driven by right column ── */}
        <div
          ref={leftScrollRef}
          onScroll={() => syncScroll('left')}
          className="lg:sticky lg:top-0 lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto space-y-4 pb-16 studio-scroll-pane pr-0.5"
        >
       

          <div className="card">
            {/* Company Profile Section */}
            <div data-sync-id="company-client" className="section-title">Company</div>
            <div className="field">
              <label htmlFor="companySelect">Company profile</label>
              <select
                id="companySelect"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                disabled={readOnly}
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: '12px', marginBottom: '6px' }}>
              <button
                className="btn btn-ghost btn-sm"
                id="quickAddCompanyBtn"
                type="button"
                onClick={() => setShowAddCompanyModal(true)}
                disabled={readOnly}
              >
                + New company
              </button>
            </div>

            {/* Client Details Section */}
            <div className="section-title">Client details</div>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--ink-soft)',
                margin: '-4px 0 12px'
              }}
            >
              Type the client's details below — they're saved automatically as a client when you save the quotation. Start typing a name to reuse a saved client.
            </p>

            <div className="grid2">
              <div className="field">
                <label htmlFor="clientName">Client name</label>
                <input
                  id="clientName"
                  list="clientNameList"
                  placeholder="Vinayak Makvana"
                  value={clientName}
                  onChange={(e) => handleClientNameChange(e.target.value)}
                  disabled={readOnly}
                />
                <datalist id="clientNameList">
                  {existingLeads.map((lead) => (
                    <option key={lead.id} value={lead.contactPerson || lead.businessName} />
                  ))}
                </datalist>
              </div>

              <div className="field">
                <label htmlFor="clientBusiness">Business name</label>
                <input
                  id="clientBusiness"
                  list="clientBusinessList"
                  placeholder="Makvana Motors"
                  value={clientBusiness}
                  onChange={(e) => handleClientBusinessChange(e.target.value)}
                  disabled={readOnly}
                />
                <datalist id="clientBusinessList">
                  {existingLeads.map((lead) => (
                    <option key={lead.id} value={lead.businessName} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid2">
              <div className="field">
                <label htmlFor="clientPhone">Phone</label>
                <input
                  id="clientPhone"
                  placeholder="+91 88241 45761"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  disabled={readOnly}
                />
              </div>

              <div className="field">
                <label htmlFor="clientEmail">Email</label>
                <input
                  id="clientEmail"
                  type="email"
                  placeholder="client@email.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="clientAddress">Client address</label>
              <textarea
                id="clientAddress"
                style={{ minHeight: '50px' }}
                placeholder="Shop No. 4, Ground Floor, Royal Complex, Ahmedabad, Gujarat"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                disabled={readOnly}
              />
            </div>

            {/* Quotation Details Section */}
            <div data-sync-id="quotation-details" className="section-title">Quotation details</div>
            <div className="grid3">
              <div className="field">
                <label htmlFor="quoteNumber">Quotation #</label>
                <input
                  id="quoteNumber"
                  type="text"
                  value={quoteNumber}
                  onChange={(e) => setQuoteNumber(e.target.value)}
                  disabled={readOnly}
                />
              </div>

              <div className="field">
                <label htmlFor="quoteDate">Date</label>
                <input
                  id="quoteDate"
                  type="date"
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                  disabled={readOnly}
                />
              </div>

              <div className="field">
                <label htmlFor="quoteValidUntil">Valid until</label>
                <input
                  id="quoteValidUntil"
                  type="date"
                  value={quoteValidUntil}
                  onChange={(e) => setQuoteValidUntil(e.target.value)}
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="preparedBy">Prepared by</label>
              <input
                id="preparedBy"
                type="text"
                placeholder="e.g. Krishna Chouhan"
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                disabled={readOnly}
              />
            </div>

            {/* Line Items Section */}
            <div data-sync-id="line-items" className="section-title">Line items</div>
            <div className="field" style={{ marginBottom: '10px' }}>
              <label htmlFor="serviceQuickAdd">Add from service catalog</label>
              <select
                id="serviceQuickAdd"
                value={serviceQuickAdd}
                onChange={(e) => handleServiceQuickAdd(e.target.value)}
                disabled={readOnly}
              >
                <option value="">Select a service to add…</option>
                {services.map((srv) => (
                  <optgroup key={srv.id} label={srv.name}>
                    {srv.packages?.map((pkg) => (
                      <option key={pkg.id} value={`${srv.id}:::${pkg.id}`}>
                        {srv.name} — {pkg.name} (₹{pkg.priceINR?.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="item-head">
              <div>Module / Service</div>
              <div>Description</div>
              <div>Qty</div>
              <div>Rate</div>
              <div>Amount</div>
              <div></div>
            </div>

            <div id="itemsWrap" className="space-y-1">
              {items.map((item) => (
                <div key={item.id} className="item-row">
                  <div>
                    <input
                      type="text"
                      placeholder="Service name"
                      value={item.moduleName}
                      onChange={(e) => handleUpdateItem(item.id, 'moduleName', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Scope & inclusions"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleUpdateItem(item.id, 'qty', e.target.value)}
                      disabled={readOnly}
                      style={{ textAlign: 'center' }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      value={item.rate}
                      onChange={(e) => handleUpdateItem(item.id, 'rate', e.target.value)}
                      disabled={readOnly}
                      style={{ textAlign: 'right', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div className="val" style={{ textAlign: 'right', fontSize: '12.5px', color: '#0f172a' }}>
                    ₹{item.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-center">
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '3px 6px', border: 'none', color: '#94a3b8' }}
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5 hover:text-rose-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!readOnly && (
              <button
                className="btn btn-ghost btn-sm"
                id="addCustomRowBtn"
                type="button"
                style={{ marginTop: '6px' }}
                onClick={handleAddCustomRow}
              >
                + Add custom row
              </button>
            )}

            {/* Totals Box */}
            <div data-sync-id="totals" className="totals-box">
              <div className="trow">
                <span>Subtotal</span>
                <span className="val" id="subtotalVal">
                  ₹ {subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="trow">
                <span style={{ fontWeight: 600 }}>GST</span>
                <select
                  id="gstSelect"
                  style={{ width: 'auto', padding: '5px 8px', fontSize: '12.5px' }}
                  value={gstSelect}
                  onChange={(e) => setGstSelect(Number(e.target.value))}
                  disabled={readOnly}
                >
                  <option value="0">No GST</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
              <div className="trow total">
                <span>Total</span>
                <span className="val" id="totalVal">
                  ₹ {grandTotal.toLocaleString('en-IN')}{' '}
                  <span
                    id="gstTagTotals"
                    className="gst-tag"
                    style={{ display: gstSelect > 0 ? 'inline-block' : 'none' }}
                  >
                    + {gstSelect}% GST
                  </span>
                </span>
              </div>
            </div>

            {/* Terms and Conditions Section */}
            <div data-sync-id="terms" className="section-title">Terms & conditions</div>
            <div className="field">
              <textarea
                id="termsText"
                style={{ minHeight: '110px' }}
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="field">
              <label htmlFor="thanksText">Closing note</label>
              <input
                id="thanksText"
                type="text"
                value={thanksText}
                onChange={(e) => setThanksText(e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Support Team Verification & Submission Actions */}
          {!readOnly && (
            <div data-sync-id="actions" className="card" style={{ padding: '16px 20px', backgroundColor: '#f8fafc' }}>
              <div
                className="section-title"
                style={{
                  marginTop: 0,
                  borderBottom: 'none',
                  paddingBottom: 0,
                  marginBottom: '8px',
                  color: '#475569'
                }}
              >
                {isSupportEdit ? 'Support Desk Verification & Save Changes' : 'Support Team Verification & Dispatch'}
              </div>
              <div className="field" style={{ marginBottom: '14px' }}>
                <label
                  htmlFor="supportInstructions"
                  style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}
                >
                  {isSupportEdit ? 'Support Notes / Audit Comments:' : 'Instructions / Notes for Support Desk (Recheck):'}
                </label>
                <input
                  id="supportInstructions"
                  type="text"
                  placeholder={
                    isSupportEdit
                      ? 'e.g. Revised pricing or deliverables updated by Support Desk.'
                      : 'e.g. Client requested PDF by 4 PM; special 5% discount confirmed verbally.'
                  }
                  value={supportInstructions}
                  onChange={(e) => setSupportInstructions(e.target.value)}
                  style={{ height: '36px', fontSize: '12px' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {onCancel && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={onCancel}
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                  )}
                  {!isSupportEdit && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => handleSubmitToSupport(true)}
                      disabled={isSubmitting}
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      {isSubmitting ? 'Saving...' : 'Save as Draft'}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  id="submitToSupportBtn"
                  className="btn btn-primary"
                  onClick={() => handleSubmitToSupport(false)}
                  disabled={isSubmitting}
                  style={{ padding: '10px 22px', fontSize: '12.5px', fontWeight: 700 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isSupportEdit ? '✓ Save Quotation Changes' : 'Submit to Support Team for Recheck'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Live Quotation Preview — full natural height, no scroll, no clip ── */}
        <div
          ref={rightScrollRef}
          onWheel={handleRightWheel}
          className="pb-16 studio-scroll-pane pl-0.5"
        >
          {/* ── Clean Formal Quotation Paper (#printArea) matching Content Naturally ── */}
          <div
            id="printArea"
            ref={previewPaperRef}
            className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-5 text-slate-800 font-sans border-t-[5px] border-t-[#0066cc]"
          >
            {/* Header: Logo, Company Info & QUOTATION */}
            <div
              data-sync-id="company-client"
              onClick={() => scrollToSectionInForm('company-client')}
              title="Click to jump to Company & Client details in form"
              className="flex justify-between items-start gap-4 cursor-pointer hover:bg-slate-50/80 p-2 -m-2 rounded-xl transition"
            >
              {/* Left: Black Logo Box & Company Details */}
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shrink-0 shadow-xs overflow-hidden p-1.5">
                  <img
                    src={
                      currentCompany.logoUrl && !currentCompany.logoUrl.includes('plane logo')
                        ? currentCompany.logoUrl
                        : '/vahlay-vd-logo.png'
                    }
                    alt={currentCompany.name || 'Vahlay Digital'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = '1';
                        target.src = '/vahlay-vd-logo.png';
                      }
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {currentCompany.name}
                  </h2>
                  <p className="text-xs text-slate-500 leading-snug mt-0.5">
                    515, Dev Aurum Commercial Complex
                  </p>
                  <p className="text-xs text-slate-500 leading-snug">
                    Prahlad Nagar
                  </p>
                  <p className="text-xs text-slate-500 leading-snug">
                    {currentCompany.phone}
                  </p>
                </div>
              </div>

              {/* Right: Large QUOTATION Title & Quote Number */}
              <div className="text-right">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0b192c] tracking-tight">
                  QUOTATION
                </h1>
                <p className="font-bold text-xs sm:text-sm text-[#0066cc] mt-0.5">
                  {quoteNumber || 'VDBDS00001'}
                </p>
              </div>
            </div>

            {/* Divider Line */}
            <div className="border-b border-slate-200" />

            {/* Middle Section: QUOTATION FOR & Dates */}
            <div
              data-sync-id="quotation-details"
              onClick={() => scrollToSectionInForm('quotation-details')}
              title="Click to jump to Quotation details in form"
              className="flex justify-between items-start gap-4 cursor-pointer hover:bg-slate-50/80 p-2 -m-2 rounded-xl transition"
            >
              {/* Left: QUOTATION FOR */}
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#0066cc] uppercase tracking-wider block">
                  QUOTATION FOR
                </span>
                {clientBusiness || clientName ? (
                  <div className="text-xs space-y-0.5 pt-1">
                    <p className="font-bold text-sm text-slate-900">
                      {clientBusiness || clientName}
                    </p>
                    {clientName && clientName !== clientBusiness && (
                      <p className="text-slate-600 font-medium">Attn: {clientName}</p>
                    )}
                    {clientAddress && (
                      <p className="text-slate-500 max-w-xs">{clientAddress}</p>
                    )}
                    {clientPhone && <p className="text-slate-500">{clientPhone}</p>}
                    {clientEmail && <p className="text-slate-500">{clientEmail}</p>}
                  </div>
                ) : (
                  <p className="text-slate-500 font-bold text-base pt-0.5">—</p>
                )}
              </div>

              {/* Right: Date, Valid until, Prepared by */}
              <div className="text-right space-y-1 text-xs">
                <p>
                  <span className="text-slate-500">Date </span>
                  <span className="font-bold text-slate-900">{quoteDate}</span>
                </p>
                <p>
                  <span className="text-slate-500">Valid until </span>
                  <span className="font-bold text-slate-900">{quoteValidUntil}</span>
                </p>
                <p>
                  <span className="text-slate-500">Prepared by </span>
                  <span className="font-bold text-slate-900">{preparedBy}</span>
                </p>
              </div>
            </div>

            {/* Line Items Table with Dark Navy Header */}
            <div
              data-sync-id="line-items"
              onClick={() => scrollToSectionInForm('line-items')}
              title="Click to jump to Line Items in form"
              className="mt-4 cursor-pointer hover:ring-2 hover:ring-cyan-500/20 rounded-xl transition"
            >
              <div className="bg-[#0b192c] text-white rounded-t-md px-4 py-2.5">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-bold uppercase tracking-wider items-center">
                  <div className="col-span-1">S.NO</div>
                  <div className="col-span-3">MODULE / SERVICE</div>
                  <div className="col-span-6">DESCRIPTION</div>
                  <div className="col-span-2 text-right">AMOUNT</div>
                </div>
              </div>

              <div className="divide-y divide-slate-200 border-x border-b border-slate-200 rounded-b-md">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-start px-4 py-3 text-xs bg-white"
                  >
                    <div className="col-span-1 font-medium text-slate-700">{idx + 1}</div>
                    <div className="col-span-3 font-semibold text-slate-900 leading-snug">
                      {item.moduleName}
                    </div>
                    <div className="col-span-6 text-slate-600 text-xs leading-relaxed">
                      {item.description || '—'}
                    </div>
                    <div className="col-span-2 text-right font-medium text-slate-900">
                      ₹ {Number(item.amount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Badge (Dark Navy Button/Pill) */}
            <div
              data-sync-id="totals"
              onClick={() => scrollToSectionInForm('totals')}
              title="Click to jump to Totals / GST in form"
              className="flex flex-col items-end pt-3 pb-2 cursor-pointer hover:bg-slate-50/80 p-2 -m-2 rounded-xl transition"
            >
              <div className="bg-[#0b192c] text-white px-6 py-2.5 rounded-lg shadow-xs flex items-center justify-between gap-4 min-w-[160px]">
                <span className="font-bold text-xs uppercase tracking-wider">TOTAL</span>
                <span className="font-black text-sm sm:text-base">
                  ₹ {grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-1.5 pr-1">
                {gstSelect > 0 ? `+ ${gstSelect}% GST` : 'No GST'}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 my-4" />

            {/* Terms & Conditions Section */}
            <div
              data-sync-id="terms"
              onClick={() => scrollToSectionInForm('terms')}
              title="Click to jump to Terms & Conditions in form"
              className="cursor-pointer hover:bg-slate-50/80 p-2 -m-2 rounded-xl transition"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b192c] mb-2">
                TERMS & CONDITIONS
              </h3>
              <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                {termsText.split('\n').filter(Boolean).map((t, idx) => (
                  <p key={idx}>{t}</p>
                ))}
              </div>
              {thanksText && (
                <div className="border-t border-dashed border-slate-300 mt-6 pt-4 text-center">
                  <p className="text-sm font-bold italic text-slate-800 tracking-wide">
                    {thanksText}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Anchor for sync */}
            <div data-sync-id="actions" className="h-1" />
          </div>
        </div>
      </div>

      {/* ── Modal: Add New Company Profile ── */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add Company Profile</h3>
              <button
                onClick={() => setShowAddCompanyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCompanyProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / Entity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vahlay Technologies LLP"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Registered Address</label>
                <textarea
                  rows={2}
                  placeholder="Address, City, State, Pincode"
                  value={newCompanyAddress}
                  onChange={(e) => setNewCompanyAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="24AAFCV1234F1Z8"
                    value={newCompanyGstin}
                    onChange={(e) => setNewCompanyGstin(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Billing Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 88241 45761"
                    value={newCompanyPhone}
                    onChange={(e) => setNewCompanyPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Billing Email</label>
                <input
                  type="email"
                  placeholder="billing@company.com"
                  value={newCompanyEmail}
                  onChange={(e) => setNewCompanyEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
