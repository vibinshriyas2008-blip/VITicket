import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck } from 'lucide-react';

const StatusBadge = ({ status, size = 'md' }) => {
  const normalized = status ? status.toUpperCase() : 'UNKNOWN';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold tracking-wide',
    lg: 'px-3.5 py-1.5 text-sm font-bold tracking-wider',
  };

  switch (normalized) {
    case 'AVAILABLE':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${sizeClasses[size]}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          AVAILABLE
        </span>
      );

    case 'ALMOST FULL':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${sizeClasses[size]}`}>
          <Clock className="w-3.5 h-3.5" />
          ALMOST FULL
        </span>
      );

    case 'REGISTRATION CLOSED':
    case 'CLOSED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 ${sizeClasses[size]}`}>
          <XCircle className="w-3.5 h-3.5" />
          REGISTRATION CLOSED
        </span>
      );

    case 'VALID':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 ${sizeClasses[size]}`}>
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          VALID TICKET
        </span>
      );

    case 'CHECKED_IN':
    case 'CHECKED-IN':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 ${sizeClasses[size]}`}>
          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          CHECKED-IN
        </span>
      );

    case 'ALREADY_USED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 ${sizeClasses[size]}`}>
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          ALREADY USED
        </span>
      );

    case 'WRONG_EVENT':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700 ${sizeClasses[size]}`}>
          <XCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          WRONG EVENT
        </span>
      );

    case 'INVALID':
    case 'INVALID_TICKET':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 ${sizeClasses[size]}`}>
          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          INVALID TICKET
        </span>
      );
  }
};

export default StatusBadge;
