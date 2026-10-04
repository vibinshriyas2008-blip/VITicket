import React from 'react';
import { Ticket, ShieldCheck, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Ticket className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              VITicket • Campus Event Ticketing & QR Check-In System
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Cryptographically Signed Passes
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-500" /> Automated HTML Email Delivery
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-center text-xs text-slate-400">
          Built for College Technical Recruitment Challenge • Production-Quality Full-Stack System
        </div>
      </div>
    </footer>
  );
};

export default Footer;
