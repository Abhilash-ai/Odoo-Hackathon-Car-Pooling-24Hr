import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Wallet as WalletType, Transaction } from '../types';
import { 
  Wallet as WalletIcon, CreditCard, PlusCircle, ArrowDownLeft, 
  ArrowUpRight, DollarSign, CheckCircle2, ShieldCheck, X
} from 'lucide-react';

export const WalletPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [loading, setLoading] = useState(true);

  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(500);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet');
      setWallet(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await api.post('/wallet/recharge', { amount: rechargeAmount, paymentMethod });
      setSuccessMessage(`Successfully recharged ₹${rechargeAmount.toFixed(0)} to your wallet!`);
      setShowRechargeModal(false);
      await fetchWallet();
      await refreshUser();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Recharge failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">Loading Digital Wallet...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">Digital Wallet & Payments</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage your corporate commute balance, recharge via UPI / Card, and view transaction history in Indian Rupees (₹).</p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* WALLET BALANCE CARD */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 dark:from-emerald-950 dark:via-slate-900 dark:to-slate-900 border border-emerald-500/40 rounded-3xl p-6 lg:p-8 shadow-md text-white relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-bold text-emerald-100 dark:text-emerald-400 uppercase tracking-wider block">Available Balance</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mt-1">
              ₹{wallet?.balance.toFixed(0) || '0'}
            </h2>
            <p className="text-xs text-emerald-100 dark:text-slate-400 mt-1">Accepted for all enterprise commute fares across India</p>
          </div>

          <button
            onClick={() => setShowRechargeModal(true)}
            className="py-3.5 px-6 bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Recharge Wallet</span>
          </button>
        </div>
      </div>

      {/* RECHARGE MODAL */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRecharge} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <WalletIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Recharge Internal Wallet (₹ INR)</span>
              </h3>
              <button type="button" onClick={() => setShowRechargeModal(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select Top-Up Amount</label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 2000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRechargeAmount(amt)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      rechargeAmount === amt
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              >
                <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="CARD">Corporate Credit / Debit Card</option>
                <option value="ALLOWANCE">Corporate Travel Allowance</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition"
            >
              {processing ? 'Processing Recharge...' : `Confirm ₹${rechargeAmount} Top-Up`}
            </button>
          </form>
        </div>
      )}

      {/* TRANSACTION HISTORY LEDGER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Transaction Ledger</span>
          </h3>
          <span className="text-[10px] text-slate-400">Verified Internal Audit Log</span>
        </div>

        {wallet?.transactions.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No transactions recorded yet</p>
        ) : (
          <div className="space-y-2.5">
            {wallet?.transactions.map((tx) => {
              const isCredit = tx.type === 'CREDIT';
              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isCredit
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-slate-200">{tx.description}</p>
                      <p className="text-[10px] text-slate-400">
                        Ref: <span className="font-mono text-slate-600 dark:text-slate-300">{tx.referenceId}</span> • Method: {tx.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-extrabold text-sm ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'}`}>
                      {isCredit ? '+' : '-'}₹{tx.amount.toFixed(0)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
