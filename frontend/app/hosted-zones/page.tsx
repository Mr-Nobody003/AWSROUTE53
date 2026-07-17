'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/data-table/DataTable';
import { ZoneFormModal } from '@/components/modals/ZoneFormModal';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { fetchApi } from '@/lib/api';
import { HostedZone, PaginatedResponse } from '@/lib/types';
import { useToast } from '@/components/notifications/ToastProvider';
import { Trash2, Globe, ExternalLink } from 'lucide-react';
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
        body: JSON.stringify(data),
      });
      addToast('Hosted zone created successfully', 'success');
      setRefreshKey((k) => k + 1);
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
      addToast(`Hosted zone "${deleteZone.name}" deleted`, 'success');
      setDeleteZone(null);
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      addToast(e.message || 'Failed to delete hosted zone', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Hosted Zone Name',
      cell: (item: HostedZone) => (
        <Link
          href={`/hosted-zones/${item.id}`}
          className="group flex items-center gap-2 text-[#58A6FF] hover:text-[#79BEFF] font-medium transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Globe className="w-3.5 h-3.5 text-[#484F58] group-hover:text-[#58A6FF] transition-colors flex-shrink-0" />
          {item.name}
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </Link>
      ),
    },
    {
      header: 'Type',
      cell: (item: HostedZone) => (
        <span className={item.type === 'Public' ? 'badge-public' : 'badge-private'}>
          {item.type}
        </span>
      ),
    },
    {
      header: 'Record Count',
      cell: () => <span className="text-[#484F58] tabular-nums">—</span>,
    },
    {
      header: 'Description',
      cell: (item: HostedZone) => (
        <span className="text-[#8B949E] truncate max-w-xs block">
          {(item as any).comment || <span className="text-[#484F58]">—</span>}
        </span>
      ),
    },
    {
      header: '',
      cell: (item: HostedZone) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteZone(item);
          }}
          className="p-1.5 rounded-md text-[#484F58] hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
          title="Delete zone"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-[1280px] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-[#8B949E] mb-3">
          <span>Route 53</span>
          <span className="text-[#484F58]">/</span>
          <span className="text-[#E6EDF3]">Hosted Zones</span>
        </div>
        <h1 className="text-2xl font-bold text-[#E6EDF3]">Hosted Zones</h1>
        <p className="text-sm text-[#8B949E] mt-1.5 max-w-2xl">
          A hosted zone is a container for records that define how traffic is routed for a domain and its subdomains.
        </p>
      </div>

      <DataTable
        key={refreshKey}
        title="Hosted Zones"
        columns={columns}
        fetchData={fetchZones}
        searchPlaceholder="Filter by name or ID"
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
            Are you sure you want to delete{' '}
            <strong className="text-[#E6EDF3]">{deleteZone?.name}</strong>? All DNS records within
            this zone will be permanently removed.
          </>
        }
        loading={deleting}
      />
    </div>
  );
}
