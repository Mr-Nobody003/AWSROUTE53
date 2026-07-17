'use client';
import { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

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

  const getFormatHint = () => {
    switch (type) {
      case 'A': return 'Enter IPv4 addresses, one per line.';
      case 'AAAA': return 'Enter IPv6 addresses, one per line.';
      case 'CNAME': return 'Enter a single domain name.';
      case 'MX': return 'Enter priority and domain name (e.g., 10 mail.example.com).';
      case 'SRV': return 'Enter priority, weight, port, and target (e.g., 1 10 5269 xmpp.example.com).';
      case 'TXT': return 'Enter text values enclosed in quotation marks.';
      case 'CAA': return 'Enter flag, tag, and value (e.g., 0 issue "letsencrypt.org").';
      default: return 'Enter the record value.';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex max-w-full w-full sm:w-[600px]">
      <div className="absolute inset-0 bg-slate-900/20 sm:hidden" onClick={onClose} />
      <div className="relative w-full h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            {initialData ? 'Edit record' : 'Create record'}
          </h2>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Record name</label>
                <div className="flex items-center border border-slate-300 rounded overflow-hidden focus-within:ring-1 focus-within:ring-orange-500 focus-within:border-orange-500">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading || !!initialData}
                    className="w-full px-3 py-1.5 text-sm outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="www"
                  />
                  <div className="px-3 py-1.5 bg-slate-100 border-l border-slate-300 text-sm text-slate-600 whitespace-nowrap">
                    .{zoneName}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Record type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={loading || !!initialData}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 disabled:bg-slate-100 disabled:text-slate-500"
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
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">Value</label>
              <textarea 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={loading}
                rows={5}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-mono"
              />
              <div className="flex gap-2 mt-2 items-start text-sm text-slate-600">
                <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                <p>{getFormatHint()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">TTL (seconds)</label>
                <input 
                  type="number" 
                  value={ttl}
                  onChange={(e) => setTtl(parseInt(e.target.value) || 300)}
                  disabled={loading}
                  min="0"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Routing policy</label>
                <select 
                  value={routingPolicy}
                  onChange={(e) => setRoutingPolicy(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="simple">Simple routing</option>
                  <option value="weighted">Weighted routing</option>
                  <option value="latency">Latency routing</option>
                  <option value="failover">Failover routing</option>
                  <option value="multivalue">Multivalue answer routing</option>
                </select>
                {routingPolicy !== 'simple' && (
                  <p className="text-xs text-red-500 mt-1">This routing policy is not available in this clone.</p>
                )}
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
              disabled={loading || !value.trim() || routingPolicy !== 'simple'}
              className="px-4 py-1.5 text-sm font-semibold text-white bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save' : 'Create record')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
