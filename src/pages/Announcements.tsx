import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Announcement } from '../types';
import { Plus, X, Trash2, Megaphone } from 'lucide-react';

export const Announcements: React.FC = () => {
  const { currentUser, isManager, isAdmin, isSupport } = useAuth();
  const canPublish = isManager || isAdmin || isSupport;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Announcement['category']>(
    isSupport ? 'Technical Notice' : 'Product Update'
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getAnnouncements();
        setAnnouncements(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const authorName = currentUser?.name
      ? `${currentUser.name} (${currentUser.title || (isSupport ? 'Technical Support' : isManager ? 'Sales Manager' : 'Admin')})`
      : isSupport
        ? 'Technical Support Team'
        : 'Management';

    try {
      const created = await api.createAnnouncement({
        title,
        content,
        category,
        priority: 'high',
        author: authorName,
      });
      setAnnouncements([created, ...announcements]);
      setShowModal(false);
      setTitle('');
      setContent('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this announcement?')) return;
    try {
      await api.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-5 pb-12 w-full animate-in fade-in duration-150">
      {/* Top Welcome / Executive Midnight Banner */}
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

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="w-5 h-5 text-[#00BCD4]" />
              <span className="text-xs uppercase tracking-wider font-semibold text-[#00BCD4]">
                Operations & Team Broadcast
              </span>
            </div>
            <h1 className="text-2xl sm:text-[27px] font-bold tracking-tight text-white leading-tight">
              Team Announcements & Rules
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1">
              Official company policy updates, support directives, commercial alerts, and floor notices.
            </p>
          </div>

          {canPublish && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00BCD4] hover:bg-[#00acc1] text-white font-bold text-xs sm:text-sm shadow-[0_4px_14px_rgba(0,188,212,0.35)] transition-all active:scale-[0.98] cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Publish Notice</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`p-5 rounded-2xl border shadow-2xs space-y-2 transition-all ${
              ann.category === 'Important Rule'
                ? 'bg-rose-50/40 border-rose-200'
                : ann.category === 'Pricing Update'
                  ? 'bg-[#E6FAF8]/40 border-[#00BFCB]/40'
                  : ann.category === 'Technical Notice'
                    ? 'bg-sky-50/40 border-sky-200'
                    : 'bg-white border-[#E8EDF0]'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-full ${
                    ann.category === 'Important Rule'
                      ? 'bg-rose-100 text-rose-800'
                      : ann.category === 'Pricing Update'
                        ? 'bg-[#E6FAF8] text-[#007A87] border border-[#B2EBF2]'
                        : ann.category === 'Technical Notice'
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {ann.category}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{ann.date}</span>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={(e) => handleDelete(ann.id, e)}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove Notice"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <h3 className="text-sm font-bold text-[#17232B]">{ann.title}</h3>
            <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
              {ann.content}
            </p>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
              Published by: {ann.author}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#E8EDF0] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#00BCD4]" />
                <h3 className="text-sm font-bold text-[#17232B]">
                  {isSupport ? 'Broadcast Support / System Notice' : 'Publish Announcement'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-[#E8EDF0] font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00BFCB]/20 focus:border-[#00BFCB]"
                >
                  <option value="Technical Notice">Technical & System Notice</option>
                  <option value="Important Rule">Important Rule</option>
                  <option value="Product Update">Product Update</option>
                  <option value="Pricing Update">Pricing Update</option>
                  <option value="Training Notice">Training Notice</option>
                  <option value="Team Win">Team Win</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Notice Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isSupport
                      ? 'e.g. Lead queue maintenance / Server update at 7 PM...'
                      : 'e.g. Rate card update...'
                  }
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-[#E8EDF0] font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00BFCB]/20 focus:border-[#00BFCB]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Content</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Details for all sales agents and team members..."
                  className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 border border-[#E8EDF0] text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00BFCB]/20 focus:border-[#00BFCB]"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                Author attribution:{' '}
                <span className="font-semibold text-slate-700">
                  {currentUser?.name || 'Support'} (
                  {currentUser?.title || (isSupport ? 'Technical Support' : isManager ? 'Sales Manager' : 'Admin')})
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0C1215] hover:bg-[#182329] text-white font-semibold shadow-sm border border-white/10 cursor-pointer"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

