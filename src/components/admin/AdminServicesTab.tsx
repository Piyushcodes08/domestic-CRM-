import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  ExternalLink,
  IndianRupee,
  Clock,
  Layers,
  Globe,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ServiceItem } from '../../types';
import { AdminServiceModal } from './AdminServiceModal';

interface AdminServicesTabProps {
  services: ServiceItem[];
  onAddService: (data: Partial<ServiceItem>) => Promise<void>;
  onUpdateService: (id: string, data: Partial<ServiceItem>) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
  onNavigate?: (path: string) => void;
}

export const AdminServicesTab: React.FC<AdminServicesTabProps> = ({
  services,
  onAddService,
  onUpdateService,
  onDeleteService,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [languageMode, setLanguageMode] = useState<'Hinglish' | 'English'>('Hinglish');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const categories = [
    'All',
    'Web Development',
    'Software Solutions',
    'Digital Marketing',
    'Content & Creative',
    'Maintenance'
  ];

  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchesSearch =
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === 'All' || srv.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [services, searchQuery, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setModalOpen(true);
  };

  const handleDelete = async (srv: ServiceItem) => {
    if (!window.confirm(`Are you sure you want to delete "${srv.name}" from the active service catalog?`)) {
      return;
    }
    try {
      await onDeleteService(srv.id);
      setNotice(`Service "${srv.name}" deleted.`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete service.');
    }
  };

  const handleModalSubmit = async (data: Partial<ServiceItem>) => {
    if (editingService) {
      await onUpdateService(editingService.id, data);
      setNotice(`Service "${data.name}" updated successfully.`);
    } else {
      await onAddService(data);
      setNotice(`Service "${data.name}" added to catalog.`);
    }
    setTimeout(() => setNotice(null), 3000);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Web Development':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Software Solutions':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Digital Marketing':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Content & Creative':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Maintenance':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
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

      {/* Action and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services by name, keywords, or slug..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Language Preview Switch */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <button
              type="button"
              onClick={() => setLanguageMode('Hinglish')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${languageMode === 'Hinglish'
                  ? 'bg-white text-blue-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Hinglish
            </button>
            <button
              type="button"
              onClick={() => setLanguageMode('English')}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${languageMode === 'English'
                  ? 'bg-white text-blue-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Add Service Button */}
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-700 shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${categoryFilter === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {cat}
            {cat !== 'All' && (
              <span className="ml-1.5 opacity-60 text-[10px]">
                ({services.filter((s) => s.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => {
          const standardPackage = service.packages[0];
          const displaySummary =
            languageMode === 'Hinglish'
              ? service.shortDescriptionHinglish || service.shortDescription
              : service.shortDescriptionEnglish || service.shortDescription;

          return (
            <div
              key={service.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                {/* Category & Price Header */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-wide ${getCategoryColor(
                      service.category
                    )}`}
                  >
                    {service.category}
                  </span>
                  <div className="flex items-center gap-1 text-slate-900 font-bold text-sm">
                    <span className="text-xs text-slate-400 font-normal">From</span>
                    <span>₹{standardPackage?.priceINR?.toLocaleString('en-IN') || 'Custom'}</span>
                  </div>
                </div>

                {/* Service Name & Slug */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{service.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">/{service.slug}</p>
                </div>

                {/* Short Description */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {displaySummary}
                </p>

                {/* Timeline & Features */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {standardPackage?.deliveryTimeline || '2-4 weeks'}
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    Hinglish + English
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate?.(`/services/${service.slug}`)}
                  className="text-xs text-slate-600 hover:text-blue-600 font-bold flex items-center gap-1"
                  title="Open catalog page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(service)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 font-bold transition text-xs"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(service)}
                    className="inline-flex items-center gap-1 p-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-bold transition text-xs"
                    title="Delete service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredServices.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
            <Briefcase className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700">No services match your criteria</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query or category filter, or add a new service.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
            >
              + Create First Service
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AdminServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingService={editingService}
      />
    </div>
  );
};
