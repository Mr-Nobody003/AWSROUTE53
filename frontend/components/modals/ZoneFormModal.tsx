'use client';
import { useState, useEffect } from 'react';
import { X, Globe } from 'lucide-react';

interface ZoneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export function ZoneFormModal({ isOpen, onClose, onSubmit, initialData }: ZoneFormModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Public');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setComment(initialData.comment || '');
    } else {
      setName('');
      setType('Public');
      setComment('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, type, comment });
      onClose();
    } catch (e) {
      // Error handled by caller via toasts
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] flex flex-col bg-white dark:bg-[#161B22] border-l border-slate-200 dark:border-[#21262D] shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#21262D] flex-shrink-0 bg-slate-50 dark:bg-transparent">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-[#FF9900]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#E6EDF3]">
                {initialData ? 'Edit Hosted Zone' : 'Create Hosted Zone'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#8B949E]">Configure your DNS zone settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-md text-slate-500 dark:text-[#8B949E] hover:text-slate-900 dark:hover:text-[#E6EDF3] hover:bg-slate-200 dark:hover:bg-[#21262D] transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Domain name */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-[#E6EDF3] mb-1.5">
                Domain name <span className="text-red-500 dark:text-red-400 normal-case">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!!initialData || loading}
                placeholder="example.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-[#30363D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900]/50 focus:border-[#FF9900] disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-[#0D1117] bg-white dark:bg-[#0D1117] text-slate-900 dark:text-[#E6EDF3] transition-all"
                required
              />
              <p className="text-xs text-slate-500 dark:text-[#8B949E] mt-1.5">
                Enter the name of the domain (e.g., example.com)
              </p>
            </div>

            {/* Zone type */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-[#E6EDF3] mb-1.5">Zone type</label>
              <div className="space-y-3 mt-1">
                {[
                  {
                    value: 'Public',
                    label: 'Public hosted zone',
                    desc: 'Routes traffic on the public internet',
                  },
                  {
                    value: 'Private',
                    label: 'Private hosted zone',
                    desc: 'Routes traffic within Amazon VPCs only',
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                      type === opt.value
                        ? 'border-[#FF9900]/60 bg-[#FF9900]/5 dark:bg-[#FF9900]/8'
                        : 'border-slate-200 dark:border-[#30363D] bg-slate-50 dark:bg-[#0D1117] hover:border-slate-300 dark:hover:border-[#484F58]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="zone-type"
                      value={opt.value}
                      checked={type === opt.value}
                      onChange={() => setType(opt.value)}
                      disabled={loading}
                      className="mt-0.5 accent-[#FF9900]"
                    />
                    <div>
                      <div
                        className={`text-sm font-medium ${
                          type === opt.value ? 'text-[#FF9900]' : 'text-slate-700 dark:text-[#C9D1D9]'
                        }`}
                      >
                        {opt.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-[#8B949E] mt-0.5">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-[#E6EDF3] mb-1.5">Description (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={loading}
                rows={3}
                placeholder="Add a description for this hosted zone..."
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-[#30363D] rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900]/50 focus:border-[#FF9900] disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-[#0D1117] bg-white dark:bg-[#0D1117] text-slate-900 dark:text-[#E6EDF3] resize-none transition-all"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-[#21262D] flex-shrink-0 bg-slate-50 dark:bg-[#13161B]">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] border border-slate-300 dark:border-[#30363D] rounded-md hover:bg-slate-50 dark:hover:bg-[#30363D] transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-[#FF9900] hover:bg-[#E68900] rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-[#FF9900] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {initialData ? 'Saving...' : 'Creating...'}
                </>
              ) : initialData ? (
                'Save changes'
              ) : (
                'Create hosted zone'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
