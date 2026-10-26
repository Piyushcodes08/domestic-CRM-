import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.searchGlobal(query);
        setResults(res);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any service, pricing, objection, pitch script, or lesson... (e.g., 'Static website price', 'Tally vs ERP')"
            className="w-full text-base bg-transparent border-0 outline-none text-slate-800 placeholder-slate-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">Searching approved Vahlay knowledge base...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onClose();
                    onNavigate(item.link);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100 transition-all flex items-start justify-between group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600 shrink-0 mt-0.5">
                      {item.type === 'service' ? (
                        <Sparkles className="w-4 h-4" />
                      ) : item.type === 'objection' ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2 mt-1" />
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No matching verified information found</p>
              <p className="text-xs text-slate-400 mt-1">Try keywords like 'CRM', 'static', 'objection', 'reels', or 'pricing'</p>
            </div>
          ) : (
            <div className="py-6 px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Popular Quick Searches</p>
              <div className="flex flex-wrap gap-1.5">
                {['Static Website Price', 'Tally vs ERP', 'Fake Google Reviews Policy', 'Reels Shoot Combo', 'WhatsApp CRM Integration', 'Objection: Price Too High'].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(chip)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
