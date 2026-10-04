import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import {
  Users,
  CheckCircle2,
  Clock,
  QrCode,
  Calendar,
  AlertCircle,
  RefreshCw,
  Plus,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [stats, setStats] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventStats(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await eventAPI.getAll();
      if (res.data.success && res.data.events.length > 0) {
        setEvents(res.data.events);
        setSelectedEventId(res.data.events[0]._id);
      }
    } catch (err) {
      console.error('Failed to load organizer events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchEventStats = async (eventId) => {
    setLoadingStats(true);
    try {
      const res = await eventAPI.getEventStats(eventId);
      if (res.data.success) {
        setStats(res.data.statistics);
      }
    } catch (err) {
      console.error('Failed to load event statistics:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const currentEvent = events.find((e) => e._id === selectedEventId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Organizer Management Portal</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Event Check-In & Operations Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor real-time gate admissions, registration velocity, and attendee headcounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/organizer/scanner${selectedEventId ? `?eventId=${selectedEventId}` : ''}`}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Launch Scanner</span>
          </Link>

          <Link
            to="/organizer/events"
            className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </Link>
        </div>
      </div>

      {/* Event Selector Dropdown Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <label htmlFor="eventSelect" className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Active Event:
          </label>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md">
          <select
            id="eventSelect"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={loadingEvents}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.name} ({ev.date})
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchEventStats(selectedEventId)}
            title="Refresh statistics"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {/* Capacity */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Event Capacity
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.capacity}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Total venue ceiling</div>
          </div>

          {/* Registered */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              Registered
            </div>
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {stats.registeredCount || stats.totalRegistrations}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Confirmed student passes</div>
          </div>

          {/* Checked In */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              Checked In
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.checkedInCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Verified at gate</div>
          </div>

          {/* Remaining */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
              Remaining
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {stats.remainingAttendees}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Awaiting arrival</div>
          </div>
        </div>
      )}

      {/* Main Grid: Quick Action & Recent Check-ins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Quick Scanner Launcher */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-6">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-2">
                Fast Gate Check-In
              </h3>
              <p className="text-xs text-indigo-200 leading-relaxed mb-6">
                Position attendee QR code passes before the camera or enter signed tokens manually. Sub-second cryptographic verification prevents duplicate entry.
              </p>
            </div>

            <Link
              to={`/organizer/scanner${selectedEventId ? `?eventId=${selectedEventId}` : ''}`}
              className="w-full py-3.5 px-4 rounded-xl bg-white text-indigo-950 font-black text-xs uppercase tracking-wider text-center shadow-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
            >
              <span>Open Gate Scanner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right: Recent Check-in Stream */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Recent Check-ins
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live verification stream for {currentEvent?.name || 'Selected Event'}
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {stats?.recentCheckins?.length || 0} Admitted
              </span>
            </div>

            {!stats?.recentCheckins || stats.recentCheckins.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">No check-ins recorded yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Start scanning attendee QR codes to see live admission logs.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.recentCheckins.map((item, idx) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {item.studentName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.studentEmail} • <span className="font-mono">{item.ticketId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {item.checkedInTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
