import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Download,
  ArrowRight,
  Ticket,
  Mail,
  ShieldCheck,
  Printer,
} from 'lucide-react';

const RegistrationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { registration, event } = location.state || {};

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#38bdf8', '#10b981', '#f59e0b'],
      });
    } catch (e) {
      // Ignore if canvas-confetti fails
    }
  }, []);

  if (!registration) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Ticket className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">No Active Registration Found</h2>
        <p className="text-slate-500 mt-2">
          You may view your registered events directly from your tickets dashboard.
        </p>
        <Link
          to="/my-tickets"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm"
        >
          Go to My Tickets
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    if (!registration.qrCode) return;
    const link = document.createElement('a');
    link.href = registration.qrCode;
    link.download = `VITicket-${registration.ticketId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 mb-2">
          REGISTRATION CONFIRMED
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          You're Going to {registration.event?.name || event?.name}!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto">
          Your seat has been reserved and your cryptographically signed QR pass has been issued.
        </p>
      </div>

      {/* Ticket Pass Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden print:shadow-none print:border-slate-400">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                Official Campus Digital Ticket
              </span>
              <h2 className="text-2xl font-black tracking-tight mt-0.5">
                {registration.event?.name || event?.name}
              </h2>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20">
              <div className="text-[10px] uppercase font-bold text-blue-200">Ticket ID</div>
              <div className="font-mono font-extrabold text-base text-white tracking-wider">
                {registration.ticketId}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Metadata */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Attendee</span>
                <p className="text-base font-extrabold text-slate-900 dark:text-white">
                  {registration.student?.name}
                </p>
                <p className="text-xs text-slate-500">{registration.student?.email}</p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-sm">
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="font-semibold">{registration.event?.date || event?.date}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{registration.event?.time || event?.time}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{registration.event?.venue || event?.venue}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Status: VALID FOR ADMISSION</span>
                </div>
              </div>
            </div>

            {/* Right: QR Code */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Scan At Venue Gate
              </div>

              {registration.qrCode && (
                <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                  <img
                    src={registration.qrCode}
                    alt="Ticket QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-3 max-w-[200px]">
                Signed cryptographic token with anti-tamper verification.
              </p>
            </div>
          </div>

          {/* Email notice banner */}
          <div className="mt-8 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-200">
              <strong className="block font-bold mb-0.5">Confirmation Email Dispatched</strong>
              A confirmation email with this digital pass and QR code has been automatically sent to your registered address.
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-end print:hidden">
            <button
              onClick={handleDownloadQR}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" /> Download QR
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Ticket
            </button>
            <Link
              to="/my-tickets"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
            >
              <span>View All My Tickets</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
