import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldCheck, Clock, User, Calendar, MapPin, Tag } from 'lucide-react';

const playBeep = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'SUCCESS') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3 buzz
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    }
  } catch (e) {
    // Audio Context might be constrained before user gesture
  }
};

const VerificationModal = ({ isOpen, onClose, result, targetEventName }) => {
  if (!isOpen || !result) return null;

  const { verificationStatus, message, ticket, error } = result;

  useEffect(() => {
    if (verificationStatus === 'VALID') {
      playBeep('SUCCESS');
    } else {
      playBeep('ERROR');
    }
  }, [verificationStatus]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all scale-100">
        
        {/* CASE 1: VALID TICKET */}
        {verificationStatus === 'VALID' && (
          <div className="p-6 sm:p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 mb-2 text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 rounded-full">
                Check-In Successful
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                ✅ VALID TICKET
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Attendee is cleared for admission.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 space-y-3.5 text-sm">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" /> Student:
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white text-base">
                  {ticket?.studentName || 'Vibin Shriyas'}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" /> Event:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">
                  {ticket?.eventName || targetEventName || 'Campus Event'}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-slate-400" /> Ticket ID:
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded">
                  {ticket?.ticketId}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-slate-200 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Status:
                </span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  CHECKED-IN
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" /> Check-in time:
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {ticket?.checkInTime || new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3.5 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Ready for Next Scan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CASE 2: ALREADY USED */}
        {verificationStatus === 'ALREADY_USED' && (
          <div className="p-6 sm:p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-lg shadow-amber-500/20">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 mb-2 text-xs font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 rounded-full">
                Duplicate Entry Blocked
              </div>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                ⚠️ ALREADY USED
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                This ticket has already been redeemed and cannot be used again.
              </p>
            </div>

            <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-5 border border-amber-200 dark:border-amber-800/60 space-y-3.5 text-sm">
              <div className="flex justify-between items-center pb-2.5 border-b border-amber-200/60 dark:border-amber-800/40">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Student:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {ticket?.studentName}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-amber-200/60 dark:border-amber-800/40">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Ticket ID:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {ticket?.ticketId}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Original Check-in:</span>
                <span className="font-extrabold text-amber-700 dark:text-amber-300">
                  {ticket?.originalCheckInTime || 'Earlier Today'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3.5 px-4 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Dismiss & Scan Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CASE 3: INVALID TICKET */}
        {verificationStatus === 'INVALID' && (
          <div className="p-6 sm:p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border-2 border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-lg shadow-rose-500/20">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 mb-2 text-xs font-extrabold uppercase tracking-widest text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 rounded-full">
                Security Alert
              </div>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                ❌ INVALID TICKET
              </h3>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-2">
                "This ticket could not be verified."
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Cryptographic signature failure or forged payload. Do not permit entry.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/40 rounded-xl p-3 text-xs font-mono text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                Reason: {error}
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-6 w-full py-3.5 px-4 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Scan Next Ticket</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CASE 4: WRONG EVENT */}
        {verificationStatus === 'WRONG_EVENT' && (
          <div className="p-6 sm:p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-100 dark:bg-orange-950/80 border-2 border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-lg shadow-orange-500/20">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="text-center mb-6">
              <div className="inline-block px-3 py-1 mb-2 text-xs font-extrabold uppercase tracking-widest text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/60 rounded-full">
                Event Mismatch
              </div>
              <h3 className="text-2xl font-black text-orange-600 dark:text-orange-400 tracking-tight">
                ❌ WRONG EVENT
              </h3>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-2">
                "This ticket belongs to a different event."
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The student has a valid ticket, but for another campus gathering.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-2xl p-4 border border-orange-200 dark:border-orange-800/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-900 dark:text-white">{ticket?.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ticket's Actual Event:</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">{ticket?.ticketEventName}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-3.5 px-4 rounded-xl font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Scan Next Ticket</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerificationModal;
