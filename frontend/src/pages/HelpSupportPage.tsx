import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone, MessageSquare, ShieldCheck, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

interface HelpSupportPageProps {
  onBack?: () => void;
}

export const HelpSupportPage: React.FC<HelpSupportPageProps> = ({ onBack }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [supportMessage, setSupportMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How do I Find and Book a Carpool Ride?',
      a: 'Navigate to "Find Ride", enter your pickup location, destination, travel date, and preferred time. Browse available employee rides, check driver details and road route, and click "Book Ride" to reserve your seat.',
    },
    {
      q: 'How does Boarding OTP Verification work?',
      a: 'When your booking is confirmed, a 4-digit Boarding Verification OTP (e.g. 4829) is generated for your trip. Show this OTP to your driver before boarding to authorize the driver to initiate live trip tracking.',
    },
    {
      q: 'What payment methods are supported on Odoo Commute?',
      a: 'We support 4 payment options: Digital Wallet (instant balance deduction), Credit/Debit Card, UPI (GPay/PhonePe/PayTM), and Cash on arrival directly to the driver.',
    },
    {
      q: 'How does the Women-Only Safety Filter work?',
      a: 'Drivers can publish rides with the "🔒 WOMEN ONLY" safety flag enabled. Only verified female employees can view and book seats on these rides. Server-side validation rejects unauthorized booking requests with HTTP 403.',
    },
    {
      q: 'Are routes calculated on actual roads?',
      a: 'Yes! Odoo Commute uses the OpenStreetMap OSRM driving engine to calculate true road geometries, exact road distances, and realistic travel ETAs instead of straight lines.',
    },
    {
      q: 'How do I top-up my Odoo Commute Digital Wallet?',
      a: 'Navigate to the Wallet tab, select your preferred recharge amount (e.g., ₹500, ₹1000), choose your payment method (UPI/Card), and confirm to instantly update your wallet ledger.',
    },
  ];

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSupportMessage('');
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex items-center space-x-3">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Help & Support</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Frequently Asked Questions and Corporate Commute Support
          </p>
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-emerald-500" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-left font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CONTACT SUPPORT FORM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
          <Mail className="w-5 h-5 text-emerald-500" />
          <span>Contact Corporate Support</span>
        </h2>

        {submitted ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Thank you! Your inquiry has been submitted to Odoo Support.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmitContact} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Describe your issue or query
              </label>
              <textarea
                rows={4}
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="e.g. Need assistance with OTP verification or wallet top-up receipt..."
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition"
            >
              <Send className="w-4 h-4" />
              <span>Submit Ticket</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
