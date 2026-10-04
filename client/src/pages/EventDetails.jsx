import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Building,
  ArrowLeft,
  Ticket,
  AlertCircle,
  CheckCircle,
  Share2,
} from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isOrganizer } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await eventAPI.getById(id);
      if (res.data.success) {
        setEvent(res.data.event);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    if (isOrganizer) {
      setErrorMsg('Organizers cannot register as event attendees. Please use a student account.');
      return;
    }

    setRegistering(true);
    setErrorMsg('');

    try {
      const res = await eventAPI.registerForEvent(id);
      if (res.data.success) {
        // Navigate to Registration Success page with ticket info
        navigate('/registration-success', {
          state: {
            registration: res.data.registration,
            event: res.data.registration.event,
          },
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-6"></div>
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-8"></div>
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Event Not Found</h2>
        <p className="text-slate-500 mt-2">{errorMsg || 'The requested event does not exist.'}</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Event Catalog
        </Link>
      </div>
    );
  }

  const isClosed = event.status === 'REGISTRATION CLOSED' || event.registeredCount >= event.capacity;
  const capacityPercent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Events
      </Link>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        {/* Banner */}
        <div className="relative h-64 sm:h-80 w-full bg-slate-800 overflow-hidden">
          {event.bannerUrl ? (
            <img src={event.bannerUrl} alt={event.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 flex items-center justify-center text-white/30">
              <Calendar className="w-24 h-24" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
              {event.category}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <StatusBadge status={event.status} size="lg" />
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {event.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-200 mt-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Organized by: <strong className="text-white">{event.organizerName || 'Campus Committee'}</strong></span>
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                About This Event
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Event Key Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Date</div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {event.date}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Time</div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {event.time}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3.5 sm:col-span-2">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Venue Location</div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {event.venue}
                  </div>
                </div>
              </div>
            </div>

            {/* Entry instructions */}
            <div className="bg-blue-50/60 dark:bg-blue-950/30 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Security & Pass Guidelines
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                <li>Upon registering, an official cryptographically signed QR code will be generated.</li>
                <li>A confirmation ticket is sent to your registered email address automatically.</li>
                <li>You can also view and download your ticket anytime from the <strong>My Tickets</strong> tab.</li>
                <li>At the venue gate, display your QR pass for instant optical scanner verification.</li>
              </ul>
            </div>
          </div>

          {/* Right Action Box */}
          <div className="lg:col-span-1">
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sticky top-24 shadow-sm">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
                Registration Status
              </h3>

              {/* Capacity Counters */}
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Maximum Capacity:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{event.capacity} seats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Registered Attendees:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{event.registeredCount}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Available Seats:</span>
                  <span className={`font-black ${isClosed ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {event.availableSeats}
                  </span>
                </div>

                {/* Progress */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isClosed ? 'bg-rose-500' : capacityPercent >= 80 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Register CTA */}
              {isClosed ? (
                <div className="space-y-3 text-center">
                  <button
                    disabled
                    className="w-full py-3.5 px-4 rounded-xl font-bold bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
                  >
                    Registration Closed - Maximum Capacity Reached
                  </button>
                  <p className="text-xs text-rose-500 font-semibold">
                    All {event.capacity} seats have been claimed.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full py-3.5 px-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {registering ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Reserving Your Seat...</span>
                    </div>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      <span>{isAuthenticated ? 'Register For This Event' : 'Login to Register'}</span>
                    </>
                  )}
                </button>
              )}

              {isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 text-center">
                  Logged in as <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
