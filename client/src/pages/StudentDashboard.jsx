import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Ticket,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  ExternalLink,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await ticketAPI.getMyRegistrations();
      if (res.data.success) {
        setRegistrations(res.data.registrations);
      }
    } catch (err) {
      console.error('Failed to load tickets for dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalRegistered = registrations.length;
  const activeValid = registrations.filter((r) => r.status === 'VALID').length;
  const attendedCount = registrations.filter((r) => r.status === 'CHECKED_IN').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Student Welcome Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Roll No: <span className="font-mono font-semibold">{user?.registrationNumber || '21BCE1042'}</span> • {user?.email}
            </p>
          </div>

          <Link
            to="/my-tickets"
            className="self-start md:self-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
          >
            <Ticket className="w-4 h-4" />
            <span>Open Ticket Passes</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : totalRegistered}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Registrations
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : activeValid}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Active Valid Passes
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loading ? '...' : attendedCount}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Events Attended
            </div>
          </div>
        </div>
      </div>

      {/* Recent Passes List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Recent Passes & Activity
          </h2>
          <Link
            to="/my-tickets"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">No recent activity recorded.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.slice(0, 4).map((ticket) => (
              <div
                key={ticket.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors gap-3"
              >
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {ticket.event?.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ticket.event?.date} • {ticket.event?.venue}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                    {ticket.ticketId}
                  </span>
                  <StatusBadge status={ticket.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
