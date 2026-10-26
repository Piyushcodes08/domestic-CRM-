import React from 'react';

export type AdminTab =
  | 'overview'
  | 'tasks'
  | 'agents'
  | 'all_leads'
  | 'all_quotations'
  | 'all_followups'
  | 'all_deals'
  | 'services'
  | 'settings'
  | 'audit'
  | 'master_data';

interface AdminHeaderProps {
  activeTab: AdminTab;
}

const tabHeadings: Record<AdminTab, { title: string; description: string }> = {
  overview: {
    title: 'Admin workspace',
    description: 'A clear overview of your team, services, and business activity.',
  },
  tasks: {
    title: 'Department tasks',
    description: 'Assign and track delivery work across Digital and Developer teams.',
  },
  agents: {
    title: 'Team directory',
    description: 'Manage team access and staff profiles.',
  },
  all_leads: {
    title: 'All Agents Leads',
    description: 'Review, manage stages, and track customer leads across all sales agents.',
  },
  all_quotations: {
    title: 'All Agents Quotation Request',
    description: 'Review commercial proposals, approve or override discounts, and track quotation dispatches.',
  },
  all_followups: {
    title: 'All Agents Follow-up',
    description: 'Track and oversee follow-up discipline, scheduled callbacks, and overdue actions.',
  },
  all_deals: {
    title: 'All Agents Deals',
    description: 'Track closed revenue, won client contracts, and deal conversion across all sales agents.',
  },
  services: {
    title: 'Service catalog',
    description: 'Manage the services and pricing available to your team.',
  },
  master_data: {
    title: 'All Agents Leads',
    description: 'Review customer leads and quotation records.',
  },
  settings: {
    title: 'Workspace settings',
    description: 'Configure shared CRM defaults.',
  },
  audit: {
    title: 'Activity history',
    description: 'Review important administrative changes.',
  },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({ activeTab }) => (
  <div className="rounded-2xl bg-gradient-to-r from-[#041622] via-[#072435] to-[#0A3D52] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.18)] relative overflow-hidden text-white border border-[#103448]">
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
      <svg className="absolute bottom-0 right-0 w-[600px] h-[180px] text-teal-800/20" viewBox="0 0 600 180" fill="none" preserveAspectRatio="none">
        <path d="M0 180 L120 70 L240 130 L380 40 L490 110 L600 20 L600 180 Z" fill="currentColor" />
        <path d="M60 180 L180 90 L300 145 L420 75 L520 125 L600 60 L600 180 Z" fill="currentColor" opacity="0.5" />
      </svg>
      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#00D4DD]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-72 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
    </div>
    <div className="relative z-10">
      <h1 className="text-2xl sm:text-[27px] font-bold tracking-tight text-white leading-tight">
        {tabHeadings[activeTab].title}
      </h1>
      <p className="mt-1 text-xs font-normal text-slate-300 sm:text-sm">
        {tabHeadings[activeTab].description}
      </p>
    </div>
  </div>
);
