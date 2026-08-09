import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Leaf, Navigation, Users, Fuel, DollarSign, ShieldCheck, 
  CheckCircle2, Search, PlusCircle, ArrowRight, Activity, Car,
  Award, Building2, BarChart2, ChevronRight, X, Phone, Mail
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '../context/ThemeContext';

interface ImpactPageProps {
  setActiveTab?: (tab: string) => void;
}

export const ImpactPage: React.FC<ImpactPageProps> = ({ setActiveTab }) => {
  const { theme } = useTheme();
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Employee Drill-down Modal State inside Impact Page
  const [selectedEmpDetails, setSelectedEmpDetails] = useState<any>(null);
  const [loadingEmpDetails, setLoadingEmpDetails] = useState(false);
  const [showEmpModal, setShowEmpModal] = useState(false);

  useEffect(() => {
    api.get('/reports/impact')
      .then(res => setImpactData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectEmployee = async (empId: string) => {
    setLoadingEmpDetails(true);
    setShowEmpModal(true);
    try {
      const res = await api.get(`/organization/employees/${empId}/details`);
      setSelectedEmpDetails(res.data);
    } catch (err) {
      console.error('Failed to fetch employee details:', err);
    } finally {
      setLoadingEmpDetails(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">Calculating verified commute impact...</div>;
  }

  const p = impactData?.personalActivity || {};
  const c = impactData?.carpoolImpact || {};
  const org = impactData?.organizationImpact || {};
  const isAdmin = impactData?.isAdmin;
  const hasSharedData = impactData?.hasSharedData;

  // Chart theme settings
  const gridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = theme === 'dark' ? '#0f172a' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tooltipText = theme === 'dark' ? '#f8fafc' : '#0f172a';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      
      {/* PAGE HEADING */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            {isAdmin ? 'Organization Impact Command' : 'Verified Commute Analytics'}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
          {isAdmin ? 'Corporate Sustainability & Mobility Impact' : 'My Commute & Sustainability Impact'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isAdmin 
            ? `Organization-wide impact aggregated from all completed shared trips across ${impactData?.organizationName || 'Odoo India'}.`
            : `Verified analytics computed directly from your completed carpool trips across ${impactData?.organizationName || 'Odoo India'}.`}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* ADMIN PERSONA: ORGANIZATION-WIDE IMPACT FIRST */}
      {/* ========================================================================= */}
      {isAdmin ? (
        <div className="space-y-8">
          
          {/* 1. ORGANIZATION HERO SUSTAINABILITY BANNER */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 dark:from-emerald-950 dark:via-slate-900 dark:to-slate-900 border border-emerald-500/40 rounded-3xl p-6 lg:p-8 shadow-md text-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold shrink-0">
                  <Leaf className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-xl font-extrabold text-white">Organization Commute Sustainability</h2>
                  <p className="text-xs text-emerald-100 dark:text-emerald-400 font-medium">Derived from {org.sharedTripsCount || 0} completed shared trips across all departments</p>
                </div>
              </div>
              
              <div className="bg-white/15 dark:bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center shrink-0">
                <span className="text-[10px] font-extrabold uppercase text-emerald-200 block">Commuter Participation Rate</span>
                <span className="text-xl font-extrabold text-white">{org.participationRate || 0}% ({org.verifiedParticipants}/{org.totalActiveEmployees} Staff)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/10 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-800 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-100 dark:text-slate-400 block">Completed Shared Trips</span>
                <span className="text-2xl font-extrabold text-white">{org.sharedTripsCount || 0}</span>
              </div>

              <div className="p-4 bg-white/10 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-800 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-100 dark:text-slate-400 block">Total Pooled Distance</span>
                <span className="text-2xl font-extrabold text-white dark:text-emerald-400">{org.pooledDistanceKm || 0} km</span>
              </div>

              <div className="p-4 bg-white/10 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-800 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-100 dark:text-slate-400 block">Est. Fuel Avoided</span>
                <span className="text-2xl font-extrabold text-white dark:text-emerald-400">{org.estimatedFuelAvoidedLiters || 0} L</span>
              </div>

              <div className="p-4 bg-white/10 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-800 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-100 dark:text-slate-400 block">Est. CO₂ Avoided</span>
                <span className="text-2xl font-extrabold text-white dark:text-teal-300">{org.estimatedCo2AvoidedKg || 0} kg</span>
              </div>
            </div>
          </div>

          {/* 2. DEPARTMENT PARTICIPATION & SAVINGS BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* DEPARTMENT BREAKDOWN CHART */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Department Commute Distance (km)</h3>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">Database Aggregated</span>
              </div>
              
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={org.departmentBreakdown || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis type="number" stroke={textColor} fontSize={10} tickLine={false} />
                    <YAxis dataKey="department" type="category" stroke={textColor} fontSize={10} tickLine={false} width={90} />
                    <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText, fontSize: '11px' }} />
                    <Bar dataKey="distanceKm" fill="#10b981" radius={[0, 4, 4, 0]} name="Pooled Distance (km)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ESTIMATED SHARED FINANCIAL SAVINGS CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Corporate Commute Financial Savings</h3>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Shared Fuel & Travel Cost Saved</span>
                  <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{org.estimatedSharedSavingsInr || 0}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Aggregated employee fuel savings calculated from completed shared trips based on actual road distance and configured Indian fuel prices (₹{impactData?.configAssumptions?.petrolPricePerLiter || '101.50'}/L).
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Active Commuting Staff</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{org.verifiedParticipants} / {org.totalActiveEmployees} Employees</span>
              </div>
            </div>

          </div>

          {/* 3. TOP EMPLOYEE CARPOOL CONTRIBUTORS TABLE */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Top Employee Carpool Contributors</h3>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Tap employee to view individual commute profile</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Completed Trips</th>
                    <th className="p-3">Distance Pooled</th>
                    <th className="p-3">Est. CO₂ Avoided</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {(org.topContributors || []).map((emp: any) => (
                    <tr 
                      key={emp.id} 
                      onClick={() => handleSelectEmployee(emp.id)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                        <img
                          src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={emp.fullName}
                          className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
                        />
                        <span>{emp.fullName}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-500">{emp.department}</td>
                      <td className="p-3 font-bold">{emp.tripsCount}</td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{emp.distanceKm} km</td>
                      <td className="p-3 font-bold text-teal-600 dark:text-teal-400">{emp.co2AvoidedKg} kg</td>
                      <td className="p-3 text-right">
                        <button className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] rounded-lg border border-emerald-300 dark:border-emerald-800 transition">
                          View Drilldown
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. SECONDARY: YOUR PERSONAL ADMIN ACTIVITY */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors opacity-90">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Activity className="w-5 h-5 text-slate-400" />
              <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">Your Personal Admin Commute Activity (Secondary)</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Completed Trips</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{p.completedTripsCount || 0}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Distance Travelled</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{p.commuteDistanceKm || 0} km</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Rides Offered</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{p.ridesOfferedCount || 0}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Rides Taken</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{p.ridesTakenCount || 0}</span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* EMPLOYEE PERSONA: PERSONAL ACTIVITY FIRST */
        /* ========================================================================= */
        <div className="space-y-8">
          
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

        </div>
      )}

      {/* CONFIG ASSUMPTIONS TRANSPARENCY CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 text-xs shadow-sm transition-colors">
        <h4 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">Configured Calculation Assumptions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
          <div>• Petrol Price: <span className="text-slate-900 dark:text-slate-200 font-bold">{impactData?.configAssumptions?.petrolPricePerLiter || '₹101.50'}</span></div>
          <div>• Average Vehicle Mileage: <span className="text-slate-900 dark:text-slate-200 font-bold">{impactData?.configAssumptions?.avgMileage || '17.5 km/L'}</span></div>
          <div>• Carbon Emission Rate: <span className="text-slate-900 dark:text-slate-200 font-bold">192g CO₂ / km</span></div>
        </div>
      </div>

      {/* INDIVIDUAL EMPLOYEE COMMUTE & COST DRILL-DOWN MODAL */}
      {showEmpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl transition-colors my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Employee Commute & Cost Profile</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Database-verified commute history, wallet balance, and carpool impact</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEmpModal(false)} 
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingEmpDetails || !selectedEmpDetails ? (
              <div className="p-8 text-center text-slate-500 text-xs font-semibold">Loading employee commute details...</div>
            ) : (
              <div className="space-y-6">
                
                {/* PROFILE HEADER CARD */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                  <img 
                    src={selectedEmpDetails.employee.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'} 
                    alt={selectedEmpDetails.employee.fullName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shrink-0" 
                  />
                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedEmpDetails.employee.fullName}</h4>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold rounded-full border border-emerald-300 dark:border-emerald-800 uppercase">
                        {selectedEmpDetails.employee.role}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {selectedEmpDetails.employee.department} • {selectedEmpDetails.employee.workLocation || 'Odoo Tech Campus'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="flex items-center space-x-1"><Mail className="w-3.5 h-3.5 text-slate-400" /><span>{selectedEmpDetails.employee.email}</span></span>
                      <span className="flex items-center space-x-1"><Phone className="w-3.5 h-3.5 text-slate-400" /><span>{selectedEmpDetails.employee.phone || '+91 98220 11223'}</span></span>
                    </div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 p-3 rounded-xl text-center shrink-0 min-w-[120px]">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Wallet Balance</span>
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{selectedEmpDetails.employee.walletBalance}</span>
                  </div>
                </div>

                {/* METRICS TILES */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Completed Trips</span>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedEmpDetails.summary.completedTripsCount}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Distance Travelled</span>
                    <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{selectedEmpDetails.summary.totalDistanceKm} km</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Rides Offered</span>
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedEmpDetails.summary.ridesOfferedCount}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Est. CO₂ Avoided</span>
                    <span className="text-xl font-extrabold text-teal-600 dark:text-teal-400">{selectedEmpDetails.summary.estimatedCo2AvoidedKg} kg</span>
                  </div>
                </div>

                {/* INDIVIDUAL EMPLOYEE 7-DAY ACTIVITY CHART */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Employee 7-Day Commute Distance (km)</h4>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Database Filtered</span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedEmpDetails.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="day" stroke={textColor} fontSize={10} tickLine={false} />
                        <YAxis stroke={textColor} fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText, fontSize: '11px' }} />
                        <Bar dataKey="distanceKm" fill="#10b981" radius={[4, 4, 0, 0]} name="Distance (km)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* RECENT TRIPS HISTORY TABLE */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Recent Commute Trips</h4>
                  {selectedEmpDetails.recentTrips.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No commute trip history found for this employee.</p>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <table className="w-full text-left text-[11px] text-slate-700 dark:text-slate-300">
                        <thead className="bg-slate-100 dark:bg-slate-950 text-slate-500 uppercase font-bold text-[9px]">
                          <tr>
                            <th className="p-2.5">Date</th>
                            <th className="p-2.5">Route</th>
                            <th className="p-2.5">Role</th>
                            <th className="p-2.5">Distance</th>
                            <th className="p-2.5">Fare</th>
                            <th className="p-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {selectedEmpDetails.recentTrips.map((t: any) => (
                            <tr key={t.id}>
                              <td className="p-2.5 text-slate-400">{new Date(t.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</td>
                              <td className="p-2.5 font-medium">{t.ride?.originName || 'Nagpur'} → {t.ride?.destName || 'Dharampeth'}</td>
                              <td className="p-2.5 font-bold">{t.driverId === selectedEmpDetails.employee.id ? 'Driver' : 'Passenger'}</td>
                              <td className="p-2.5 font-semibold text-emerald-600 dark:text-emerald-400">{t.distanceKm} km</td>
                              <td className="p-2.5 font-bold">₹{t.fareAmount}</td>
                              <td className="p-2.5">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                                  t.status === 'COMPLETED' || t.status === 'PAYMENT_COMPLETED'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}>
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
