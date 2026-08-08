import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, AreaChart, Area
} from 'recharts';
import { 
  Shield, Users, Car, Navigation, DollarSign, Fuel, 
  TrendingUp, Settings, CheckCircle2, Save, Calculator
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
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{kpis.averageSeatUtilization || 76.5}%</span>
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-400">Average vehicle fill rate</span>
        </div>
      </div>

      {/* DYNAMIC THEME RECHARTS VISUALIZATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: DAILY TRIP VOLUME */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Commute Activity</h3>
            <span className="text-[10px] text-slate-400 font-medium">Trips Completed / Day</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="day" stroke={textColor} fontSize={11} />
                <YAxis stroke={textColor} fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="trips" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorTrips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: SEAT UTILIZATION TREND */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Seat Utilization Rate (%)</h3>
            <span className="text-[10px] text-slate-400 font-medium">Vehicle Fill Efficiency</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="day" stroke={textColor} fontSize={11} />
                <YAxis stroke={textColor} fontSize={11} domain={[50, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '12px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="utilizationPercent" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* INDIAN FUEL PRICE CONFIGURATION FORM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Fuel className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Indian Fuel Prices & Cost Settings (₹/Unit)</h3>
          </div>
          {settingsSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Fuel Prices Updated!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleUpdateSettings} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Petrol Price (₹/Litre)</label>
              <input
                type="number"
                step="0.5"
                value={petrolPrice}
                onChange={(e) => setPetrolPrice(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Diesel Price (₹/Litre)</label>
              <input
                type="number"
                step="0.5"
                value={dieselPrice}
                onChange={(e) => setDieselPrice(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">CNG Price (₹/Kg)</label>
              <input
                type="number"
                step="0.5"
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

      {/* EMPLOYEE ROSTER TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Employee Roster ({employees.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Department</th>
                <th className="p-3">Gender</th>
                <th className="p-3">Role</th>
                <th className="p-3">Vehicles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
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
                  <td className="p-3">{emp.department || 'Engineering'}</td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{emp.gender}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      emp.role === 'ADMINISTRATOR'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-3">{emp._count?.vehicles || 0} vehicle(s)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
