'use client';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  loading?: boolean;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message, loading }: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="bg-white rounded shadow-lg w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {title}
          </h2>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 text-sm text-slate-700">
          {message}
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50 rounded-b">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="px-4 py-1.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={loading}
            className="px-4 py-1.5 text-sm font-semibold text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
