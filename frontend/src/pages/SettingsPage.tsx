import React, { useState } from 'react';
import { 
  User, Car, CreditCard, Clock, MapPin, HelpCircle, MessageSquare, 
  ChevronRight, Shield, Bell, Moon, Sun, CheckCircle2, Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SettingsPageProps {
  setActiveTab: (tab: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [selectedPaymentPref, setSelectedPaymentPref] = useState<'WALLET' | 'CARD' | 'UPI' | 'CASH'>('WALLET');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const userAvatar = (user as any)?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';
  const orgName = (user as any)?.organization?.name || 'Odoo India';

  const settingsMenuItems = [
    {
      id: 'my-trips',
      label: 'My Trips',
      description: 'View active, upcoming, and completed commutes',
      icon: Clock,
      action: () => setActiveTab('my-trips'),
      badge: 'Active Flow',
    },
    {
      id: 'vehicles',
      label: 'My Vehicle',
      description: 'Manage registered company fleet & personal vehicles',
      icon: Car,
      action: () => setActiveTab('vehicles'),
      badge: 'Fleet Reg',
    },
    {
      id: 'payment-methods',
      label: 'Payment Methods',
      description: 'Configure Wallet, Card, UPI, and Cash preferences',
      icon: CreditCard,
      action: () => setShowPaymentModal(true),
      badge: selectedPaymentPref,
    },
    {
      id: 'ride-history',
      label: 'Ride History',
      description: 'View past completed carpools & transaction receipts',
      icon: Clock,
      action: () => setActiveTab('my-trips'),
      badge: 'Past Trips',
    },
    {
      id: 'saved-places',
      label: 'Saved Places',
      description: 'Manage Home, Office, and frequent commute locations',
      icon: MapPin,
      action: () => setActiveTab('saved-places'),
      badge: '3 Saved',
    },
    {
      id: 'help-support',
      label: 'Help & Support',
      description: 'FAQs, OTP safety guidelines, and corporate contact',
      icon: HelpCircle,
      action: () => setActiveTab('help-support'),
      badge: 'FAQs',
    },
    {
      id: 'chat',
      label: 'Chat & Messaging',
      description: 'Communicate securely with ride participants',
      icon: MessageSquare,
      action: () => setActiveTab('my-trips'),
      badge: 'Secure',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Settings & Preferences</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your Odoo Commute profile, vehicles, payment options, and saved locations
        </p>
      </div>

      {/* USER PROFILE CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <img
            src={userAvatar}
            alt={user?.fullName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
          />
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{user?.fullName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-1.5">
              <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 rounded-full uppercase tracking-wider">
                {user?.role}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                {user?.department} • {orgName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SETTINGS MENU GRID */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/80">
        {settingsMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full py-4 px-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition group"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:scale-105 transition">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-extrabold rounded-lg uppercase tracking-wider">
                  {item.badge}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition" />
              </div>
            </button>
          );
        })}
      </div>

      {/* PAYMENT METHODS MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                <span>Configure Payment Methods</span>
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {[
                { id: 'WALLET', label: 'Odoo Commute Digital Wallet', desc: 'Instant deduction with zero transaction fees', icon: Wallet },
                { id: 'UPI', label: 'UPI Payment (GPay / PhonePe / Paytm)', desc: 'Instant bank transfer via VPA ID', icon: CreditCard },
                { id: 'CARD', label: 'Credit / Debit Card (Visa, MasterCard)', desc: 'Secure sandbox card checkout', icon: CreditCard },
                { id: 'CASH', label: 'Cash on Arrival', desc: 'Pay fare directly in cash to driver upon trip end', icon: CreditCard },
              ].map((opt) => {
                const OptIcon = opt.icon;
                const isSelected = selectedPaymentPref === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedPaymentPref(opt.id as any)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        <OptIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold">{opt.label}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{opt.desc}</p>
                      </div>
                    </div>

                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow transition"
            >
              Save Payment Preference
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
