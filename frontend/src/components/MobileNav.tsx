import React from 'react';
import { LayoutDashboard, Search, Clock, Wallet, Navigation } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'find', label: 'Find', icon: Search },
    { id: 'live-tracking', label: 'Live', icon: Navigation, badge: true },
    { id: 'my-trips', label: 'Trips', icon: Clock },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 z-40 shadow-lg transition-colors">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                )}
              </div>
              <span className="text-[10px] font-semibold mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
