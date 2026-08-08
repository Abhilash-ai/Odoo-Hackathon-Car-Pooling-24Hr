import React, { useEffect, useState } from 'react';
import { BrandLogo } from './BrandLogo';

interface SplashScreenProps {
  onFinished: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const [stage, setStage] = useState<number>(0); // 0: Fade logo, 1: Route line draw, 2: Tagline, 3: Fade out

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 800);
    const t3 = setTimeout(() => setStage(3), 1400);
    const t4 = setTimeout(() => onFinished(), 1700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinished]);

  return (
    <div className={`fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-opacity duration-300 ${
      stage === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      
      <div className="flex flex-col items-center space-y-6 max-w-sm text-center">
        
        {/* LOGO FADE IN */}
        <div className={`transition-all duration-500 transform ${stage >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <BrandLogo size="xl" showText={false} className="mx-auto" />
        </div>

        {/* WORDMARK */}
        <div className={`transition-all duration-500 delay-100 ${stage >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ODOO <span className="text-emerald-600 dark:text-emerald-400">COMMUTE</span>
          </h1>
        </div>

        {/* SUBTLE ROUTE LINE ANIMATION */}
        <div className="w-48 h-8 relative flex items-center justify-center my-2">
          <svg viewBox="0 0 200 40" className="w-full h-full overflow-visible">
            {/* Origin Node */}
            <circle cx="20" cy="20" r="5" className="fill-emerald-600 dark:fill-emerald-400" />
            <circle cx="20" cy="20" r="10" className="stroke-emerald-500/30 fill-none animate-ping" />
            
            {/* Destination Node */}
            <circle cx="180" cy="20" r="5" className="fill-rose-500" />

            {/* Connecting Route Line */}
            <path
              d="M 25 20 Q 100 5, 175 20"
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeDasharray="160"
              strokeDashoffset={stage >= 1 ? 0 : 160}
              className="transition-all duration-700 ease-out"
            />
          </svg>
        </div>

        {/* TAGLINE FADE IN */}
        <div className={`transition-all duration-500 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
            "Turn empty seats into smarter commutes."
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-2">
            Enterprise Mobility • India
          </span>
        </div>

      </div>

    </div>
  );
};
