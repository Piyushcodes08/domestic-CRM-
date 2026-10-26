import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  HelpCircle,
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface QuizCenterProps {
  onNavigate: (path: string) => void;
}

export const QuizCenter: React.FC<QuizCenterProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const attempts = currentUser.completedQuizzes || [];
  const passedCount = attempts.filter(a => a.passed).length;

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

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl sm:text-[27px] font-bold tracking-tight text-white leading-tight">
              Examination &amp; Quiz Assessment Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1">
              Sales readiness benchmark testing, product certification drills, and qualification logs.
            </p>
          </div>

          <div className="text-right shrink-0 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 shadow-lg text-white">
            <span className="text-3xl font-bold text-[#00BCD4] tracking-tight">{currentUser.readinessScore}%</span>
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mt-0.5">Verified Readiness Score</p>
          </div>
        </div>
      </div>

      {/* 3 Overview KPI Cards (Dashboard Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400">Attempts</span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quizzes Attempted</span>
            <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{attempts.length}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
              80%+ Threshold
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Passed Benchmarks</span>
            <p className="text-3xl font-bold text-emerald-600 mt-1 tracking-tight">{passedCount}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentUser.readinessScore >= 80 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400">Status</span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Floor Clearance</span>
            <p className={`text-sm font-bold mt-1.5 uppercase ${currentUser.readinessScore >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {currentUser.readinessScore >= 80 ? '✓ Ready for Calling Floor' : '⚠ Retake Recommended'}
            </p>
          </div>
        </div>
      </div>

      {/* Quiz History List */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Completed Assessments History</h2>

        <div className="space-y-2">
          {attempts.map((att, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-800">{att.quizId.toUpperCase()}</span>
                <p className="text-[11px] text-slate-400">Date: {att.date}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className={`text-base font-bold ${att.passed ? 'text-emerald-700' : 'text-red-700'}`}>
                    {att.score}%
                  </span>
                  <span className={`text-[10px] block font-bold uppercase ${att.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                    {att.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>

                <button
                  onClick={() => onNavigate('/academy')}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                  title="Review lesson"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {attempts.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No quizzes attempted yet. Start with Day 1 in the Academy!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
