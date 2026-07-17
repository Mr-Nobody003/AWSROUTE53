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

  const fetchRecords = async (page: number, search: string): Promise<PaginatedResponse<Record>> => {
    let url = `/zones/${params.zoneId}/records?page=${page}&page_size=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return await fetchApi(url);
  };

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
      addToast(e.message || `Failed to ${editRecord ? 'update' : 'create'} record`, 'error');
      throw e;
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
      
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">{zone.name}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <div className="text-slate-500 mb-1">Hosted zone ID</div>
            <div className="font-medium text-slate-900">{zone.id}</div>
          </div>
          <div>
            <div className="text-slate-500 mb-1">Type</div>
            <div className="font-medium text-slate-900">{zone.type}</div>
          </div>
          <div className="col-span-2">
            <div className="text-slate-500 mb-1">Description</div>
            <div className="font-medium text-slate-900">{zone.comment || '-'}</div>
          </div>
        </div>
      </div>

      <DataTable
        key={refreshKey}
        title="Records"
        columns={columns}
        fetchData={fetchRecords}
        searchPlaceholder="Find records by name"
        createButtonText="Create record"
        onCreateClick={() => {
          setEditRecord(null);
          setIsCreateOpen(true);
        }}
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
