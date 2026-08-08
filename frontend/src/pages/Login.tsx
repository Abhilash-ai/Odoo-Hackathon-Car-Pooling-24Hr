import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/BrandLogo';
import { OtpVerificationModal } from '../components/OtpVerificationModal';
import api from '../services/api';
import { 
  Building2, Shield, User, Key, ArrowRight, Sparkles, 
  Lock, Phone, CheckCircle2, UserPlus, LogIn 
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, quickDemoLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // LOGIN FORM
  const [email, setEmail] = useState('driver@odoo.demo');
  const [password, setPassword] = useState('password123');

  // SIGN UP FORM
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOrgCode, setRegOrgCode] = useState('ODOO-INDIA');
  const [regMobile, setRegMobile] = useState('');
  const [regGender, setRegGender] = useState('FEMALE');

  // OTP MODAL STATE
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRegisterOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regEmail || !regPassword || !regMobile) {
      setError('Please fill in all mandatory sign up fields.');
      return;
    }
    setError(null);
    setShowOtpModal(true);
  };

  const handleOtpVerified = async (verifiedMobile: string) => {
    setIsMobileVerified(true);
    setShowOtpModal(false);
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/register', {
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        organizationCode: regOrgCode,
        mobileNumber: verifiedMobile,
        gender: regGender,
      });

      localStorage.setItem('token', res.data.token);
      setSuccess('Account created and verified successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white transition-colors">
      
      {/* BRAND HEADER */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        <BrandLogo size="xl" showText={false} className="mx-auto" />
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          ODOO <span className="text-emerald-600 dark:text-emerald-400">COMMUTE</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          "Turn empty seats into smarter commutes across India."
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        
        {/* QUICK DEMO ACCELERATOR CARDS FOR JUDGES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Hackathon Demo Login</span>
            </span>
            <span className="text-[10px] text-slate-400">₹ INR Enabled</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => quickDemoLogin('admin')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition space-y-1"
            >
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Company Admin</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400">Analytics & Fuel Rates</p>
            </button>

            <button
              onClick={() => quickDemoLogin('driver')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-left transition space-y-1"
            >
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Marcus Vance</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400">Honda City (17.5 km/L)</p>
            </button>

            <button
              onClick={() => quickDemoLogin('female-driver')}
              className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 text-left transition space-y-1"
            >
              <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <p className="text-xs font-bold text-purple-950 dark:text-purple-200 leading-tight">Priya Sharma</p>
              <p className="text-[9px] text-purple-700 dark:text-purple-300 font-bold">Women-Only Driver</p>
            </button>

            <button
              onClick={() => quickDemoLogin('passenger')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-left transition space-y-1"
            >
              <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Elena Rostova</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-400">Passenger Employee</p>
            </button>
          </div>
        </div>

        {/* AUTH TABS: SIGN IN vs SIGN UP */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-extrabold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-extrabold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Sign Up (OTP)</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Corporate Email</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Odoo Commute'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* SIGN UP FORM (WITH OTP STEP) */
            <form onSubmit={handleStartRegisterOtp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="rahul.sharma@odoo.in"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Org Code</label>
                  <input
                    type="text"
                    value={regOrgCode}
                    onChange={(e) => setRegOrgCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition"
              >
                <span>Continue to OTP Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Demo Org Code: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">ODOO-INDIA</span>
            </span>
          </div>
        </div>

      </div>

      {/* OTP VERIFICATION MODAL */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        identifier={regMobile || regEmail}
        onClose={() => setShowOtpModal(false)}
        onVerified={handleOtpVerified}
      />

    </div>
  );
};
