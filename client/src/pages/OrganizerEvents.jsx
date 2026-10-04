import React, { useState, useEffect } from 'react';
import { eventAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  X,
  FileSpreadsheet,
  Eye,
} from 'lucide-react';

const OrganizerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [selectedEventAttendees, setSelectedEventAttendees] = useState([]);
  const [attendeeEventName, setAttendeeEventName] = useState('');
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // New Event Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '15 October 2026',
    time: '10:00 AM',
    venue: 'Anna Auditorium, VIT Campus',
    capacity: 100,
    category: 'Technical',
    bannerUrl: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventAPI.getAll();
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setActionMsg('');
    try {
      const res = await eventAPI.create(formData);
      if (res.data.success) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          date: '15 October 2026',
          time: '10:00 AM',
          venue: 'Anna Auditorium, VIT Campus',
          capacity: 100,
          category: 'Technical',
          bannerUrl: '',
        });
        fetchEvents();
      }
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventAPI.delete(id);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleViewAttendees = async (eventId, eventName) => {
    setAttendeeEventName(eventName);
    setShowAttendeesModal(true);
    setLoadingAttendees(true);
    try {
      const res = await eventAPI.getEventCheckins(eventId);
      if (res.data.success) {
        setSelectedEventAttendees(res.data.checkins);
      }
    } catch (err) {
      console.error('Failed to fetch check-ins:', err);
    } finally {
      setLoadingAttendees(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Manage Campus Events
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create new student programs, adjust capacities, and view gate admissions.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Event</span>
        </button>
      </div>

      {/* Events Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Event Details</th>
                <th className="px-6 py-4">Schedule & Venue</th>
                <th className="px-6 py-4">Capacity Status</th>
                <th className="px-6 py-4">Badge</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {events.map((ev) => (
                <tr key={ev._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-900 dark:text-white">
                      {ev.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Category: {ev.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs space-y-1">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {ev.date} at {ev.time}
                    </div>
                    <div className="text-slate-400">{ev.venue}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      {ev.registeredCount} / {ev.capacity} registered
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {ev.availableSeats} seats remaining
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={ev.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleViewAttendees(ev._id, ev.name)}
                      className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 transition-colors"
                      title="View Checked-in Attendees"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(ev._id)}
                      className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              Publish New Campus Event
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Fill in the technical and scheduling details. Capacity limits will be strictly enforced at registration.
            </p>

            {actionMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                {actionMsg}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. AWS Student Hackathon 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed event agenda, target audience, and eligibility..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Venue Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Maximum Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Banner Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendees Modal */}
      {showAttendeesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowAttendeesModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Checked-in Attendees
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Verified entrance logs for: <strong>{attendeeEventName}</strong>
            </p>

            {loadingAttendees ? (
              <div className="text-center py-10 text-slate-400">Loading attendee logs...</div>
            ) : selectedEventAttendees.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                No checked-in attendees found for this event.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedEventAttendees.map((att, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {att.studentName}
                      </span>
                      <span className="text-slate-400 ml-2 font-mono">({att.ticketId})</span>
                      <div className="text-[11px] text-slate-500">{att.studentEmail}</div>
                    </div>
                    <div className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {att.checkedInTime}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerEvents;
