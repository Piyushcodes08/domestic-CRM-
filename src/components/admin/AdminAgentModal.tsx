import React, { useState, useEffect } from 'react';
import {
  X, UserPlus, KeyRound, Mail, User, Briefcase,
  ShieldCheck, AlertCircle, Shield, Users2, Wrench, Pencil, TrendingUp
} from 'lucide-react';
import { User as AppUser, UserRole } from '../../types';

type CreatableRole = 'sales_agent' | 'technical_support';

interface AdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCreate: (data: {
    name: string;
    email: string;
    password: string;
    role: CreatableRole;
    title?: string;
    department?: string;
    assignedTargetRevenueINR?: number;
  }) => Promise<void>;
  onSubmitEdit: (agentId: string, updates: Partial<Pick<AppUser, 'name' | 'title' | 'department' | 'assignedTargetRevenueINR'>>) => Promise<void>;
  editingAgent: AppUser | null;
}

const ROLE_OPTIONS: { value: CreatableRole; label: string; badge: string; badgeColor: string; icon: React.ElementType; desc: string }[] = [
  {
    value: 'sales_agent',
    label: 'Sales Agent',
    badge: 'Agent',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Users2,
    desc: 'Handles leads, proposals, cold calls, and uses training tools'
  },
  {
    value: 'technical_support',
    label: 'Technical Support',
    badge: 'Support',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: Wrench,
    desc: 'Handles escalation tickets and technical feasibility queries'
  }
];

const DEFAULT_TITLES: Record<CreatableRole, string> = {
  sales_agent: 'Sales Agent',
  technical_support: 'Technical Support Engineer'
};

const DEFAULT_DEPTS: Record<CreatableRole, string> = {
  sales_agent: 'Domestic Inside Sales',
  technical_support: 'Technical Operations'
};

export const AdminAgentModal: React.FC<AdminUserModalProps> = ({
  isOpen,
  onClose,
  onSubmitCreate,
  onSubmitEdit,
  editingAgent
}) => {
  const isEditing = Boolean(editingAgent);
  const [role, setRole] = useState<CreatableRole>('sales_agent');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState(DEFAULT_TITLES.sales_agent);
  const [department, setDepartment] = useState(DEFAULT_DEPTS.sales_agent);
  const [assignedTargetRevenueINR, setAssignedTargetRevenueINR] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingAgent) {
      setName(editingAgent.name || '');
      setEmail(editingAgent.email || '');
      const editRole = editingAgent.role === 'technical_support' ? 'technical_support' : 'sales_agent';
      setRole(editRole);
      setTitle(editingAgent.title || DEFAULT_TITLES[editRole]);
      setDepartment(editingAgent.department || DEFAULT_DEPTS[editRole]);
      setAssignedTargetRevenueINR(editingAgent.assignedTargetRevenueINR || 0);
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('sales_agent');
      setTitle(DEFAULT_TITLES.sales_agent);
      setDepartment(DEFAULT_DEPTS.sales_agent);
      setAssignedTargetRevenueINR(0);
    }
    setError('');
  }, [editingAgent, isOpen]);

  // Auto-fill title/dept when role changes (only in create mode)
  const handleRoleChange = (newRole: CreatableRole) => {
    setRole(newRole);
    if (!isEditing) {
      setTitle(DEFAULT_TITLES[newRole]);
      setDepartment(DEFAULT_DEPTS[newRole]);
      setAssignedTargetRevenueINR(0);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Full name is required.'); return; }
    if (!isEditing) {
      if (!email.trim()) { setError('Email address is required.'); return; }
      if (!password || password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    }

    setLoading(true);
    try {
      if (isEditing && editingAgent) {
        await onSubmitEdit(editingAgent.id, {
          name: name.trim(),
          title: title.trim(),
          department: department.trim(),
          assignedTargetRevenueINR
        });
      } else {
        await onSubmitCreate({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          title: title.trim(),
          department: department.trim(),
          assignedTargetRevenueINR
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    setPassword(res);
  };

  const selectedRole = ROLE_OPTIONS.find(r => r.value === role)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white text-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
              {isEditing ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {isEditing ? `Edit — ${editingAgent?.name}` : 'Create New Team Member'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {isEditing
                  ? `Updating profile for ${editingAgent?.role?.replace('_', ' ')}`
                  : 'SuperAdmin: creates Firebase Auth + Firestore account'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Role Selector (create only) ── */}
          {!isEditing && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" /> System Role *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {ROLE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleRoleChange(opt.value)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all ${isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        }`}
                    >
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">{opt.label}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${opt.badgeColor}`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Basic Info ── */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" /> Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rohan Sharma"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-xs text-slate-800 font-medium"
            />
          </div>

          {/* ── Email + Password ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Email *
              </label>
              <input
                type="email"
                required
                disabled={isEditing}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@vahlaydigital.com"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${isEditing
                    ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 text-slate-800 font-medium'
                  }`}
              />
            </div>

            {!isEditing && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" /> Password *
                  </label>
                  <button type="button" onClick={generateRandomPassword} className="text-[10px] text-blue-600 font-bold hover:underline">
                    Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-xs text-slate-800 font-mono"
                />
              </div>
            )}
          </div>

          {/* ── Title + Department ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Job Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Inside Sales Executive"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-xs text-slate-800"
              >
                <option>Domestic Inside Sales</option>
                <option>Enterprise Outbound</option>
                <option>Key Account Management</option>
                <option>Sales Management</option>
                <option>Technical Operations</option>
                <option>Administration</option>
              </select>
            </div>
          </div>

          {/* ── Monthly Revenue Target (agents only) ── */}
          {(role === 'sales_agent' || (isEditing && editingAgent?.role === 'sales_agent')) && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Monthly Revenue Target (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={assignedTargetRevenueINR}
                  onChange={e => setAssignedTargetRevenueINR(Number(e.target.value) || 0)}
                  placeholder="e.g. 100000"
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-xs text-slate-800 font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {assignedTargetRevenueINR > 0
                  ? `Target: ₹${assignedTargetRevenueINR >= 100000 ? (assignedTargetRevenueINR / 100000).toFixed(1) + 'L' : Math.round(assignedTargetRevenueINR / 1000) + 'k'} this month`
                  : 'Enter 0 to set no revenue target for this agent'}
              </p>
            </div>
          )}

          {/* Security Notice */}
          {!isEditing && (
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Firebase Auth creates a secure password hash. Passwords are never stored in plaintext.
                The user can login immediately after creation.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
            {!isEditing && selectedRole && (
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border ${selectedRole.badgeColor}`}>
                Creating {selectedRole.badge}
              </span>
            )}
            <div className="flex items-center gap-2.5 ml-auto">
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
                {loading ? 'Processing...' : isEditing ? 'Save Changes' : `Create ${selectedRole?.label ?? 'Account'}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
