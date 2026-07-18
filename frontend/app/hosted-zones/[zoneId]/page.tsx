'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/data-table/DataTable';
import { RecordFormModal } from '@/components/modals/RecordFormModal';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { fetchApi } from '@/lib/api';
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
      addToast(`Record ${deleteRecord.name} deleted`, 'success');
      setDeleteRecord(null);
      setRefreshKey(k => k + 1);
    } catch (e: any) {
      addToast(e.message || 'Failed to delete record', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (!zone) {
    return <div className="p-8 text-center text-slate-500">Loading zone details...</div>;
  }

  const columns = [
    { header: 'Record name', accessorKey: 'name' as keyof Record },
    { header: 'Type', accessorKey: 'type' as keyof Record },
    { header: 'Routing policy', accessorKey: 'routing_policy' as keyof Record },
    { header: 'TTL (seconds)', accessorKey: 'ttl' as keyof Record },
    { 
      header: 'Value/Route traffic to', 
      cell: (item: Record) => (
        <div className="max-w-[300px] truncate whitespace-pre-wrap font-mono text-xs">
          {item.value}
        </div>
      )
    },
    { 
      header: 'Actions', 
      cell: (item: Record) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              if (item.is_default) {
                addToast("Cannot edit default NS or SOA records directly.", "error");
                return;
              }
              setEditRecord(item);
              setIsCreateOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-blue-500 rounded hover:bg-slate-100 transition-colors"
            title="Edit record"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              if (item.is_default) {
                addToast("Cannot delete default NS or SOA records.", "error");
                return;
              }
              setDeleteRecord(item);
            }}
            className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 transition-colors"
            title="Delete record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-[1200px] mx-auto">
      <div className="mb-4">
        <Link href="/hosted-zones" className="text-orange-600 hover:underline flex items-center gap-1 text-sm font-medium w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to hosted zones
        </Link>
      </div>
      
      <div className="mb-6 bg-white dark:bg-[#161B22] p-6 rounded-lg shadow-sm border border-slate-200 dark:border-[#21262D]">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-[#E6EDF3] mb-4">{zone.name}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <div className="text-slate-500 dark:text-[#8B949E] mb-1">Hosted zone ID</div>
            <div className="font-medium text-slate-900 dark:text-[#E6EDF3]">{zone.id}</div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-[#8B949E] mb-1">Type</div>
            <div className="font-medium text-slate-900 dark:text-[#E6EDF3]">{zone.type}</div>
          </div>
          <div className="col-span-2 flex flex-col justify-between">
            <div>
              <div className="text-slate-500 dark:text-[#8B949E] mb-1">Description</div>
              <div className="font-medium text-slate-900 dark:text-[#E6EDF3]">{zone.comment || '-'}</div>
            </div>
            
            {/* Import / Export Controls */}
            <div className="flex gap-2 mt-4 items-center">
              <label className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] border border-slate-300 dark:border-[#30363D] rounded-md hover:bg-slate-50 dark:hover:bg-[#30363D] cursor-pointer transition-colors shadow-sm">
                Import BIND Zone File
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".zone,.txt" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const textContent = await file.text();
                      
                      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/${process.env.NEXT_PUBLIC_API_VERSION || 'v1'}/zones/${zone.id}/import`;
                      const res = await fetch(url, {
                        method: 'POST',
                        body: textContent,
                        headers: {
                          'Content-Type': 'text/plain',
                        }
                      });
                      
                      if (!res.ok) throw new Error('Failed to import zone file');
                      
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
                  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/${process.env.NEXT_PUBLIC_API_VERSION || 'v1'}/zones/${zone.id}/export?format=json`;
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] border border-slate-300 dark:border-[#30363D] rounded-md hover:bg-slate-50 dark:hover:bg-[#30363D] transition-colors shadow-sm"
              >
                Export JSON
              </button>
              
              <button
                onClick={() => {
                  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/${process.env.NEXT_PUBLIC_API_VERSION || 'v1'}/zones/${zone.id}/export?format=bind`;
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-[#C9D1D9] bg-white dark:bg-[#21262D] border border-slate-300 dark:border-[#30363D] rounded-md hover:bg-slate-50 dark:hover:bg-[#30363D] transition-colors shadow-sm"
              >
                Export BIND
              </button>
            </div>
          </div>
        </div>
      </div>

      <DataTable 
        key={refreshKey}
        title="Records" 
        columns={columns} 
        fetchData={fetchRecords}
        searchPlaceholder="Search by record name"
        createButtonText="Create record"
        onCreateClick={() => {
          setEditRecord(null);
          setIsCreateOpen(true);
        }}
        enableSelection
        onSelectionChange={(ids) => setSelectedIds(ids as number[])}
        bulkActions={
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm mr-2 flex items-center gap-1.5"
          >
            {bulkDeleting ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Delete Selected ({selectedIds.length})
          </button>
        }
      />

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
        message={
          <>
            Are you sure you want to delete the record <strong>{deleteRecord?.name}</strong>? This action cannot be undone.
          </>
        }
        loading={deleting}
      />
    </div>
  );
}
