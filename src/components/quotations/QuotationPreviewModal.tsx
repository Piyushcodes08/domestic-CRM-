import React, { useState } from 'react';
import { Proposal } from '../../types';
import { DEFAULT_COMPANIES, numberToIndianWords } from './QuotationStudio';
import {
  Printer,
  Download,
  MessageCircle,
  CheckCheck,
  X,
  BadgeCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Pencil
} from 'lucide-react';

interface QuotationPreviewModalProps {
  proposal: Proposal;
  onClose: () => void;
  onDispatch?: (proposalId: string) => void;
  onEdit?: (proposal: Proposal) => void;
  isSupportView?: boolean;
}

export const getQuotationWhatsAppLink = (proposal: Proposal): string => {
  const company = proposal.companyProfile || DEFAULT_COMPANIES[0];
  const items =
    proposal.items && proposal.items.length > 0
      ? proposal.items
      : (proposal.scopeOfWork || []).map((s, idx) => ({
          id: `item-${idx}`,
          moduleName: proposal.serviceCategory || 'Service Deliverable',
          description: s,
          qty: 1,
          rate: idx === 0 ? proposal.subtotalINR : 0,
          amount: idx === 0 ? proposal.subtotalINR : 0
        }));

  const subtotal =
    proposal.subtotalINR || items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const gstRate = proposal.gstRate !== undefined ? proposal.gstRate : 18;
  const total = proposal.subtotalINR || proposal.totalINR || subtotal;

  let cleanPhone = (proposal.clientPhone || '').replace(/\D/g, '');
  while (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.slice(1);
  }
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const message = `Namaste ${proposal.clientName || "Sir/Ma'am"},

Greetings from Vahlay Digital! Here is your official commercial quotation for *${proposal.clientCompany || proposal.clientName || 'your business'}*:

📄 *Quotation No:* ${proposal.proposalNumber}
💼 *Service Scope:* ${proposal.serviceCategory || 'Digital & Web Services'}
⏱️ *Timeline:* ${proposal.timeline || '7-10 working days'}
💰 *Total Commercial Value:* ₹${Number(total).toLocaleString('en-IN')}${gstRate > 0 ? ` (+ ${gstRate}% GST)` : ''}

📌 *Inclusions Summary:*
${items.slice(0, 4).map((i) => `• *${i.moduleName}:* ${i.description || 'Included'}`).join('\n')}

💳 *Payment Milestones:*
• 50% advance on kickoff
• 50% upon demo approval before live deployment

Bank / UPI details for advance:
Bank: ${company.bankDetails?.bankName || 'HDFC Bank Ltd.'}
A/C: ${company.bankDetails?.accountNo || '50200084920194'}
IFSC: ${company.bankDetails?.ifsc || 'HDFC0001234'}
UPI ID: ${company.bankDetails?.upiId || 'vahlaydigital@hdfcbank'}

Please let us know your confirmation to initiate project onboarding.

Best Regards,
*Support & Delivery Desk*
Vahlay Digital
Website: https://vahlaydigital.com`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({
  proposal,
  onClose,
  onDispatch,
  onEdit,
  isSupportView = false
}) => {
  const [scopeVerified, setScopeVerified] = useState(true);
  const [pricingVerified, setPricingVerified] = useState(true);
  const [contactVerified, setContactVerified] = useState(true);
  const [dispatchNote, setDispatchNote] = useState('');

  const company = proposal.companyProfile || DEFAULT_COMPANIES[0];
  const items = proposal.items && proposal.items.length > 0
    ? proposal.items
    : proposal.scopeOfWork.map((s, idx) => ({
        id: `item-${idx}`,
        moduleName: proposal.serviceCategory,
        description: s,
        qty: 1,
        rate: idx === 0 ? proposal.subtotalINR : 0,
        amount: idx === 0 ? proposal.subtotalINR : 0
      }));

  const subtotal = proposal.subtotalINR || items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const gstRate = proposal.gstRate !== undefined ? proposal.gstRate : 18;
  const gstAmount = 0;
  const total = proposal.subtotalINR || proposal.totalINR || subtotal;
  const words = numberToIndianWords(total);

  const handlePrint = () => {
    window.print();
  };

  const isDispatched =
    proposal.approvalStatus === 'sent_to_client' ||
    proposal.approvalStatus === 'sent' ||
    proposal.approvalStatus === 'approved';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 my-6 flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
              {proposal.proposalNumber}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isDispatched
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isDispatched ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isDispatched ? 'Dispatched to Customer' : 'Pending Support Recheck'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && !isDispatched && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(proposal);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition shadow-2xs cursor-pointer"
                title="Edit quotation pricing, services, deliverables or client info"
              >
                <Pencil className="w-3.5 h-3.5 text-amber-700" />
                <span>✏️ Edit Quotation</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print / PDF</span>
            </button>

            {/* WhatsApp option ONLY visible in Support Interface (Agents cannot see this) */}
            {isSupportView && proposal.clientPhone && (
              <a
                href={getQuotationWhatsAppLink(proposal)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (!isDispatched && onDispatch) {
                    onDispatch(proposal.id);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                title="Send quotation via WhatsApp to customer and mark dispatched"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Support Recheck Verification Bar (Only shown in Support View when not dispatched) */}
        {isSupportView && !isDispatched && (
          <div className="p-4 bg-indigo-50/90 border-b border-indigo-200 text-xs text-indigo-950 shrink-0 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-bold text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Support Desk Quality & Commercial Recheck:</span>
              </div>
              <span className="text-[11px] text-indigo-700 font-medium">
                Verify line items, pricing compliance, and client phone before dispatch
              </span>
            </div>

            <div className="flex items-center gap-4 flex-wrap pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={scopeVerified}
                  onChange={(e) => setScopeVerified(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Scope & Deliverables Verified</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={pricingVerified}
                  onChange={(e) => setPricingVerified(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Rate & 18% GST Compliant</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={contactVerified}
                  onChange={(e) => setContactVerified(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Client Contact Verified</span>
              </label>

              {onDispatch && (
                <button
                  onClick={() => onDispatch(proposal.id)}
                  className="ml-auto inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark Rechecked & Dispatched</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Document Content */}
        <div className="p-4 sm:p-6 bg-slate-200/50">
          <div
            id="printArea"
            className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-10 space-y-5 text-slate-800 font-sans border-t-[5px] border-t-[#0066cc]"
          >
            {/* Header: Logo, Company Info & QUOTATION */}
            <div className="flex justify-between items-start gap-4">
              {/* Left: Black Logo Box & Company Details */}
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shrink-0 shadow-xs overflow-hidden p-1.5">
                  <img
                    src={
                      company.logoUrl && !company.logoUrl.includes('plane logo')
                        ? company.logoUrl
                        : '/vahlay-vd-logo.png'
                    }
                    alt={company.name || 'Vahlay Digital'}
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
                    {company.name}
                  </h2>
                  <p className="text-xs text-slate-500 leading-snug mt-0.5">
                    515, Dev Aurum Commercial Complex
                  </p>
                  <p className="text-xs text-slate-500 leading-snug">
                    Prahlad Nagar
                  </p>
                  <p className="text-xs text-slate-500 leading-snug">
                    {company.phone}
                  </p>
                </div>
              </div>

              {/* Right: Large QUOTATION Title & Quote Number */}
              <div className="text-right">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0b192c] tracking-tight">
                  QUOTATION
                </h1>
                <p className="font-bold text-xs sm:text-sm text-[#0066cc] mt-0.5">
                  {proposal.proposalNumber}
                </p>
              </div>
            </div>

            {/* Divider Line */}
            <div className="border-b border-slate-200" />

            {/* Middle Section: QUOTATION FOR & Dates */}
            <div className="flex justify-between items-start gap-4">
              {/* Left: QUOTATION FOR */}
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#0066cc] uppercase tracking-wider block">
                  QUOTATION FOR
                </span>
                {proposal.clientCompany || proposal.clientName ? (
                  <div className="text-xs space-y-0.5 pt-1">
                    <p className="font-bold text-sm text-slate-900">
                      {proposal.clientCompany || proposal.clientName}
                    </p>
                    {proposal.clientName && proposal.clientName !== proposal.clientCompany && (
                      <p className="text-slate-600 font-medium">Name: {proposal.clientName}</p>
                    )}
                    {(proposal.clientAddress || proposal.clientCity) && (
                      <p className="text-slate-500 max-w-xs">
                        {proposal.clientAddress || proposal.clientCity}
                      </p>
                    )}
                    {proposal.clientPhone && <p className="text-slate-500">{proposal.clientPhone}</p>}
                    {proposal.clientEmail && <p className="text-slate-500">{proposal.clientEmail}</p>}
                  </div>
                ) : (
                  <p className="text-slate-500 font-bold text-base pt-0.5">—</p>
                )}
              </div>

              {/* Right: Date, Valid until, Prepared by */}
              <div className="text-right space-y-1 text-xs">
                <p>
                  <span className="text-slate-500">Date </span>
                  <span className="font-bold text-slate-900">{proposal.createdAt}</span>
                </p>
                <p>
                  <span className="text-slate-500">Valid until </span>
                  <span className="font-bold text-slate-900">{proposal.validUntil}</span>
                </p>
                <p>
                  <span className="text-slate-500">Prepared by </span>
                  <span className="font-bold text-slate-900">
                    {proposal.preparedBy || proposal.agentName}
                  </span>
                </p>
              </div>
            </div>

            {/* Line Items Table with Dark Navy Header */}
            <div className="mt-4">
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
            <div className="flex flex-col items-end pt-3 pb-2">
              <div className="bg-[#0b192c] text-white px-6 py-2.5 rounded-lg shadow-xs flex items-center justify-between gap-4 min-w-[160px]">
                <span className="font-bold text-xs uppercase tracking-wider">TOTAL</span>
                <span className="font-black text-sm sm:text-base">
                  ₹ {total.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-1.5 pr-1">
                {gstRate > 0 ? `+ ${gstRate}% GST` : 'No GST'}
              </p>
            </div>

            {/* Terms & Conditions Section */}
            {(() => {
              const terms = (proposal.termsAndConditions && proposal.termsAndConditions.length > 0)
                ? proposal.termsAndConditions
                : [
                    'Payment: 30% advance due before project start; remaining 70% payable as each feature/milestone is completed and approved.',
                    "Milestones & Review: Deliverables are split by feature; you'll have 5 business days to review and sign off on each one. Without feedback, milestones are deemed accepted."
                  ];
              const closingNote = proposal.closingNote || 'Thank you for your business!';
              return (
                <div>
                  <div className="border-t border-slate-200 my-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0b192c] mb-2">
                    TERMS & CONDITIONS
                  </h3>
                  <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                    {terms.map((t, idx) => (
                      <p key={idx}>{t}</p>
                    ))}
                  </div>
                  <div className="border-t border-dashed border-slate-300 mt-6 pt-4 text-center">
                    <p className="text-sm font-bold italic text-slate-800 tracking-wide">
                      {closingNote}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
