import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Download,
  X,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

const MyTickets = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQRModal, setActiveQRModal] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketAPI.getMyRegistrations();
      if (res.data.success) {
        setRegistrations(res.data.registrations);
      }
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = (ticket) => {
    if (!ticket.qrCode) return;
    const link = document.createElement('a');
    link.href = ticket.qrCode;
    link.download = `VITicket-${ticket.ticketId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Campus Passes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access your event admission tickets, QR codes, and entry status.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Ticket className="w-4 h-4" /> Browse More Events
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse h-64"
            ></div>
          ))}
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <Ticket className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Tickets Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            You haven't registered for any campus events yet. Explore upcoming hackathons and workshops!
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            Find Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((ticket) => {
            const isCheckedIn = ticket.status === 'CHECKED_IN';

            return (
              <div
                key={ticket.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Header ribbon */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-5 text-white flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300">
                      {ticket.event?.category || 'Campus Event'}
                    </span>
                    <h3 className="text-lg font-black tracking-tight mt-0.5 line-clamp-1">
                      {ticket.event?.name}
                    </h3>
                  </div>
                  <StatusBadge status={ticket.status} size="sm" />
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Ticket ID</span>
                      <p className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm mt-0.5">
                        {ticket.ticketId}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">Registered On</span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs mt-0.5">
                        {new Date(ticket.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{ticket.event?.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{ticket.event?.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{ticket.event?.venue}</span>
                    </div>
                  </div>

                  {isCheckedIn && (
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        Checked in at: <strong>{new Date(ticket.checkedInAt).toLocaleTimeString()}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Bar */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveQRModal(ticket)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View QR Pass</span>
                  </button>

                  <button
                    onClick={() => handleDownloadQR(ticket)}
                    title="Download QR Image"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Pop-up Modal */}
      {activeQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <button
              onClick={() => setActiveQRModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Admission Pass
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1 line-clamp-1">
              {activeQRModal.event?.name}
            </h3>

            <div className="my-6 p-4 bg-white rounded-2xl shadow-inner border border-slate-200 inline-block">
              {activeQRModal.qrCode ? (
                <img
                  src={activeQRModal.qrCode}
                  alt="QR Code"
                  className="w-56 h-56 object-contain mx-auto"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                  QR Not Available
                </div>
              )}
            </div>

            <div className="font-mono text-sm font-extrabold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 py-1.5 px-4 rounded-xl border border-blue-200 dark:border-blue-900 inline-block mb-3">
              {activeQRModal.ticketId}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Present this QR to the event organizer at the entrance gate.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => handleDownloadQR(activeQRModal)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" /> Download QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
