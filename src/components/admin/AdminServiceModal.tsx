import React, { useState, useEffect } from 'react';
import { X, Briefcase, IndianRupee, Layers, Globe, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { ServiceItem } from '../../types';

interface AdminServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ServiceItem>) => Promise<void>;
  editingService: ServiceItem | null;
}

export const AdminServiceModal: React.FC<AdminServiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingService
}) => {
  const isEditing = Boolean(editingService);
  const [activeTab, setActiveTab] = useState<'core' | 'hinglish' | 'english' | 'scope'>('core');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ServiceItem['category']>('Web Development');
  const [priceINR, setPriceINR] = useState(15000);
  const [deliveryTimeline, setDeliveryTimeline] = useState('2-3 weeks');

  // Hinglish Content
  const [shortDescriptionHinglish, setShortDescriptionHinglish] = useState('');
  const [definitionHinglish, setDefinitionHinglish] = useState('');
  const [howItWorksHinglish, setHowItWorksHinglish] = useState('');
  const [pitchScriptHinglish, setPitchScriptHinglish] = useState('');

  // English Content
  const [shortDescriptionEnglish, setShortDescriptionEnglish] = useState('');
  const [definitionEnglish, setDefinitionEnglish] = useState('');
  const [howItWorksEnglish, setHowItWorksEnglish] = useState('');
  const [pitchScriptEnglish, setPitchScriptEnglish] = useState('');

  // Scope & Questions
  const [businessBenefits, setBusinessBenefits] = useState('Higher lead conversion, Better brand trust, Improved sales efficiency');
  const [problemsSolved, setProblemsSolved] = useState('Low online visibility, Weak lead capture, Manual sales follow-ups');
  const [discoveryQuestions, setDiscoveryQuestions] = useState('What problem are you solving today?\nWho is your ideal client?\nWhat is your current monthly inquiry volume?');

  useEffect(() => {
    if (editingService) {
      setName(editingService.name);
      setSlug(editingService.slug);
      setCategory(editingService.category);
      setPriceINR(editingService.packages[0]?.priceINR ?? 15000);
      setDeliveryTimeline(editingService.packages[0]?.deliveryTimeline ?? '2-3 weeks');

      setShortDescriptionHinglish(editingService.shortDescriptionHinglish || editingService.shortDescription || '');
      setDefinitionHinglish(editingService.definitionHinglish || editingService.definition || '');
      setHowItWorksHinglish(editingService.howItWorksHinglish || editingService.howItWorks || '');
      setPitchScriptHinglish(editingService.pitchScript?.hinglish || '');

      setShortDescriptionEnglish(editingService.shortDescriptionEnglish || editingService.shortDescription || '');
      setDefinitionEnglish(editingService.definitionEnglish || editingService.definition || '');
      setHowItWorksEnglish(editingService.howItWorksEnglish || editingService.howItWorks || '');
      setPitchScriptEnglish(editingService.pitchScript?.english || '');

      setBusinessBenefits(editingService.businessBenefits?.join(', ') || 'Higher lead conversion, Better brand trust');
      setProblemsSolved(editingService.commonProblemsSolved?.join(', ') || 'Low online visibility, Weak lead capture');
      setDiscoveryQuestions(editingService.discoveryQuestions?.join('\n') || 'What problem are you solving today?');
    } else {
      setName('');
      setSlug('');
      setCategory('Web Development');
      setPriceINR(15000);
      setDeliveryTimeline('2-3 weeks');

      setShortDescriptionHinglish('');
      setDefinitionHinglish('');
      setHowItWorksHinglish('');
      setPitchScriptHinglish('');

      setShortDescriptionEnglish('');
      setDefinitionEnglish('');
      setHowItWorksEnglish('');
      setPitchScriptEnglish('');

      setBusinessBenefits('Higher lead conversion, Better brand trust, Improved sales efficiency');
      setProblemsSolved('Low online visibility, Weak lead capture, Manual sales follow-ups');
      setDiscoveryQuestions('What problem are you solving today?\nWho is your ideal client?');
    }
    setActiveTab('core');
    setError('');
  }, [editingService, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Service name is required.');
      setActiveTab('core');
      return;
    }

    const shortHing = shortDescriptionHinglish.trim() || shortDescriptionEnglish.trim();
    const shortEng = shortDescriptionEnglish.trim() || shortDescriptionHinglish.trim();
    const defHing = definitionHinglish.trim() || definitionEnglish.trim();
    const defEng = definitionEnglish.trim() || definitionHinglish.trim();
    const howHing = howItWorksHinglish.trim() || howItWorksEnglish.trim();
    const howEng = howItWorksEnglish.trim() || howItWorksHinglish.trim();

    if (!shortHing || !defHing || !howHing) {
      setError('Please provide at least the summary, definition, and workflow description.');
      setActiveTab('hinglish');
      return;
    }

    setLoading(true);
    try {
      const payload: Partial<ServiceItem> = {
        name: trimmedName,
        slug: slug.trim() || trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        shortDescription: shortEng || shortHing,
        shortDescriptionHinglish: shortHing,
        shortDescriptionEnglish: shortEng,
        definition: defEng || defHing,
        definitionHinglish: defHing,
        definitionEnglish: defEng,
        howItWorks: howEng || howHing,
        howItWorksHinglish: howHing,
        howItWorksEnglish: howEng,
        businessBenefits: businessBenefits.split(',').map((s) => s.trim()).filter(Boolean),
        commonProblemsSolved: problemsSolved.split(',').map((s) => s.trim()).filter(Boolean),
        targetIndustries: ['Local business', 'Service company', 'Growth startup'],
        packages: [
          {
            id: editingService?.packages[0]?.id || `pkg-${Date.now()}`,
            name: 'Standard Package',
            priceINR: Number(priceINR) || 12000,
            pricingUnit: 'one-time',
            deliveryTimeline: deliveryTimeline || '2-3 weeks',
            status: 'approved',
            inclusions: ['Complete solution delivery', 'Basic setup & training', 'Post-launch warranty'],
            exclusions: ['Ad spend / third-party platform fees', 'Custom external integrations'],
            recommendedFor: 'Growing SMBs and domestic companies',
            paymentMilestones: ['50% Upfront advance', '50% Upon client sign-off']
          }
        ],
        optionalAddons: editingService?.optionalAddons || [],
        discoveryQuestions: discoveryQuestions.split('\n').map((s) => s.trim()).filter(Boolean),
        commonObjections: editingService?.commonObjections || [
          {
            objection: 'Need to think about it',
            quickResponse: 'Let me share our exact past portfolio and expected timeline.',
            detailedResponse: 'We understand. Comparing the lost opportunity of delayed digital presence helps make an informed decision.',
            doNotPromise: 'Never promise guaranteed rankings or overnight inquiries.'
          }
        ],
        technicalLimitations: ['Requires content assets from the client', 'Timeline begins upon scope sign-off'],
        approvalRequirements: ['Leadership approval', 'Client scope confirmation'],
        faqs: editingService?.faqs || [
          { question: 'How long does this take?', answer: 'Typical turnaround is 2-4 weeks upon receiving brand assets.' }
        ],
        pitchScript: {
          hinglish:
            pitchScriptHinglish.trim() ||
            `Namaste sir, hum aapke business ke liye high-conversion digital solution build karte hain jo direct inquiries badhane me madad karega.`,
          english:
            pitchScriptEnglish.trim() ||
            `Hello sir, we build robust digital solutions designed to elevate your company brand and maximize inbound lead conversion.`,
          discoveryQuestion: discoveryQuestions.split('\n')[0] || 'What is your primary bottleneck in client acquisition?',
          closingHook: 'Shall we schedule a 15-minute scoping demonstration this Thursday?'
        },
        portfolioExamples: editingService?.portfolioExamples || [],
        lastReviewedDate: new Date().toISOString().slice(0, 10),
        contentOwner: 'Super Admin',
        approvalStatus: 'approved',
        version: '2.0'
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service.');
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
            <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {isEditing ? `Edit Service: ${editingService?.name}` : 'Create New Service Offering'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Official service details, dual-language sales pitch, and approved pricing tier
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

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 text-xs shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('core')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'core'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Core Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hinglish')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'hinglish'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span>2. Hinglish Content</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('english')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'english'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>3. English Content</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scope')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              activeTab === 'scope'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>4. Scope & Discovery</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: Core Details */}
          {activeTab === 'core' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Lead Magnet Landing Page"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="lead-magnet-landing-page"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono text-slate-600 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceItem['category'])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-xs font-semibold text-slate-800"
                  >
                    <option>Web Development</option>
                    <option>Software Solutions</option>
                    <option>Digital Marketing</option>
                    <option>Content & Creative</option>
                    <option>Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-blue-600" /> Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={priceINR}
                    onChange={(e) => setPriceINR(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Delivery Timeline
                  </label>
                  <input
                    type="text"
                    value={deliveryTimeline}
                    onChange={(e) => setDeliveryTimeline(e.target.value)}
                    placeholder="2-3 weeks"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs">
                <p className="font-bold">Domestic Inside Sales Guidance</p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Every service includes dual-language pitch scripts so reps can switch between Hinglish and English according to customer tone.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Hinglish Content */}
          {activeTab === 'hinglish' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Chhota Description / Short Summary (Hinglish)
                </label>
                <input
                  type="text"
                  value={shortDescriptionHinglish}
                  onChange={(e) => setShortDescriptionHinglish(e.target.value)}
                  placeholder="Ek line me samjhao kya fayda deta hai"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Definition / Paribhasha (Hinglish)
                </label>
                <textarea
                  rows={3}
                  value={definitionHinglish}
                  onChange={(e) => setDefinitionHinglish(e.target.value)}
                  placeholder="Yeh service kya hai aur customer ke liye kyun jaruri hai..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-800 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Kaise Kaam Karta Hai / How It Works (Hinglish)
                </label>
                <textarea
                  rows={3}
                  value={howItWorksHinglish}
                  onChange={(e) => setHowItWorksHinglish(e.target.value)}
                  placeholder="Step by step delivery process..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-800 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Approved Sales Pitch Hook (Hinglish)
                </label>
                <textarea
                  rows={2}
                  value={pitchScriptHinglish}
                  onChange={(e) => setPitchScriptHinglish(e.target.value)}
                  placeholder="Namaste sir, hum aapke business ke liye..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-800 text-xs font-serif"
                />
              </div>
            </div>
          )}

          {/* TAB 3: English Content */}
          {activeTab === 'english' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Short Description (English)
                </label>
                <input
                  type="text"
                  value={shortDescriptionEnglish}
                  onChange={(e) => setShortDescriptionEnglish(e.target.value)}
                  placeholder="Concise 1-sentence executive summary"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Service Definition (English)
                </label>
                <textarea
                  rows={3}
                  value={definitionEnglish}
                  onChange={(e) => setDefinitionEnglish(e.target.value)}
                  placeholder="Comprehensive explanation of the service value proposition..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-800 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Execution Workflow (English)
                </label>
                <textarea
                  rows={3}
                  value={howItWorksEnglish}
                  onChange={(e) => setHowItWorksEnglish(e.target.value)}
                  placeholder="Phase 1 Discovery -> Phase 2 Design -> Phase 3 Delivery..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-800 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Executive Pitch Script (English)
                </label>
                <textarea
                  rows={2}
                  value={pitchScriptEnglish}
                  onChange={(e) => setPitchScriptEnglish(e.target.value)}
                  placeholder="Hello sir, our digital solutions help mid-market brands..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-800 text-xs font-serif"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Scope & Discovery */}
          {activeTab === 'scope' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Key Business Benefits (Comma separated)
                </label>
                <input
                  type="text"
                  value={businessBenefits}
                  onChange={(e) => setBusinessBenefits(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Common Client Problems Solved (Comma separated)
                </label>
                <input
                  type="text"
                  value={problemsSolved}
                  onChange={(e) => setProblemsSolved(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Discovery Questions (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={discoveryQuestions}
                  onChange={(e) => setDiscoveryQuestions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-800 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>Section: {activeTab.toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-2">
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
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-700 shadow-md transition disabled:opacity-60 flex items-center gap-1.5"
              >
                {loading ? 'Saving Service...' : isEditing ? 'Save Changes' : 'Publish Service'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
