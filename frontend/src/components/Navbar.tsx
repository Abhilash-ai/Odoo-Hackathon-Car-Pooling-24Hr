import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BrandLogo } from './BrandLogo';
import { 
  Navigation, PlusCircle, Search, Wallet as WalletIcon, Car, Shield, 
  LogOut, Sun, Moon, Sparkles, User as UserIcon, Lock
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, quickDemoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handlePersonaSwitch = async (role: 'admin' | 'driver' | 'passenger' | 'female-driver') => {
    try {
      await quickDemoLogin(role);
      if (role === 'admin') {
        setActiveTab('admin');
      } else if (role === 'driver') {
        setActiveTab('offer');
      } else if (role === 'female-driver') {
        setActiveTab('find');
      } else if (role === 'passenger') {
        setActiveTab('find');
      }
    } catch (err) {
      console.error('Failed to switch persona tab:', err);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* BRAND LOGO */}
        <div className="cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <BrandLogo size="md" />
        </div>

        {/* NAVIGATION TABS */}
        {user && (
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('find')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'find'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find Ride</span>
            </button>

            <button
              onClick={() => setActiveTab('offer')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'offer'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Offer Ride</span>
            </button>

            <button
              onClick={() => setActiveTab('live-tracking')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'live-tracking'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Live Tracking</span>
            </button>

            <button
              onClick={() => setActiveTab('my-trips')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'my-trips'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>My Trips</span>
            </button>

            <button
              onClick={() => setActiveTab('vehicles')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'vehicles'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Vehicles</span>
            </button>

            <button
              onClick={() => setActiveTab('impact')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'impact'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Impact</span>
            </button>

            {user.role === 'ADMINISTRATOR' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Admin Hub</span>
              </button>
            )}
          </nav>
        )}

        {/* RIGHT CONTROLS: ROLE FEATURE TABS, WALLET, THEME TOGGLE */}
        <div className="flex items-center space-x-3">
          
          {/* ROLE / FEATURE TABS */}
          {user && (
            <div className="hidden lg:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 font-bold px-1.5 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Demo:</span>
              </span>
              
              <button
                onClick={() => handlePersonaSwitch('admin')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  user.role === 'ADMINISTRATOR'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                Admin
              </button>

              <button
                onClick={() => handlePersonaSwitch('driver')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  user.fullName.includes('Marcus')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                Driver
              </button>

              <button
                onClick={() => handlePersonaSwitch('female-driver')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  user.fullName.includes('Priya')
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-700 dark:text-purple-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                Women-Only
              </button>

              <button
                onClick={() => handlePersonaSwitch('passenger')}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  user.fullName.includes('Elena')
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                Passenger
              </button>
            </div>
          )}

          {/* WALLET BALANCE IN ₹ INR */}
          {user && (
            <button
              onClick={() => setActiveTab('wallet')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-100 transition"
            >
              <WalletIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>₹{user.walletBalance.toFixed(0)}</span>
            </button>
          )}

          {/* THEME TOGGLE (LIGHT / DARK) */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* LOGOUT */}
          {user && (
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
