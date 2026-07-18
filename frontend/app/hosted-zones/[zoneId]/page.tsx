'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/data-table/DataTable';
import { RecordFormModal } from '@/components/modals/RecordFormModal';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { ZoneFormModal } from '@/components/modals/ZoneFormModal';
import { fetchApi, getBackendUrl } from '@/lib/api';
import { Record, HostedZone, PaginatedResponse } from '@/lib/types';
import { useToast } from '@/components/notifications/ToastProvider';
import { Trash2, Edit2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ZoneDetailsPage({ params }: { params: { zoneId: string } }) {
  const [zone, setZone] = useState<HostedZone | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Record | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<Record | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [isEditZoneOpen, setIsEditZoneOpen] = useState(false);
  const [isDeleteZoneOpen, setIsDeleteZoneOpen] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchApi(`/zones/${params.zoneId}`).then(setZone).catch(e => {
      addToast('Hosted zone not found', 'error');
      router.push('/hosted-zones');
    });
  }, [params.zoneId]);

  const fetchRecords = useCallback(async (page: number, search: string) => {
    return await fetchApi(`/zones/${params.zoneId}/records?page=${page}&page_size=10&search=${search}`);
  }, [params.zoneId]);

  const handleCreate = async (data: any) => {
    try {
      if (editRecord) {
        await fetchApi(`/zones/${params.zoneId}/records/${editRecord.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        addToast('Record updated successfully', 'success');
      } else {
        await fetchApi(`/zones/${params.zoneId}/records`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
        addToast('Record created successfully', 'success');
      }
      setRefreshKey(k => k + 1);
      setEditRecord(null);
    } catch (e: any) {
      addToast(e.message || 'Failed to save record', 'error');
      throw e;
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length || !confirm(`Are you sure you want to delete ${selectedIds.length} records?`)) return;
    setBulkDeleting(true);
    try {
      await Promise.all(
        selectedIds.map(id => fetchApi(`/zones/${params.zoneId}/records/${id}`, { method: 'DELETE' }))
      );
      addToast(`Successfully deleted ${selectedIds.length} records`, 'success');
      setSelectedIds([]);
      setRefreshKey(k => k + 1);
    } catch (e: any) {
      addToast('Some records could not be deleted', 'error');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRecord) return;
    setDeleting(true);
    try {
      await fetchApi(`/zones/${params.zoneId}/records/${deleteRecord.id}`, { method: 'DELETE' });
      addToast('Record deleted', 'success');
      setDeleteRecord(null);
      setRefreshKey(k => k + 1);
    } catch (e: any) {
      addToast(e.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditZone = async (data: any) => {
    try {
      await fetchApi(`/zones/${params.zoneId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      addToast('Hosted zone updated successfully', 'success');
      setZone(prev => prev ? { ...prev, ...data } : null);
      setIsEditZoneOpen(false);
    } catch (e: any) {
      addToast(e.message || 'Failed to update hosted zone', 'error');
      throw e;
    }
  };

  const handleDeleteZone = async () => {
    setDeleting(true);
    try {
      await fetchApi(`/zones/${params.zoneId}?force=true`, { method: 'DELETE' });
      addToast('Hosted zone deleted', 'success');
      router.push('/hosted-zones');
    } catch (e: any) {
      addToast(e.message || 'Failed to delete hosted zone', 'error');
    } finally {
      setDeleting(false);
      setIsDeleteZoneOpen(false);
    }
  };

  if (!zone) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading zone details...</div>;
  }

  const columns = [
    { header: 'Record name', accessorKey: 'name' as keyof Record, width: 250 },
    { header: 'Type', accessorKey: 'type' as keyof Record, width: 80 },
    { header: 'Routing policy', accessorKey: 'routing_policy' as keyof Record, width: 120 },
    { header: 'Differentiator', cell: () => '-', width: 120 },
    { header: 'Alias', cell: () => 'No', width: 80 },
    { 
      header: 'Value/Route traffic to', 
      cell: (item: Record) => (
        <div className="max-w-[300px] truncate whitespace-pre-wrap font-mono text-xs text-blue-600 dark:text-blue-400">
          {item.value}
        </div>
      ),
      width: 250
    },
    { header: 'TTL (seconds)', accessorKey: 'ttl' as keyof Record, width: 120 },
    { header: 'Health check ID', cell: () => '-', width: 140 },
    { header: 'Evaluate target health', cell: () => '-', width: 180 }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-full mx-auto bg-gray-50 dark:bg-[#0D1117] min-h-screen font-sans">
      <div className="mb-4">
        <div className="text-sm text-gray-500 dark:text-[#8B949E] mb-2 flex items-center gap-1">
          <Link href="/hosted-zones" className="hover:underline text-blue-600 dark:text-blue-400">Route 53</Link>
          <span className="text-gray-400">&gt;</span>
          <Link href="/hosted-zones" className="hover:underline text-blue-600 dark:text-blue-400">Hosted zones</Link>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-900 dark:text-[#E6EDF3]">{zone.name}</span>
        </div>
      </div>
      
      <div className="mb-6 bg-white dark:bg-[#161B22] border border-gray-200 dark:border-[#30363D] shadow-sm">
        <div className="p-5 flex justify-between items-start border-b border-gray-200 dark:border-[#30363D]">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">Public</span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-[#E6EDF3]">{zone.name}</h1>
            <span className="text-gray-400 dark:text-gray-500 text-sm font-semibold cursor-not-allowed">Info</span>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button 
              onClick={() => setIsDeleteZoneOpen(true)}
              className="px-3 py-1 text-sm font-bold text-gray-700 dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] border border-gray-300 dark:border-[#30363D] rounded-sm hover:bg-gray-50 dark:hover:bg-[#30363D] shadow-sm transition-colors"
            >
              Delete zone
            </button>
            <button disabled className="px-3 py-1 text-sm font-bold text-gray-400 dark:text-gray-600 bg-white dark:bg-[#21262D] border border-gray-300 dark:border-[#30363D] rounded-sm cursor-not-allowed shadow-sm transition-colors">
              Test record
            </button>
            <button disabled className="px-3 py-1 text-sm font-bold text-gray-400 dark:text-gray-600 bg-white dark:bg-[#21262D] border border-gray-300 dark:border-[#30363D] rounded-sm cursor-not-allowed shadow-sm transition-colors">
              Configure query logging
            </button>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-[#E6EDF3] flex items-center gap-2">
              <span className="text-xs">▼</span> Hosted zone details
            </h2>
            <button 
              onClick={() => setIsEditZoneOpen(true)}
              className="px-3 py-1 text-sm font-bold text-gray-700 dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] border border-gray-300 dark:border-[#30363D] rounded-sm hover:bg-gray-50 dark:hover:bg-[#30363D] shadow-sm transition-colors"
            >
              Edit hosted zone
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
            <div className="space-y-4">
              <div>
                <div className="text-gray-500 dark:text-[#8B949E] mb-1">Hosted zone name</div>
                <div className="font-medium text-gray-900 dark:text-[#E6EDF3]">{zone.name}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-[#8B949E] mb-1">Hosted zone ID</div>
                <div className="font-medium text-gray-900 dark:text-[#E6EDF3]">{zone.id}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-[#8B949E] mb-1">Description</div>
                <div className="font-medium text-gray-900 dark:text-[#E6EDF3]">{zone.comment || '-'}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-gray-500 dark:text-[#8B949E] mb-1">Query log</div>
                <div className="font-medium text-gray-900 dark:text-[#E6EDF3]">-</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-[#8B949E] mb-1">Type</div>
                <div className="font-medium text-gray-900 dark:text-[#E6EDF3]">{zone.type}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-[#8B949E] mb-1">Record count</div>
                <div className="font-medium text-gray-900 dark:text-[#E6EDF3]">5</div>
              </div>
            </div>
            
            <div className="col-span-2">
              <div className="text-gray-500 dark:text-[#8B949E] mb-1">Name servers</div>
              <div className="bg-[#FFE5B4] dark:bg-yellow-900/30 border border-[#F5C277] dark:border-yellow-700/50 p-2 inline-block rounded-sm">
                <div className="font-mono text-[13px] text-gray-900 dark:text-yellow-100/90 leading-tight">
                  {`ns-850.awsdns-42.net\nns-1809.awsdns-34.co.uk\nns-1045.awsdns-02.org\nns-467.awsdns-58.com`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-[#30363D] mb-6 overflow-x-auto bg-white dark:bg-[#161B22]">
        <button className="px-6 py-3 text-sm font-bold text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 whitespace-nowrap">
          Records (5)
        </button>
        <button disabled className="px-6 py-3 text-sm font-bold text-gray-400 dark:text-gray-600 cursor-not-allowed whitespace-nowrap">
          DNSSEC signing
        </button>
        <button disabled className="px-6 py-3 text-sm font-bold text-gray-400 dark:text-gray-600 cursor-not-allowed whitespace-nowrap">
          Hosted zone tags (0)
        </button>
      </div>

      <div className="mb-3 bg-white dark:bg-[#161B22] p-4 border border-b-0 border-gray-200 dark:border-[#30363D] shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 dark:text-[#E6EDF3] flex items-center gap-2">
          Records (1/5) <span className="text-gray-400 dark:text-gray-500 text-sm cursor-not-allowed font-normal">Info</span>
        </h2>
        <p className="text-[13px] text-gray-500 dark:text-[#8B949E] mt-1">
          The following table lists the existing records in {zone.name}. You can't delete the SOA record or the NS record named {zone.name}.
        </p>
      </div>

      <div className="-mt-3">
        <DataTable 
          key={refreshKey}
          hideHeader
          columns={columns} 
          fetchData={fetchRecords}
          searchPlaceholder="Filter records by property or value"
          createButtonText="Create record"
          onCreateClick={() => {
            setEditRecord(null);
            setIsCreateOpen(true);
          }}
          enableSelection
          onSelectionChange={(ids) => setSelectedIds(ids as string[])}
          renderToolbarActions={(selected) => (
            <div className="flex gap-2 mr-2">
              <button
                onClick={() => {
                  if (selected.length !== 1) return;
                  setEditRecord(selected[0] as any);
                  setIsCreateOpen(true);
                }}
                disabled={selected.length !== 1}
                className="px-3 py-1 text-sm font-bold text-gray-700 dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] border border-gray-300 dark:border-[#30363D] rounded-sm hover:bg-gray-50 dark:hover:bg-[#30363D] shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Edit record
              </button>
              <button
                onClick={() => {
                  if (selected.length === 0) return;
                  if (selected.length === 1) {
                    if ((selected[0] as any).is_default) {
                      addToast("Cannot delete default NS or SOA records.", "error");
                      return;
                    }
                    setDeleteRecord(selected[0] as any);
                  } else {
                    handleBulkDelete();
                  }
                }}
                disabled={selected.length === 0 || bulkDeleting}
                className="px-3 py-1 text-sm font-bold text-gray-700 dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] border border-gray-300 dark:border-[#30363D] rounded-sm hover:bg-gray-50 dark:hover:bg-[#30363D] shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {bulkDeleting ? (
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : null}
                Delete record
              </button>
              
              <label className="px-3 py-1 text-sm font-bold text-gray-700 dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] border border-gray-300 dark:border-[#30363D] rounded-sm hover:bg-gray-50 dark:hover:bg-[#30363D] cursor-pointer transition-colors shadow-sm whitespace-nowrap">
                Import zone file
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".zone,.txt" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const textContent = await file.text();
                      
                      await fetchApi(`/zones/${zone.id}/import`, {
                        method: 'POST',
                        body: textContent,
                        headers: {
                          'Content-Type': 'text/plain',
                        }
                      });
                      
                      addToast('Zone file imported successfully', 'success');
                      setRefreshKey(k => k + 1);
                    } catch (err: any) {
                      addToast(err.message, 'error');
                    }
                    e.target.value = '';
                  }}
                />
              </label>

              <button
                onClick={() => {
                  window.location.href = `${getBackendUrl()}/zones/${zone.id}/export?format=json`;
                }}
                className="px-3 py-1 text-sm font-bold text-gray-700 dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] border border-gray-300 dark:border-[#30363D] rounded-sm hover:bg-gray-50 dark:hover:bg-[#30363D] shadow-sm transition-colors whitespace-nowrap"
              >
                Export JSON
              </button>
              
              <button
                onClick={() => {
                  window.location.href = `${getBackendUrl()}/zones/${zone.id}/export?format=bind`;
                }}
                className="px-3 py-1 text-sm font-bold text-gray-700 dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] border border-gray-300 dark:border-[#30363D] rounded-sm hover:bg-gray-50 dark:hover:bg-[#30363D] shadow-sm transition-colors whitespace-nowrap"
              >
                Export BIND
              </button>
            </div>
          )}
        />
      </div>

      <RecordFormModal 
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditRecord(null);
        }}
        onSubmit={handleCreate}
        initialData={editRecord}
        zoneName={zone.name}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteRecord}
        onClose={() => setDeleteRecord(null)}
        onConfirm={handleDelete}
        title="Delete Record"
        message={<>Are you sure you want to delete <strong className="text-slate-900 dark:text-[#E6EDF3]">{deleteRecord?.name}</strong>? This action cannot be undone.</>}
        loading={deleting}
      />

      <ZoneFormModal
        isOpen={isEditZoneOpen}
        onClose={() => setIsEditZoneOpen(false)}
        onSubmit={handleEditZone}
        initialData={zone}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteZoneOpen}
        onClose={() => setIsDeleteZoneOpen(false)}
        onConfirm={handleDeleteZone}
        title="Delete Hosted Zone"
        message={<>Are you sure you want to delete <strong className="text-slate-900 dark:text-[#E6EDF3]">{zone.name}</strong>? All DNS records within this zone will be permanently removed.</>}
        loading={deleting}
      />
    </div>
  );
}
