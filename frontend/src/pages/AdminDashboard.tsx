import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, AreaChart, Area
} from 'recharts';
import { 
  Shield, Users, Car, Navigation, DollarSign, Fuel, 
  TrendingUp, Settings, CheckCircle2, Save, Calculator, X,
  Activity, Leaf, Calendar, Phone, Mail, Award, Clock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [reportData, setReportData] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // India Fuel Rate Config Form State
  const [petrolPrice, setPetrolPrice] = useState(101.50);
  const [dieselPrice, setDieselPrice] = useState(92.00);
  const [cngPrice, setCngPrice] = useState(78.00);
  const [evPrice, setEvPrice] = useState(12.00);
  const [travelAllowance, setTravelAllowance] = useState(12.00);

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Employee Drill-down State
  const [selectedEmpDetails, setSelectedEmpDetails] = useState<any>(null);
  const [loadingEmpDetails, setLoadingEmpDetails] = useState(false);
  const [showEmpModal, setShowEmpModal] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [reportRes, empRes] = await Promise.all([
        api.get('/reports/admin'),
        api.get('/organization/employees')
      ]);
      setReportData(reportRes.data);
      setEmployees(empRes.data);
      if (reportRes.data.organization) {
        setPetrolPrice(reportRes.data.organization.petrolPricePerLiter || 101.50);
        setDieselPrice(reportRes.data.organization.dieselPricePerLiter || 92.00);
        setCngPrice(reportRes.data.organization.cngPricePerKg || 78.00);
        setEvPrice(reportRes.data.organization.evPricePerKwh || 12.00);
        setTravelAllowance(reportRes.data.organization.travelAllowancePerKm || 12.00);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/organization/settings', {
        petrolPricePerLiter: petrolPrice,
        dieselPricePerLiter: dieselPrice,
        cngPricePerKg: cngPrice,
        evPricePerKwh: evPrice,
        travelAllowancePerKm: travelAllowance,
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 2500);
      await fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

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
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">Loading Executive Command Center...</div>;
  }

  const kpis = reportData?.kpis || {};
  const chartData = reportData?.dailyTripsData || [];

  // Theme-aware Chart colors
  const gridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = theme === 'dark' ? '#0f172a' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tooltipText = theme === 'dark' ? '#f8fafc' : '#0f172a';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Enterprise Command Center</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage corporate mobility, fuel cost policies (₹ INR), employee participation, and analytics.</p>
        </div>

        <span className="px-3.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-extrabold w-fit shadow-sm">
          {reportData?.organization?.name || 'Odoo Global'} (INR ₹)
        </span>
      </div>

      {/* KPI TILES GRID (INR ₹) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm transition-colors">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Active Employees</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpis.activeEmployees || 0}</span>
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-400">Registered on platform</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm transition-colors">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Fleet Vehicles</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpis.totalVehicles || 0}</span>
            <Car className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-400">Registered by staff</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm transition-colors">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Distance Shared</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{kpis.totalDistanceSharedKm || 0} km</span>
            <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-400">Total shared commute km</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm transition-colors">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Seat Utilization</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{kpis.averageSeatUtilization || 82.5}%</span>
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-400">Average vehicle fill rate</span>
        </div>
      </div>

      {/* DYNAMIC THEME RECHARTS VISUALIZATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: DAILY TRIP VOLUME */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Commute Activity</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">7-Day Database Trend</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="day" stroke={textColor} fontSize={11} tickLine={false} />
                <YAxis stroke={textColor} fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontSize: '12px' }}
                />
                <Bar dataKey="trips" fill="#10b981" radius={[6, 6, 0, 0]} name="Trips Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: ESTIMATED FUEL COST SAVINGS (INR ₹) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fuel Cost Savings Trend (₹ INR)</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">Calculated in Rupees</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="day" stroke={textColor} fontSize={11} tickLine={false} />
                <YAxis stroke={textColor} fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="fuelSavedRupees" stroke="#059669" fill="#10b981" fillOpacity={0.2} name="Fuel Saved (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* POLICY & FUEL RATES FORM CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Enterprise Fuel Rates & Travel Policy (₹ INR)</h3>
          </div>
          {settingsSuccess && (
            <span className="flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Fuel settings updated!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleUpdateSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Petrol Rate (₹/L)</label>
              <input
                type="number"
                step="0.1"
                value={petrolPrice}
                onChange={(e) => setPetrolPrice(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Diesel Rate (₹/L)</label>
              <input
                type="number"
                step="0.1"
                value={dieselPrice}
                onChange={(e) => setDieselPrice(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">CNG Rate (₹/kg)</label>
              <input
                type="number"
                step="0.1"
                value={cngPrice}
                onChange={(e) => setCngPrice(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">EV Price (₹/kWh)</label>
              <input
                type="number"
                step="0.5"
                value={evPrice}
                onChange={(e) => setEvPrice(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Allowance (₹/km)</label>
              <input
                type="number"
                step="0.5"
                value={travelAllowance}
                onChange={(e) => setTravelAllowance(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>{savingSettings ? 'Updating...' : 'Save Fuel Price Configurations'}</span>
          </button>
        </form>
      </div>

      {/* EMPLOYEE ROSTER TABLE WITH CLICKABLE DRILL-DOWN */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Employee Roster ({employees.length})</h3>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Tap any employee row to view commute & cost drill-down</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Department</th>
                <th className="p-3">Gender</th>
                <th className="p-3">Role</th>
                <th className="p-3">Vehicles</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {employees.map((emp) => (
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
                    <div>
                      <p className="leading-tight">{emp.fullName}</p>
                      <p className="text-[10px] text-slate-400">{emp.email}</p>
                    </div>
                  </td>
                  <td className="p-3 font-medium">{emp.department || 'Engineering'}</td>
                  <td className="p-3 font-semibold">{emp.gender}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      emp.role === 'ADMINISTRATOR'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-3 font-bold">{emp._count?.vehicles || 0}</td>
                  <td className="p-3 text-right">
                    <button className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] rounded-lg border border-emerald-300 dark:border-emerald-800 transition">
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
