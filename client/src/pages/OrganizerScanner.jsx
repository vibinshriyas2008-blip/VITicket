import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { eventAPI, checkinAPI } from '../services/api';
import VerificationModal from '../components/VerificationModal';
import {
  Camera,
  QrCode,
  Calendar,
  AlertCircle,
  Upload,
  RefreshCw,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

const OrganizerScanner = () => {
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [manualToken, setManualToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [modalResult, setModalResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventAPI.getAll();
      if (res.data.success && res.data.events.length > 0) {
        setEvents(res.data.events);
        if (!selectedEventId) {
          setSelectedEventId(res.data.events[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  // Start HTML5 QR Scanner
  const startCameraScanner = async () => {
    setScannerError('');
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
      }

      const html5QrCode = new Html5Qrcode('qr-reader-viewport');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Successfully detected a QR code!
          console.log('[Scanner] QR Code detected:', decodedText);
          handleVerify(decodedText);
        },
        (errorMessage) => {
          // Standard scanning frame errors (ignored to avoid spam)
        }
      );

      setScannerActive(true);
    } catch (err) {
      console.error('[Scanner] Camera start error:', err);
      setScannerError(
        'Could not access webcam. Please check browser permissions, or use image upload / manual token fallback below.'
      );
      setScannerActive(false);
    }
  };

  const stopCameraScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
    }
    setScannerActive(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Handle Scan from Image File
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-file-processor');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleVerify(decodedText);
      html5QrCode.clear();
    } catch (err) {
      setScannerError('Could not detect a valid QR code in the uploaded image. Please try another image.');
    }
  };

  // Submit token to backend for cryptographic verification
  const handleVerify = async (tokenToVerify) => {
    const token = tokenToVerify || manualToken;
    if (!token || !token.trim()) {
      setScannerError('Please scan a QR code or paste a ticket token');
      return;
    }

    if (!selectedEventId) {
      setScannerError('Please select the active event before verifying tickets');
      return;
    }

    setVerifying(true);
    setScannerError('');

    try {
      const res = await checkinAPI.verifyTicket({
        token: token.trim(),
        eventId: selectedEventId,
      });

      // CASE 1: VALID TICKET
      setModalResult({
        verificationStatus: 'VALID',
        message: res.data.message,
        ticket: res.data.ticket,
      });
      setIsModalOpen(true);
      setManualToken('');
    } catch (err) {
      const data = err.response?.data;
      const status = data?.verificationStatus || 'INVALID';

      // CASE 2: ALREADY_USED
      // CASE 3: INVALID
      // CASE 4: WRONG_EVENT
      setModalResult({
        verificationStatus: status,
        message: data?.message || 'Verification failed',
        ticket: data?.ticket,
        error: data?.error,
      });
      setIsModalOpen(true);
    } finally {
      setVerifying(false);
    }
  };

  const currentEvent = events.find((e) => e._id === selectedEventId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <Link
        to="/organizer/dashboard"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Organizer Dashboard
      </Link>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold uppercase tracking-widest mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>ORGANIZER CHECK-IN</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Live QR Gate Scanner
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto">
          Scan student passes or enter tokens manually for instant cryptographic validation.
        </p>
      </div>

      {/* Main Scanner Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-8">
        {/* Step 1: Select Event */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Select Event for Check-In
          </label>
          <div className="relative">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.name} — {ev.date} ({ev.venue})
                </option>
              ))}
            </select>
          </div>
          {currentEvent && (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Gate: <strong>{currentEvent.venue}</strong></span>
              <span>Capacity: <strong>{currentEvent.registeredCount}/{currentEvent.capacity}</strong></span>
            </div>
          )}
        </div>

        {/* Step 2: Camera Viewport */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-indigo-600" />
              CAMERA QR SCANNER
            </span>

            {scannerActive ? (
              <button
                onClick={stopCameraScanner}
                className="px-3 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-200 transition-colors"
              >
                Stop Camera
              </button>
            ) : (
              <button
                onClick={startCameraScanner}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Start Camera
              </button>
            )}
          </div>

          {/* Scanner Viewport Box */}
          <div className="relative rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-950 text-white overflow-hidden min-h-[300px] flex items-center justify-center">
            <div id="qr-reader-viewport" className="w-full max-w-[400px]"></div>

            {!scannerActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 backdrop-blur-xs">
                <QrCode className="w-16 h-16 text-indigo-400 mb-3 animate-pulse" />
                <h4 className="text-base font-bold text-white">Camera is Standby</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mb-5">
                  Click 'Start Camera' to open your webcam, or use image upload and manual input below.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={startCameraScanner}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/30 transition-all flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> Start Camera
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Upload QR Image
                  </button>
                </div>
              </div>
            )}

            {/* Hidden image scanner element */}
            <div id="qr-file-processor" className="hidden"></div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {scannerError && (
            <div className="mt-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{scannerError}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs font-black uppercase tracking-widest text-slate-400">
            OR MANUAL FALLBACK
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Step 3: Manual Token Input */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Enter Ticket Token Manually
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste raw signed token (e.g. eyJhbGci... or payload.sig)"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={verifying || !manualToken.trim()}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {verifying ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>VERIFY TICKET</span>
            </button>
          </div>
        </div>

        {/* Testing Demonstration Helpers */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Challenge Demonstration Shortcuts (1-Click Test Scenarios)</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                setManualToken('eyJhbGciOiJIUzI1NiJ9.invalid_tampered_token.fake_signature');
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold hover:bg-rose-100"
            >
              Inject Fake / Tampered QR
            </button>
          </div>
        </div>
      </div>

      {/* Verification Result Modal */}
      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={modalResult}
        targetEventName={currentEvent?.name}
      />
    </div>
  );
};

export default OrganizerScanner;
