'use client';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  loading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#161B22] border border-[#21262D] rounded-2xl shadow-2xl w-full max-w-md animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#E6EDF3]">{title}</h2>
                <p className="text-xs text-[#8B949E] mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-1.5 rounded-md text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pb-6">
            <div className="text-sm text-[#C9D1D9] leading-relaxed bg-[#0D1117] border border-[#21262D] rounded-lg px-4 py-3">
              {message}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#21262D] bg-[#13161B]">
            <button
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              id="confirm-delete-btn"
              onClick={onConfirm}
              disabled={loading}
              className="btn-danger"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
