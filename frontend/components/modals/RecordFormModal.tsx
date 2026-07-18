'use client';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  zoneName: string;
}

export function RecordFormModal({ isOpen, onClose, onSubmit, initialData, zoneName }: RecordFormModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('A');
  const [ttl, setTtl] = useState(300);
  const [value, setValue] = useState('');
  const [routingPolicy, setRoutingPolicy] = useState('simple');
  const [loading, setLoading] = useState(false);
  const [isAlias, setIsAlias] = useState(false);
  const [showExisting, setShowExisting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name === zoneName ? '' : initialData.name.replace(`.${zoneName}`, ''));
      setType(initialData.type);
      setTtl(initialData.ttl);
      setValue(initialData.value);
      setRoutingPolicy(initialData.routing_policy);
    } else {
      setName('');
      setType('A');
      setTtl(300);
      setValue('');
      setRoutingPolicy('simple');
    }
  }, [initialData, isOpen, zoneName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullName = name ? `${name}.${zoneName}` : zoneName;
      await onSubmit({ name: fullName, type, ttl, value, routing_policy: routingPolicy });
      onClose();
    } catch (e) {
      // Handled by caller
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
          <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{zoneName}</span>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-900 dark:text-[#E6EDF3]">{initialData ? 'Edit record' : 'Create record'}</span>
        </div>

        <h1 className="text-2xl font-normal text-gray-900 dark:text-[#E6EDF3] mb-6 flex items-center gap-2">
          {initialData ? 'Edit record' : 'Create record'}
          <span className="text-blue-600 dark:text-blue-400 text-sm cursor-pointer hover:underline">Info</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          
          {/* Main Card */}
          <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] shadow-sm">
            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-[#30363D]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-[#E6EDF3]">Quick create record</h2>
              <span className="text-blue-600 dark:text-blue-400 text-sm font-bold cursor-pointer hover:underline">Switch to wizard</span>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-[#E6EDF3] text-[13px]">
                  <ChevronDown className="w-4 h-4" />
                  Record 1
                </div>
                <button type="button" disabled className="px-4 py-1 text-sm font-bold text-gray-700 dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] border border-gray-300 dark:border-[#484F58] rounded-sm shadow-sm disabled:opacity-50">
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Record Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-[#E6EDF3] mb-2 flex items-center gap-1">
                    Record name
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-normal cursor-pointer hover:underline">Info</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading || !!initialData}
                      className="flex-1 px-3 py-1.5 text-[13px] border border-gray-400 dark:border-[#484F58] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-sm disabled:bg-gray-100 dark:disabled:bg-[#0D1117] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-[#E6EDF3]"
                      placeholder={initialData ? "" : "mypage"}
                    />
                    <span className="text-[13px] text-gray-900 dark:text-[#E6EDF3]">.{zoneName}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-[#8B949E] mt-1">Keep blank to create a record for the root domain.</p>
                </div>

                {/* Record Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-[#E6EDF3] mb-2 flex items-center gap-1">
                    Record type
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-normal cursor-pointer hover:underline">Info</span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={loading || !!initialData}
                    className="w-full px-3 py-1.5 text-[13px] border border-gray-400 dark:border-[#484F58] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-sm disabled:bg-gray-100 dark:disabled:bg-[#0D1117] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-[#E6EDF3]"
                  >
                    <option value="A">A - Routes traffic to an IPv4 address and some AWS resources</option>
                    <option value="AAAA">AAAA - Routes traffic to an IPv6 address and some AWS resources</option>
                    <option value="CNAME">CNAME - Routes traffic to another domain name</option>
                    <option value="MX">MX - Specifies mail servers</option>
                    <option value="TXT">TXT - Text record</option>
                    <option value="SRV">SRV - Specifies a port and target for a service</option>
                    <option value="PTR">PTR - Maps an IP address to a domain name</option>
                    <option value="CAA">CAA - Specifies certificate authorities</option>
                    <option value="NS">NS - Name server</option>
                  </select>
                </div>

                {/* Alias Toggle */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={isAlias}
                        onChange={() => setIsAlias(!isAlias)}
                        className="sr-only" 
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${isAlias ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isAlias ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-[13px] font-bold text-gray-900 dark:text-[#E6EDF3]">Alias</span>
                  </label>
                </div>

                {/* Value */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 dark:text-[#E6EDF3] mb-2 flex items-center gap-1">
                    Value
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-normal cursor-pointer hover:underline">Info</span>
                  </label>
                  <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={loading || isAlias}
                    rows={4}
                    required={!isAlias}
                    placeholder="1.2.3.4"
                    className="w-full px-3 py-2 text-[13px] border border-gray-400 dark:border-[#484F58] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-sm disabled:bg-gray-100 dark:disabled:bg-[#0D1117] bg-white dark:bg-[#0D1117] text-gray-900 dark:text-[#E6EDF3] font-mono"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-[#8B949E] mt-1">Enter multiple values on separate lines.</p>
                </div>

                {/* TTL */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-[#E6EDF3] mb-2 flex items-center gap-1">
                    TTL (seconds)
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-normal cursor-pointer hover:underline">Info</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={ttl}
                      onChange={(e) => setTtl(parseInt(e.target.value) || 300)}
                      disabled={loading}
                      min="0"
                      className="flex-1 px-3 py-1.5 text-[13px] border border-gray-400 dark:border-[#484F58] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-sm bg-white dark:bg-[#0D1117] text-gray-900 dark:text-[#E6EDF3]"
                    />
                    <div className="flex">
                      <button type="button" onClick={() => setTtl(60)} className="px-3 py-1.5 text-[13px] border border-gray-400 dark:border-[#484F58] bg-white dark:bg-[#21262D] hover:bg-gray-50 dark:hover:bg-[#30363D] text-gray-700 dark:text-[#C9D1D9]">1m</button>
                      <button type="button" onClick={() => setTtl(3600)} className="px-3 py-1.5 text-[13px] border-y border-gray-400 dark:border-[#484F58] bg-white dark:bg-[#21262D] hover:bg-gray-50 dark:hover:bg-[#30363D] text-gray-700 dark:text-[#C9D1D9]">1h</button>
                      <button type="button" onClick={() => setTtl(86400)} className="px-3 py-1.5 text-[13px] border border-gray-400 dark:border-[#484F58] bg-white dark:bg-[#21262D] hover:bg-gray-50 dark:hover:bg-[#30363D] text-gray-700 dark:text-[#C9D1D9]">1d</button>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-[#8B949E] mt-1">Recommended values: 60 to 172800 (two days)</p>
                </div>

                {/* Routing Policy */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-[#E6EDF3] mb-2 flex items-center gap-1">
                    Routing policy
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-normal cursor-pointer hover:underline">Info</span>
                  </label>
                  <select
                    value={routingPolicy}
                    onChange={(e) => setRoutingPolicy(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-1.5 text-[13px] border border-gray-400 dark:border-[#484F58] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-sm bg-white dark:bg-[#0D1117] text-gray-900 dark:text-[#E6EDF3]"
                  >
                    <option value="simple">Simple routing</option>
                    <option value="weighted">Weighted routing</option>
                    <option value="latency">Latency routing</option>
                    <option value="failover">Failover routing</option>
                    <option value="multivalue">Multivalue answer routing</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end pb-4 border-b border-gray-200 dark:border-[#30363D]">
                <button type="button" className="px-4 py-1 text-[13px] font-bold text-gray-700 dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] border border-gray-400 dark:border-[#484F58] rounded-sm hover:bg-gray-50 dark:hover:bg-[#30363D] shadow-sm">
                  Add another record
                </button>
              </div>

              <div className="mt-4 flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={loading}
                  className="px-4 py-1 text-[13px] font-bold text-gray-700 dark:text-[#C9D1D9] hover:underline disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (!value.trim() && !isAlias)}
                  className="px-4 py-1 text-[13px] font-bold text-[#0D1117] bg-[#FF9900] hover:bg-[#E68900] rounded-sm transition-colors disabled:opacity-50 disabled:hover:bg-[#FF9900] shadow-sm flex items-center gap-2"
                >
                  {loading && <span className="w-3.5 h-3.5 border-2 border-[#0D1117]/30 border-t-[#0D1117] rounded-full animate-spin" />}
                  {initialData ? 'Save changes' : 'Create records'}
                </button>
              </div>
            </div>
          </div>

          {/* View existing records accordion */}
          <div className="mt-8">
            <button 
              type="button" 
              onClick={() => setShowExisting(!showExisting)}
              className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-[#E6EDF3]"
            >
              {showExisting ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              View existing records
            </button>
            <p className="text-[13px] text-gray-600 dark:text-[#8B949E] mt-1 ml-6">
              The following table lists the existing records in {zoneName}.
            </p>
            {showExisting && (
              <div className="mt-4 ml-6 p-4 border border-gray-300 dark:border-[#484F58] rounded bg-white dark:bg-[#161B22] text-sm text-gray-500">
                (Records table preview would appear here)
              </div>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
