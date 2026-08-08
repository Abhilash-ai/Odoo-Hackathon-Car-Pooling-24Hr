import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* ORIGINAL ODOO COMMUTE BRAND MARK */}
      <div className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 p-1.5 shadow-md flex items-center justify-center shrink-0`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Connected route path nodes */}
          <circle cx="6" cy="18" r="2.5" className="fill-emerald-300 stroke-none" />
          <circle cx="18" cy="6" r="2.5" className="fill-white stroke-none" />
          <path d="M7.5 16.5 L 16.5 7.5" strokeDasharray="1.5 1.5" strokeWidth="2" />
          <path d="M4 11 C 4 7, 9 5, 14 5" />
          <path d="M10 19 C 15 19, 20 17, 20 13" />
        </svg>
      </div>

      {showText && (
        <div className="leading-none">
          <span className={`${textSizes[size]} font-extrabold tracking-tight text-slate-900 dark:text-white`}>
            ODOO <span className="text-emerald-600 dark:text-emerald-400">COMMUTE</span>
          </span>
          <span className="block text-[9px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 mt-0.5">
            Enterprise Mobility
          </span>
        </div>
      )}
    </div>
  );
};
