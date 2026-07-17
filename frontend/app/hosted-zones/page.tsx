'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/data-table/DataTable';
import { ZoneFormModal } from '@/components/modals/ZoneFormModal';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { fetchApi } from '@/lib/api';
import { HostedZone, PaginatedResponse } from '@/lib/types';
import { useToast } from '@/components/notifications/ToastProvider';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function HostedZonesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteZone, setDeleteZone] = useState<HostedZone | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { addToast } = useToast();
  const router = useRouter();

  const fetchZones = async (page: number, search: string): Promise<PaginatedResponse<HostedZone>> => {
    let url = `/zones?page=${page}&page_size=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return await fetchApi(url);
  };

  const handleCreate = async (data: any) => {
    try {
      await fetchApi('/zones', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      addToast('Hosted zone created successfully', 'success');
      setRefreshKey(k => k + 1);
    } catch (e: any) {
      addToast(e.message || 'Failed to create hosted zone', 'error');
      throw e;
    }
  };

  const handleDelete = async () => {
    if (!deleteZone) return;
    setDeleting(true);
    try {
      await fetchApi(`/zones/${deleteZone.id}`, { method: 'DELETE' });
      addToast(`Hosted zone ${deleteZone.name} deleted`, 'success');
      setDeleteZone(null);
      setRefreshKey(k => k + 1);
    } catch (e: any) {
      addToast(e.message || 'Failed to delete hosted zone', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { 
      header: 'Hosted zone name', 
      cell: (item: HostedZone) => (
        <Link href={`/hosted-zones/${item.id}`} className="text-blue-600 hover:underline hover:text-blue-800 font-medium">
          {item.name}
        </Link>
      )
    },
    { header: 'Type', accessorKey: 'type' as keyof HostedZone },
    { 
      header: 'Record count', 
      cell: () => <span className="text-slate-500">-</span> // We don't return count directly in MVP to save DB joins
    },
    { header: 'Comment', accessorKey: 'comment' as keyof HostedZone },
    { 
      header: 'Actions', 
      cell: (item: HostedZone) => (
        <button 
          onClick={(e) => { e.stopPropagation(); setDeleteZone(item); }}
          className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Hosted zones</h1>
        <p className="text-sm text-slate-500 mt-1">
          A hosted zone is a container for records, and records contain information about how you want to route traffic for a specific domain.
        </p>
      </div>

      <DataTable
        key={refreshKey}
        title="Hosted zones"
        columns={columns}
        fetchData={fetchZones}
        searchPlaceholder="Find hosted zones by name"
        createButtonText="Create hosted zone"
        onCreateClick={() => setIsCreateOpen(true)}
      />

      <ZoneFormModal 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteZone}
        onClose={() => setDeleteZone(null)}
        onConfirm={handleDelete}
        title="Delete Hosted Zone"
        message={
          <>
            Are you sure you want to delete the hosted zone <strong>{deleteZone?.name}</strong>? This action cannot be undone.
          </>
        }
        loading={deleting}
      />
    </div>
  );
}
