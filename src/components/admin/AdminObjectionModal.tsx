import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle2, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { ObjectionItem } from '../../types';

interface AdminObjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ObjectionItem>) => Promise<void>;
  editingObjection: ObjectionItem | null;
}

export const AdminObjectionModal: React.FC<AdminObjectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingObjection
}) => {
  const isEditing = Boolean(editingObjection);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [objection, setObjection] = useState('');
  const [category, setCategory] = useState<ObjectionItem['category']>('Price & Budget');
  const [whyCustomerAsks, setWhyCustomerAsks] = useState('');
  const [shortAgentResponse, setShortAgentResponse] = useState('');
  const [hinglishResponse, setHinglishResponse] = useState('');
  const [professionalResponse, setProfessionalResponse] = useState('');
  const [discoveryQuestion, setDiscoveryQuestion] = useState('');
  const [whatNotToPromise, setWhatNotToPromise] = useState('');
  const [suggestedNextAction, setSuggestedNextAction] = useState('');
  const [escalationConditions, setEscalationConditions] = useState('');

  useEffect(() => {
    if (editingObjection) {
      setObjection(editingObjection.objection || '');
      setCategory(editingObjection.category || 'Price & Budget');
      setWhyCustomerAsks(editingObjection.whyCustomerAsks || '');
      setShortAgentResponse(editingObjection.shortAgentResponse || '');
      setHinglishResponse(editingObjection.hinglishResponse || '');
      setProfessionalResponse(editingObjection.professionalResponse || '');
      setDiscoveryQuestion(editingObjection.discoveryQuestion || '');
      setWhatNotToPromise(editingObjection.whatNotToPromise || '');
      setSuggestedNextAction(editingObjection.suggestedNextAction || '');
      setEscalationConditions(editingObjection.escalationConditions || '');
    } else {
      setObjection('');
      setCategory('Price & Budget');
      setWhyCustomerAsks('');
      setShortAgentResponse('');
      setHinglishResponse('');
      setProfessionalResponse('');
      setDiscoveryQuestion('');
      setWhatNotToPromise('');
      setSuggestedNextAction('');
      setEscalationConditions('');
    }
    setError('');
  }, [editingObjection, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!objection.trim()) {
      setError('Objection question is required.');
      return;
    }
    if (!hinglishResponse.trim() || !professionalResponse.trim()) {
      setError('Both Hinglish and Professional English responses are required.');
      return;
    }

    setLoading(true);
    try {
      const payload: Partial<ObjectionItem> = {
        objection: objection.trim(),
        category,
        whyCustomerAsks: whyCustomerAsks.trim(),
        shortAgentResponse: shortAgentResponse.trim() || hinglishResponse.trim().slice(0, 100),
        hinglishResponse: hinglishResponse.trim(),
        professionalResponse: professionalResponse.trim(),
        discoveryQuestion: discoveryQuestion.trim(),
        whatNotToPromise: whatNotToPromise.trim(),
        suggestedNextAction: suggestedNextAction.trim() || 'Schedule a scoping consultation',
        escalationConditions: escalationConditions.trim() || 'Escalate if client requires custom price discount beyond 10%'
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save objection playbook entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white text-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {isEditing ? 'Edit Customer Objection Playbook' : 'Add New Objection Playbook Entry'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Ground sales agents with approved rebuttal scripts, discovery questions, and compliance limits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Customer Objection Statement *
              </label>
              <input
                type="text"
                required
                value={objection}
                onChange={(e) => setObjection(e.target.value)}
                placeholder='e.g. "Aapka price market se bahut zyada hai"'
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 outline-none text-slate-900 font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ObjectionItem['category'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 outline-none text-slate-800 font-semibold text-xs"
              >
                <option>Price & Budget</option>
                <option>Competitor & Trust</option>
                <option>Need & Timing</option>
                <option>Technical & Guarantee</option>
                <option>Authority & Stall</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Why Customer Asks (Root Psychology)
              </label>
              <input
                type="text"
                value={whyCustomerAsks}
                onChange={(e) => setWhyCustomerAsks(e.target.value)}
                placeholder="Comparing with cheap freelancers or uncertain about ROI"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 outline-none text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Discovery Counter-Question
              </label>
              <input
                type="text"
                value={discoveryQuestion}
                onChange={(e) => setDiscoveryQuestion(e.target.value)}
                placeholder="Sir, kya aap sirf lowest price dekh rahe hain ya guaranteed inquiry conversion?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 outline-none text-slate-800 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Short Quick Comeback (5-second reply)
            </label>
            <input
              type="text"
              value={shortAgentResponse}
              onChange={(e) => setShortAgentResponse(e.target.value)}
              placeholder="Bilkul samajh sakta hoon sir. Cheaper options me maintenance aur support ka risk hota hai..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 outline-none text-slate-800 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Approved Hinglish Rebuttal Script *
              </label>
              <textarea
                rows={4}
                required
                value={hinglishResponse}
                onChange={(e) => setHinglishResponse(e.target.value)}
                placeholder="Sir, local freelancer code deliver karke chale jate hain. Vahlay Digital aapko dedicated post-launch SLA aur conversion setup deta hai..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 outline-none text-slate-800 text-xs leading-relaxed font-serif"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Professional English Rebuttal Script *
              </label>
              <textarea
                rows={4}
                required
                value={professionalResponse}
                onChange={(e) => setProfessionalResponse(e.target.value)}
                placeholder="We completely understand budget considerations. However, our turnkey delivery includes end-to-end architecture, QA, and security guarantees..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 outline-none text-slate-800 text-xs leading-relaxed font-serif"
              />
            </div>
          </div>

          {/* Compliance & Red Flags */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                What NOT to Promise (Agent Safety Guardrail)
              </label>
              <input
                type="text"
                value={whatNotToPromise}
                onChange={(e) => setWhatNotToPromise(e.target.value)}
                placeholder="Never promise 100% Google #1 rank or overnight leads."
                className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-white focus:border-amber-500 outline-none text-amber-950 font-medium text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Suggested Next Action
                </label>
                <input
                  type="text"
                  value={suggestedNextAction}
                  onChange={(e) => setSuggestedNextAction(e.target.value)}
                  placeholder="Offer a 10-minute live demo or share verified case study"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-blue-500 outline-none text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Escalation Trigger
                </label>
                <input
                  type="text"
                  value={escalationConditions}
                  onChange={(e) => setEscalationConditions(e.target.value)}
                  placeholder="Escalate to Sales Manager if client requests >10% custom waiver"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-blue-500 outline-none text-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-extrabold text-xs hover:bg-red-700 shadow-md transition disabled:opacity-60 flex items-center gap-1.5"
            >
              {loading ? 'Saving...' : isEditing ? 'Save Playbook Changes' : 'Add to Playbook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
