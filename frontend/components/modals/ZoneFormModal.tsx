'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
      // Error is handled by caller via toasts
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex max-w-full w-full sm:w-[500px]">
      <div className="absolute inset-0 bg-slate-900/20 sm:hidden" onClick={onClose} />
      <div className="relative w-full h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            {initialData ? 'Edit Hosted Zone' : 'Create Hosted Zone'}
          </h2>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Domain name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!!initialData || loading}
                placeholder="example.com"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:bg-slate-100 disabled:text-slate-500"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Enter the name of the domain (e.g., example.com).</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Description</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={loading}
                rows={3}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Type</label>
              <div className="space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    value="Public" 
                    checked={type === 'Public'}
                    onChange={() => setType('Public')}
                    disabled={loading}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-800">Public hosted zone</div>
                    <div className="text-xs text-slate-500">Determines how traffic is routed on the internet.</div>
                  </div>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    value="Private" 
                    checked={type === 'Private'}
                    onChange={() => setType('Private')}
                    disabled={loading}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-800">Private hosted zone</div>
                    <div className="text-xs text-slate-500">Determines how traffic is routed within Amazon VPCs.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose} 
              disabled={loading}
              className="px-4 py-1.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !name.trim()}
              className="px-4 py-1.5 text-sm font-semibold text-white bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save changes' : 'Create hosted zone')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
