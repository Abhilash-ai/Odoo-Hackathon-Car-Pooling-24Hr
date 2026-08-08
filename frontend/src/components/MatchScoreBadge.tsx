import React, { useState } from 'react';
import { MatchBreakdown } from '../types';
import { CheckCircle2, ChevronDown, Sparkles, ShieldCheck } from 'lucide-react';

interface MatchScoreBadgeProps {
  matchScore: number;
  breakdown?: MatchBreakdown;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({ matchScore, breakdown }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Color coding based on score
  let bgClass = 'bg-emerald-950 text-emerald-300 border-emerald-800';
  let badgeText = `${matchScore}% MATCH`;

  if (matchScore >= 90) {
    bgClass = 'bg-emerald-950/90 text-emerald-400 border-emerald-700/80 shadow-sm shadow-emerald-950';
  } else if (matchScore >= 75) {
    bgClass = 'bg-teal-950/90 text-teal-300 border-teal-800/80';
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
        className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-extrabold rounded-lg border transition ${bgClass}`}
        title="View explainable matching criteria"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>{badgeText}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
      </button>

      {showDetails && breakdown && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 z-40 text-xs animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-slate-200 text-xs">Matching Explanation</span>
            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 font-extrabold rounded text-[10px]">
              Deterministic Score
            </span>
          </div>

          <div className="space-y-1.5">
            {breakdown.reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-[11px] text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 italic">
            Evaluated across 5 factors: Origin, Dest, Schedule, Capacity & Organization.
          </div>
        </div>
      )}
    </div>
  );
};
