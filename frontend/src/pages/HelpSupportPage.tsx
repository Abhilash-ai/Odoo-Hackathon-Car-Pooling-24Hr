import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Phone, MessageSquare, ShieldCheck, ArrowLeft, Send, CheckCircle2, Info, Building2, MapPin, Shield, Zap, Car, Leaf } from 'lucide-react';

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
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Help & App Overview</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            About Odoo Commute, FAQs, and Corporate Support
          </p>
        </div>
      </div>

      {/* OFFICIAL ABOUT ODOO COMMUTE DESCRIPTION CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-1">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>Official Platform Description</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">ODOO COMMUTE</h2>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Enterprise Mobility & Corporate Carpooling Platform</p>
        </div>

        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          Odoo Commute is a corporate carpooling and employee mobility platform designed to help organizations make daily commuting more affordable, safer, more efficient and sustainable.
        </p>

        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          It connects employees travelling on similar routes, allowing them to find or offer rides, confirm routes, book available seats, verify boarding and manage their complete trip from booking to completion.
        </p>

        {/* CORE EXPERIENCE */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span>CORE EXPERIENCE</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Find a Ride</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Search rides using pickup, destination, date, time and seats.</p>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Offer a Ride</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Drivers publish rides using registered vehicles, seats, route, and fare per seat.</p>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Smart Route & Costing</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Uses actual road routes for distance/ETA with mileage-based fuel cost estimates.</p>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Booking & Trip Management</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Employees book seats, view trip info, verify boarding and complete trip lifecycle.</p>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Live Trip Tracking</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Active trips provide route, vehicle location and ETA with real-time updates.</p>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">Payments & Wallet</span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Supports commute-cost tracking, wallet balance, recharge, and payment flows.</p>
            </div>
          </div>
        </div>

        {/* ADMINISTRATION & ANALYTICS */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span>ADMINISTRATION & ANALYTICS</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Organizations get a centralized view of employee mobility, vehicles, rides and commute activity. Administrators can:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 pt-1">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Monitor organization-wide ride activity</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>View employee-wise commute information</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Analyse distance and travel costs</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Review fuel and sustainability metrics</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Understand carpool participation</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Monitor organization-level impact</span>
            </li>
          </ul>
        </div>

        {/* SAFETY & INDIA FIRST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 rounded-2xl space-y-2">
            <h4 className="text-xs font-extrabold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>SAFETY</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Women-Only rides provide an additional safety-focused ride option. Boarding OTP is used specifically to verify that a passenger has boarded the booked ride before the trip proceeds. Active-trip experience includes safety and SOS features.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl space-y-2">
            <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>INDIA-FIRST EXPERIENCE</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Odoo Commute is designed around Indian corporate commuting: Indian locations and routes, ₹ INR pricing, Indian fuel-cost context, mileage-based costing, and India-focused vehicle data.
            </p>
          </div>

        </div>

        {/* WHY ODOO COMMUTE */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
          <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">WHY ODOO COMMUTE?</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Instead of treating carpooling as only a ride-booking problem, Odoo Commute approaches it as an organization-wide mobility problem.
          </p>
          <div className="text-[11px] font-mono font-bold text-emerald-400 pt-1">
            EMPLOYEES + RIDES + ROUTES + VEHICLES + COST + SAFETY + LIVE TRIPS + ANALYTICS + SUSTAINABILITY
          </div>
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
