import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { ObjectionItem } from '../../types';
import { AdminObjectionModal } from './AdminObjectionModal';

interface AdminObjectionsTabProps {
  objections: ObjectionItem[];
  onAddObjection: (data: Partial<ObjectionItem>) => Promise<void>;
  onUpdateObjection: (id: string, data: Partial<ObjectionItem>) => Promise<void>;
  onDeleteObjection: (id: string) => Promise<void>;
}

export const AdminObjectionsTab: React.FC<AdminObjectionsTabProps> = ({
  objections,
  onAddObjection,
  onUpdateObjection,
  onDeleteObjection
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingObjection, setEditingObjection] = useState<ObjectionItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const categories = [
    'All',
    'Price & Budget',
    'Competitor & Trust',
    'Need & Timing',
    'Technical & Guarantee',
    'Authority & Stall'
  ];

  const filteredObjections = useMemo(() => {
    return objections.filter((obj) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        obj.objection.toLowerCase().includes(query) ||
        obj.hinglishResponse.toLowerCase().includes(query) ||
        obj.professionalResponse.toLowerCase().includes(query) ||
        obj.whyCustomerAsks.toLowerCase().includes(query);
      const matchesCat = categoryFilter === 'All' || obj.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [objections, searchQuery, categoryFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOpenCreate = () => {
    setEditingObjection(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (obj: ObjectionItem) => {
    setEditingObjection(obj);
    setModalOpen(true);
  };

  const handleDelete = async (obj: ObjectionItem) => {
    if (!window.confirm(`Delete the objection entry "${obj.objection}" from the playbook?`)) {
      return;
    }
    try {
      await onDeleteObjection(obj.id);
      setNotice(`Objection deleted.`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete objection.');
    }
  };

  const handleCopyScript = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleModalSubmit = async (data: Partial<ObjectionItem>) => {
    if (editingObjection) {
      await onUpdateObjection(editingObjection.id, data);
      setNotice(`Objection playbook updated.`);
    } else {
      await onAddObjection(data);
      setNotice(`New objection added to playbook.`);
    }
    setTimeout(() => setNotice(null), 3000);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Price & Budget':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Competitor & Trust':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Need & Timing':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Technical & Guarantee':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Authority & Stall':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {notice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-xs text-emerald-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search objections by statement or rebuttal keywords..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-red-500 focus:bg-white"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-sm transition shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Objection Playbook Entry</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${categoryFilter === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {cat}
            {cat !== 'All' && (
              <span className="ml-1.5 opacity-60 text-[10px]">
                ({objections.filter((o) => o.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Objection Playbook List */}
      <div className="space-y-3">
        {filteredObjections.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all hover:border-slate-300"
            >
              {/* Header row */}
              <div
                onClick={() => toggleExpand(item.id)}
                className="flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none bg-white hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start gap-3.5 flex-1 pr-3">
                  <div className="p-2 rounded-xl bg-red-50 text-red-600 shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-wide ${getCategoryBadgeClass(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                      {item.whatNotToPromise && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> Guardrail set
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      "{item.objection}"
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      Quick reply: {item.shortAgentResponse || item.hinglishResponse}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(item);
                    }}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xs"
                    title="Edit entry"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item);
                    }}
                    className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="p-1 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Details Body */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-5 bg-slate-50/70 space-y-4 text-xs animate-in fade-in duration-150">
                  {/* Psychology & Discovery */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-slate-500" />
                        Root Psychology (Why Customer Asks)
                      </span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {item.whyCustomerAsks || 'Customer is price-sensitive or assessing credibility.'}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-blue-500" />
                        Discovery Counter-Question
                      </span>
                      <p className="text-xs text-slate-800 font-bold leading-relaxed">
                        {item.discoveryQuestion || 'Sir, what specific comparison are you making?'}
                      </p>
                    </div>
                  </div>

                  {/* Dual Scripts Side-by-Side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Hinglish Script */}
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                          Approved Hinglish Rebuttal
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyScript(item.hinglishResponse, item.id + '-hing')}
                          className="text-[10px] font-bold text-amber-800 hover:underline flex items-center gap-1"
                        >
                          {copiedId === item.id + '-hing' ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          Copy Script
                        </button>
                      </div>
                      <p className="text-xs text-amber-950 leading-relaxed font-serif">
                        {item.hinglishResponse}
                      </p>
                    </div>

                    {/* Professional English Script */}
                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                          Professional English Rebuttal
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyScript(item.professionalResponse, item.id + '-eng')}
                          className="text-[10px] font-bold text-blue-800 hover:underline flex items-center gap-1"
                        >
                          {copiedId === item.id + '-eng' ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          Copy Script
                        </button>
                      </div>
                      <p className="text-xs text-blue-950 leading-relaxed font-serif">
                        {item.professionalResponse}
                      </p>
                    </div>
                  </div>

                  {/* Compliance Guardrails & Escalations */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Do Not Promise
                      </span>
                      <p className="text-[11px] font-bold text-red-800">
                        {item.whatNotToPromise || 'Never guarantee overnight ranking or impossible turnaround.'}
                      </p>
                    </div>

                    <div className="sm:col-span-1 p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Next Action
                      </span>
                      <p className="text-[11px] text-slate-700 font-medium">
                        {item.suggestedNextAction || 'Schedule a scoping consultation'}
                      </p>
                    </div>

                    <div className="sm:col-span-1 p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Escalation Condition
                      </span>
                      <p className="text-[11px] text-slate-700 font-medium">
                        {item.escalationConditions || 'Escalate if custom commercial concession needed'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredObjections.length === 0 && (
          <div className="py-16 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
            <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700">No objections found</p>
            <p className="text-xs text-slate-400 mt-1">
              Adjust your search keywords or add a new objection playbook rebuttal.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 cursor-pointer"
            >
              + Add First Playbook Entry
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AdminObjectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingObjection={editingObjection}
      />
    </div>
  );
};
