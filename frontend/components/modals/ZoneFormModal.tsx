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
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] flex flex-col bg-[#161B22] border-l border-[#21262D] shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262D] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-[#FF9900]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#E6EDF3]">
                {initialData ? 'Edit Hosted Zone' : 'Create Hosted Zone'}
              </h2>
              <p className="text-xs text-[#8B949E]">Configure your DNS zone settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-md text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Domain name */}
            <div>
              <label className="input-label">
                Domain name <span className="text-red-400 normal-case">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!!initialData || loading}
                placeholder="example.com"
                className="input-field"
                required
              />
              <p className="text-xs text-[#8B949E] mt-1.5">
                Enter the name of the domain (e.g., example.com)
              </p>
            </div>

            {/* Zone type */}
            <div>
              <label className="input-label">Zone type</label>
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
                        ? 'border-[#FF9900]/60 bg-[#FF9900]/8'
                        : 'border-[#30363D] bg-[#0D1117] hover:border-[#484F58]'
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
                          type === opt.value ? 'text-[#FF9900]' : 'text-[#C9D1D9]'
                        }`}
                      >
                        {opt.label}
                      </div>
                      <div className="text-xs text-[#8B949E] mt-0.5">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="input-label">Description (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={loading}
                rows={3}
                placeholder="Add a description for this hosted zone..."
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#21262D] flex-shrink-0 bg-[#13161B]">
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#0D1117]/30 border-t-[#0D1117] rounded-full animate-spin" />
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
