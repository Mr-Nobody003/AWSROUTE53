'use client';
import { useState, useEffect } from 'react';

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
    <div className="fixed inset-0 bg-[#f2f3f3] dark:bg-[#0D1117] z-50 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8">
        
        {/* Breadcrumbs */}
        <div className="mb-4 flex items-center gap-1 text-sm text-gray-500 dark:text-[#8B949E]">
          <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Route 53</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Hosted zones</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-900 dark:text-[#E6EDF3]">{initialData ? 'Edit hosted zone' : 'Create hosted zone'}</span>
        </div>

        <h1 className="text-2xl font-normal text-gray-900 dark:text-[#E6EDF3] mb-6 flex items-center gap-2">
          {initialData ? 'Edit hosted zone' : 'Create hosted zone'}
          <span className="text-blue-600 dark:text-blue-400 text-sm cursor-pointer hover:underline">Info</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          
          {/* Main Card */}
          <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#30363D]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-[#E6EDF3]">Hosted zone configuration</h2>
              <p className="text-[13px] text-gray-600 dark:text-[#8B949E] mt-1">
                A hosted zone is a container that holds information about how you want to route traffic for a domain, such as example.com, and its subdomains.
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Domain name */}
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-[#E6EDF3] mb-1 flex items-center gap-1">
                  Domain name
                  <span className="text-blue-600 dark:text-blue-400 text-xs font-normal cursor-pointer hover:underline">Info</span>
                </label>
                <p className="text-[13px] text-gray-600 dark:text-[#8B949E] mb-2">This is the name of the domain that you want to route traffic for.</p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!!initialData || loading}
                  className="w-full max-w-2xl px-3 py-1.5 text-[13px] border border-gray-400 dark:border-[#484F58] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-sm disabled:bg-gray-100 dark:disabled:bg-[#0D1117] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-[#E6EDF3]"
                  required
                />
                <p className="text-[11px] text-gray-500 dark:text-[#8B949E] mt-1">
                  Valid characters: a-z, 0-9, ! " # $ % & ' ( ) * + , - / : ; &lt; = &gt; ? @ [ \ ] ^ _ ` &#123; | &#125; . ~
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-[#E6EDF3] mb-1 flex items-center gap-1">
                  Description - <span className="font-normal italic">optional</span>
                  <span className="text-blue-600 dark:text-blue-400 text-xs font-normal cursor-pointer hover:underline">Info</span>
                </label>
                <p className="text-[13px] text-gray-600 dark:text-[#8B949E] mb-2">This value lets you distinguish hosted zones that have the same name.</p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="w-full max-w-2xl px-3 py-1.5 text-[13px] border border-gray-400 dark:border-[#484F58] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-sm disabled:bg-gray-100 dark:disabled:bg-[#0D1117] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-[#E6EDF3] italic placeholder:text-gray-400"
                  placeholder="The hosted zone is used for..."
                />
                <p className="text-[11px] text-gray-500 dark:text-[#8B949E] mt-1">
                  The description can have up to 256 characters. {comment.length}/256
                </p>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-[#E6EDF3] mb-1 flex items-center gap-1">
                  Type
                  <span className="text-blue-600 dark:text-blue-400 text-xs font-normal cursor-pointer hover:underline">Info</span>
                </label>
                <p className="text-[13px] text-gray-600 dark:text-[#8B949E] mb-2">The type indicates whether you want to route traffic on the internet or in an Amazon VPC.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mt-3">
                  <label className={`flex-1 flex gap-3 p-4 border ${type === 'Public' ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50/30 dark:bg-blue-900/10' : 'border-gray-300 dark:border-[#484F58] hover:border-gray-400 dark:hover:border-gray-500'} cursor-pointer`}>
                    <input 
                      type="radio" 
                      checked={type === 'Public'} 
                      onChange={() => setType('Public')} 
                      className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                    />
                    <div>
                      <div className="text-[13px] font-bold text-gray-900 dark:text-[#E6EDF3]">Public hosted zone</div>
                      <div className="text-[13px] text-gray-600 dark:text-[#8B949E] mt-1">A public hosted zone determines how traffic is routed on the internet.</div>
                    </div>
                  </label>
                  
                  <label className={`flex-1 flex gap-3 p-4 border ${type === 'Private' ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50/30 dark:bg-blue-900/10' : 'border-gray-300 dark:border-[#484F58] hover:border-gray-400 dark:hover:border-gray-500'} cursor-pointer`}>
                    <input 
                      type="radio" 
                      checked={type === 'Private'} 
                      onChange={() => setType('Private')} 
                      className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                    />
                    <div>
                      <div className="text-[13px] font-bold text-gray-900 dark:text-[#E6EDF3]">Private hosted zone</div>
                      <div className="text-[13px] text-gray-600 dark:text-[#8B949E] mt-1">A private hosted zone determines how traffic is routed within an Amazon VPC.</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tags Section (Mocked for UI matching) */}
          <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] shadow-sm">
            <div className="px-6 py-5">
              <label className="block text-sm font-bold text-gray-900 dark:text-[#E6EDF3] mb-1 flex items-center gap-1">
                Tags
                <span className="text-blue-600 dark:text-blue-400 text-xs font-normal cursor-pointer hover:underline">Info</span>
              </label>
              <p className="text-[13px] text-gray-600 dark:text-[#8B949E] mb-6">Apply tags to hosted zones to help organize and identify them.</p>
              
              <p className="text-[13px] text-gray-600 dark:text-[#8B949E] mb-4">No tags associated with the resource.</p>
              
              <button type="button" className="px-4 py-1 text-sm font-bold text-gray-700 dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] border border-gray-400 dark:border-[#484F58] rounded-sm hover:bg-gray-50 dark:hover:bg-[#30363D] shadow-sm mb-1">
                Add tag
              </button>
              <p className="text-[11px] text-gray-500 dark:text-[#8B949E]">You can add up to 50 more tags.</p>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#161B22] border-t border-gray-300 dark:border-[#30363D] p-4 flex justify-end gap-4 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              className="px-4 py-1.5 text-[13px] font-bold text-gray-700 dark:text-[#C9D1D9] hover:underline disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-1.5 text-[13px] font-bold text-[#0D1117] bg-[#FF9900] hover:bg-[#E68900] rounded-sm transition-colors disabled:opacity-50 disabled:hover:bg-[#FF9900] shadow-sm flex items-center gap-2"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-[#0D1117]/30 border-t-[#0D1117] rounded-full animate-spin" />}
              {initialData ? 'Save changes' : 'Create hosted zone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
