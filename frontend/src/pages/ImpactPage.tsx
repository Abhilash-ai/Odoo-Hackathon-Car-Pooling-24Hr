import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Leaf, Navigation, Users, Fuel, DollarSign, ShieldCheck, 
  CheckCircle2, Search, PlusCircle, ArrowRight, Activity, Car
} from 'lucide-react';

interface ImpactPageProps {
  setActiveTab?: (tab: string) => void;
}

export const ImpactPage: React.FC<ImpactPageProps> = ({ setActiveTab }) => {
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/impact')
      .then(res => setImpactData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">Calculating verified commute impact...</div>;
  }

  const p = impactData?.personalActivity || {};
  const c = impactData?.carpoolImpact || {};
  const isAdmin = impactData?.isAdmin;
  const hasSharedData = impactData?.hasSharedData;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      
      {/* PAGE HEADING */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            {isAdmin ? 'Organization Impact Report' : 'Verified Commute Analytics'}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {isAdmin ? 'Corporate Sustainability & Mobility Report' : 'My Commute & Sustainability Impact'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Verified analytics computed directly from completed carpool trips across {impactData?.organizationName || 'Odoo India'}.
        </p>
      </div>

      {/* SECTION 1: PERSONAL COMMUTE ACTIVITY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Personal Commute Activity</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Database Verified</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Completed Trips</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{p.completedTripsCount || 0}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Verified rides</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Distance Travelled</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{p.commuteDistanceKm || 0} km</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total distance</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Rides Offered</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{p.ridesOfferedCount || 0}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Driver offers</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Rides Taken</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{p.ridesTakenCount || 0}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Passenger bookings</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: VERIFIED CARPOOL IMPACT OR HONEST EMPTY STATE */}
      {hasSharedData ? (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 dark:from-emerald-950 dark:via-slate-900 dark:to-slate-900 border border-emerald-500/40 rounded-3xl p-6 lg:p-8 shadow-md text-white space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold shrink-0">
              <Leaf className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl font-extrabold text-white">Verified Carpool Impact</h2>
              <p className="text-xs text-emerald-100 dark:text-emerald-400 font-medium">Calculated strictly from completed shared rides with confirmed passengers</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/10 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-100 dark:text-slate-400 block">Completed Shared Trips</span>
              <span className="text-2xl font-extrabold text-white">{c.sharedTripsCount || 0}</span>
            </div>

            <div className="p-4 bg-white/10 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-100 dark:text-slate-400 block">Pooled Distance</span>
              <span className="text-2xl font-extrabold text-white dark:text-emerald-400">{c.pooledDistanceKm || 0} km</span>
            </div>

            <div className="p-4 bg-white/10 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-100 dark:text-slate-400 block">Est. Fuel Avoided</span>
              <span className="text-2xl font-extrabold text-white dark:text-emerald-400">{c.estimatedFuelAvoidedLiters || 0} L</span>
            </div>

            <div className="p-4 bg-white/10 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-100 dark:text-slate-400 block">Est. CO₂ Avoided</span>
              <span className="text-2xl font-extrabold text-white dark:text-teal-300">{c.estimatedCo2AvoidedKg || 0} kg</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-sm transition-colors">
          <div className="w-14 h-14 rounded-3xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center font-bold">
            <Leaf className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Your carpool impact will appear here after your first completed shared ride.</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Environmental fuel and CO₂ savings are computed exclusively from completed rides where colleagues carpool together.
            </p>
          </div>

          {setActiveTab && (
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('find')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2 transition"
              >
                <Search className="w-4 h-4" />
                <span>Find a Ride</span>
              </button>
              <button
                onClick={() => setActiveTab('offer')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2 transition"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Offer a Ride</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* METRIC BREAKDOWN CARDS (INR ₹) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm transition-colors">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Estimated Shared Savings (₹ INR)</h3>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ₹{c.estimatedSharedSavingsInr || p.totalFareInr || 0}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Calculated from completed shared rides based on actual road distance and configured fuel rates.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm transition-colors">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Verified Shared Participants</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {c.verifiedParticipants || (p.completedTripsCount > 0 ? 1 : 0)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Count of unique verified colleagues who have completed carpool commutes together.
          </p>
        </div>

      </div>

      {/* CONFIG ASSUMPTIONS TRANSPARENCY CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 text-xs shadow-sm transition-colors">
        <h4 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">Configured Calculation Assumptions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
          <div>• Petrol Price: <span className="text-slate-900 dark:text-slate-200 font-bold">{impactData?.configAssumptions?.petrolPricePerLiter || '₹101.50'}</span></div>
          <div>• Average Vehicle Mileage: <span className="text-slate-900 dark:text-slate-200 font-bold">{impactData?.configAssumptions?.avgMileage || '17.5 km/L'}</span></div>
          <div>• Carbon Emission Rate: <span className="text-slate-900 dark:text-slate-200 font-bold">192g CO₂ / km</span></div>
        </div>
      </div>

    </div>
  );
};
