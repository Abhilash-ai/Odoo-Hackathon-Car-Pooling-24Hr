import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Phone, RefreshCw, CheckCircle2, AlertCircle, Sparkles, X, Lock } from 'lucide-react';

interface OtpVerificationModalProps {
  identifier: string; // mobile or email
  isOpen: boolean;
  onClose: () => void;
  onVerified: (identifier: string) => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  identifier: initialIdentifier,
  isOpen,
  onClose,
  onVerified,
}) => {
  const [identifier, setIdentifier] = useState(initialIdentifier || '+91 98765 43210');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [step, setStep] = useState<'input' | 'verify'>('input');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Timers & Attempt State
  const [cooldown, setCooldown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [demoOtp, setDemoOtp] = useState<string | null>('123456');

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto focus next field
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter a valid mobile number or email');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/send-otp', { identifier: identifier.trim() });
      setDemoOtp(res.data.demoOtp || '123456');
      setCooldown(res.data.cooldownSeconds || 30);
      setStep('verify');
      setSuccess(`OTP sent to ${identifier.trim()}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length < 6) {
      setError('Please enter all 6 digits of the OTP code');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/verify-otp', {
        identifier: identifier.trim(),
        otpCode: fullCode,
      });

      setSuccess('Verification successful!');
      setTimeout(() => {
        onVerified(identifier.trim());
      }, 800);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP code');
      if (err.response?.data?.attemptsRemaining !== undefined) {
        setAttemptsRemaining(err.response.data.attemptsRemaining);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Mobile & Account OTP Verification</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DEMO MODE EXPLANATORY BANNER */}
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs space-y-1">
          <div className="flex items-center space-x-1.5 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Hackathon Gateway Demo Mode</span>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
            Enterprise demo active. Use deterministic Hackathon Test OTP: <span className="font-extrabold font-mono text-emerald-900 dark:text-white bg-emerald-200 dark:bg-emerald-800 px-1.5 py-0.5 rounded">123456</span>
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* STEP 1: MOBILE / IDENTIFIER INPUT */}
        {step === 'input' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Enter Mobile Number or Corporate Email
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white font-semibold outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition"
            >
              {loading ? 'Sending Verification Code...' : 'Send 6-Digit OTP'}
            </button>
          </form>
        ) : (
          /* STEP 2: 6-DIGIT OTP DIGIT INPUTS */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Sent to:</span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">{identifier}</p>
            </div>

            {/* DIGITS BOXES */}
            <div className="flex justify-center space-x-2 py-2">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-input-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-10 h-12 text-center text-lg font-extrabold bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl text-slate-900 dark:text-white outline-none transition"
                />
              ))}
            </div>

            {/* VERIFY BUTTON */}
            <button
              type="submit"
              disabled={loading || otpDigits.join('').length < 6}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Verifying Code...' : 'Verify OTP Code'}
            </button>

            {/* RESEND TIMER & COOLDOWN */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Attempts left: <strong className="text-slate-700 dark:text-slate-200">{attemptsRemaining}</strong></span>

              {cooldown > 0 ? (
                <span className="text-slate-400 font-medium">
                  Resend in <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{cooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-emerald-600 hover:text-emerald-500 font-bold flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend OTP</span>
                </button>
              )}
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
