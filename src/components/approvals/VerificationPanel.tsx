import React from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  TestTube2, 
  Globe, 
  Dna, 
  AlertTriangle,
  Info
} from 'lucide-react';
import type { VerificationCheck } from '../../data/approvalData';

interface VerificationPanelProps {
  verifications: VerificationCheck[];
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({ verifications }) => {
  const getIcon = (label: string) => {
    switch (label) {
      case 'Unit Tests':
        return <TestTube2 className="w-4 h-4 text-emerald-400" />;
      case 'Integration Tests':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Browser Tests':
        return <Globe className="w-4 h-4 text-blue-400" />;
      case 'Production Build':
        return <Cpu className="w-4 h-4 text-violet-400" />;
      case 'Mutation Score':
        return <Dna className="w-4 h-4 text-cyan-400" />;
      case 'Security Scan':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
              Verification & Automated Audit Evidence
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical quality gate metrics executed prior to human authorization.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/40 border border-amber-800/40 text-[10px] font-mono text-amber-300">
          <Info className="w-3 h-3 text-amber-400 shrink-0" />
          <span>ALL VERIFICATION METRICS SIMULATED FOR PROTOTYPE</span>
        </div>
      </div>

      {/* Verification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {verifications.map((check) => (
          <div
            key={check.id}
            className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/80 transition-colors space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                  {getIcon(check.label)}
                </div>
                <span className="text-xs font-semibold text-slate-200 font-mono">
                  {check.label}
                </span>
              </div>

              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                VERIFIED
              </span>
            </div>

            <div className="text-base font-bold font-mono text-slate-100 pl-0.5">
              {check.result}
            </div>

            <p className="text-xs text-slate-400 leading-normal pl-0.5">
              {check.detail}
            </p>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Evidence Engine</span>
              <span className="text-violet-400">Deterministic Run</span>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Summary Audit Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-xs font-mono">
        <div className="flex items-center gap-2 text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>AUTOMATED PASS:</strong> All 6 quality and security criteria passed the organization&apos;s dual-custody baseline.
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-[11px] shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Requires Human Engineering Lead Approval Signature</span>
        </div>
      </div>
    </div>
  );
};
