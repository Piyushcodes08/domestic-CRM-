import React from 'react';
import { Award, CheckCircle, Download, X, Shield, Sparkles } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  courseTitle: string;
  completionDate: string;
  certificateId: string;
  score: number;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  userName,
  courseTitle,
  completionDate,
  certificateId,
  score
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2 text-slate-700">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-sm">Official Vahlay Digital Enablement Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download / Print PDF
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas Area */}
        <div className="p-8 md:p-12 bg-gradient-to-b from-blue-50/40 via-white to-amber-50/30 text-center relative border-8 border-double border-slate-200 m-4 rounded-xl">
          {/* Subtle Watermark Badge */}
          <div className="absolute top-6 right-6 opacity-10 pointer-events-none">
            <Award className="w-40 h-40 text-blue-900" />
          </div>

          <div className="max-w-xl mx-auto space-y-6">
            {/* Logo & Org Title */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 text-xs font-bold tracking-widest uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Vahlay Digital Sales Academy
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
                Certificate of Enablement
              </h1>
              <p className="text-xs uppercase tracking-widest text-slate-500 mt-1">
                Internal Sales & Technical Proficiency Accreditation
              </p>
            </div>

            {/* Recipient */}
            <div className="py-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider">This is proudly awarded to</p>
              <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mt-1 border-b-2 border-blue-600/30 inline-block px-8 pb-1">
                {userName}
              </h2>
              <p className="text-xs text-slate-600 mt-2">
                for demonstrating verified excellence in customer requirement discovery, objection handling, compliant pricing discipline, and comprehensive sales readiness.
              </p>
            </div>

            {/* Course Title */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 text-left flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Accredited Program</p>
                <p className="text-sm font-bold text-slate-800">{courseTitle}</p>
                <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Readiness Benchmark Passed ({score}% Score)
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p className="font-semibold text-slate-700">Date: {completionDate}</p>
                <p className="font-mono text-[10px] text-slate-400 mt-0.5">ID: {certificateId}</p>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-6 flex items-end justify-between border-t border-slate-200">
              <div className="text-left">
                <div className="font-serif italic font-bold text-slate-800 text-lg">Girish Vahlay</div>
                <div className="h-0.5 w-24 bg-slate-400 mt-1" />
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                  Co-Founder & Head of Sales
                </p>
                <p className="text-[9px] text-slate-400">Vahlay Digital</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border-2 border-amber-500/80 bg-amber-50 flex items-center justify-center text-amber-700 shadow-inner">
                  <Shield className="w-7 h-7" />
                </div>
                <span className="text-[9px] font-bold text-amber-800 uppercase tracking-widest mt-1">VERIFIED</span>
              </div>

              <div className="text-right">
                <div className="font-serif italic font-bold text-slate-800 text-lg">Piyush Gond</div>
                <div className="h-0.5 w-24 bg-slate-400 mt-1 ml-auto" />
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                  Managing Director
                </p>
                <p className="text-[9px] text-slate-400">Vahlay Digital</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
