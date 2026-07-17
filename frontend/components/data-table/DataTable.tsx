'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, RefreshCw, Plus, Loader2 } from 'lucide-react';
import { cn } from '../notifications/ToastProvider';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  fetchData: (page: number, search: string) => Promise<{ items: T[]; total: number }>;
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
  createButtonText?: string;
  onCreateClick?: () => void;
  title: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  fetchData,
  onRowClick,
  searchPlaceholder = 'Search',
  createButtonText,
  onCreateClick,
  title,
}: DataTableProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchData(page, search);
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, fetchData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages = Math.ceil(total / pageSize) || 1;
  const from = total === 0 ? 0 : Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);

  return (
    <div className="bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden shadow-lg">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-[#21262D] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#E6EDF3]">{title}</h2>
          <p className="text-xs text-[#8B949E] mt-0.5">{total} resource{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#484F58]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 text-sm bg-[#0D1117] border border-[#30363D] rounded-md text-[#E6EDF3] placeholder-[#484F58] focus:outline-none focus:border-[#FF9900]/60 focus:ring-1 focus:ring-[#FF9900]/20 transition-all"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-md text-[#8B949E] hover:text-[#E6EDF3] bg-[#21262D] hover:bg-[#2D333B] border border-[#30363D] transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          </button>

          {/* Create */}
          {createButtonText && onCreateClick && (
            <button
              id="create-resource-btn"
              onClick={onCreateClick}
              className="btn-primary py-2 px-3 text-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              {createButtonText}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 text-[#FF9900] animate-spin" />
                    <span className="text-sm text-[#8B949E]">Loading resources...</span>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#21262D] flex items-center justify-center">
                      <Search className="w-5 h-5 text-[#484F58]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#8B949E] font-medium">No resources found</p>
                      {search && (
                        <p className="text-xs text-[#484F58] mt-0.5">
                          Try a different search term
                        </p>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className={cn(onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((col, i) => (
                    <td key={i}>
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                        ? String(item[col.accessorKey] ?? '-')
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3.5 border-t border-[#21262D] flex items-center justify-between">
        <span className="text-xs text-[#8B949E]">
          {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-md border border-[#30363D] bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#2D333B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-3 text-xs text-[#8B949E] tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages || total === 0}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-md border border-[#30363D] bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#2D333B] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
