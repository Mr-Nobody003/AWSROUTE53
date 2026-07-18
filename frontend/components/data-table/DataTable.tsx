'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, RefreshCw, Plus, Loader2, Settings } from 'lucide-react';
import { cn } from '../notifications/ToastProvider';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  width?: number; // Optional initial width
}

interface DataTableProps<T> {
  columns: Column<T>[];
  fetchData: (page: number, search: string) => Promise<{ items: T[]; total: number }>;
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
  createButtonText?: string;
  onCreateClick?: () => void;
  title?: string;
  enableSelection?: boolean;
  onSelectionChange?: (selectedIds: string[] | number[]) => void;
  renderToolbarActions?: (selectedItems: T[]) => React.ReactNode;
  hideHeader?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  fetchData,
  onRowClick,
  searchPlaceholder = 'Search',
  createButtonText,
  onCreateClick,
  title,
  enableSelection,
  onSelectionChange,
  renderToolbarActions,
  hideHeader = false,
}: DataTableProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
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
    setSelectedIds([]); // Clear selection on reload
  }, [loadData]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedIds as any);
    }
  }, [selectedIds, onSelectionChange]);

  const toggleSelection = (id: string | number) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === items.length && items.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const startResize = (index: number, e: React.MouseEvent, defaultWidth: number = 150) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = columnWidths[index] || defaultWidth;
    
    const doDrag = (dragEvent: MouseEvent) => {
      setColumnWidths(prev => ({
        ...prev,
        [index]: Math.max(50, startWidth + dragEvent.clientX - startX)
      }));
    };
    
    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
    
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const totalPages = Math.ceil(total / pageSize) || 1;
  const from = total === 0 ? 0 : Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);

  const selectedItems = items.filter(item => selectedIds.includes(item.id));

  return (
    <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#21262D] rounded-xl overflow-hidden shadow-sm">
      {/* Header/Title area */}
      {!hideHeader && title && (
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#21262D]">
          <h2 className="text-base font-semibold text-slate-900 dark:text-[#E6EDF3]">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-[#8B949E] mt-0.5">{total} resource{total !== 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-[#21262D] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 bg-gray-50 dark:bg-[#0D1117]/50">
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          {/* Refresh */}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-1.5 rounded bg-white dark:bg-[#21262D] border border-slate-300 dark:border-[#30363D] text-slate-600 dark:text-[#C9D1D9] hover:bg-slate-50 dark:hover:bg-[#30363D] transition-colors disabled:opacity-50 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
          
          {/* Render custom toolbar actions passed from parent */}
          {renderToolbarActions && renderToolbarActions(selectedItems)}

          {/* Create */}
          {createButtonText && onCreateClick && (
            <button
              id="create-resource-btn"
              onClick={onCreateClick}
              className="px-4 py-1.5 rounded font-semibold text-sm bg-[#FF9900] hover:bg-[#E68900] text-[#0D1117] transition-colors shadow-sm ml-auto lg:ml-2"
            >
              {createButtonText}
            </button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-white dark:bg-[#0D1117] border border-slate-300 dark:border-[#30363D] rounded text-slate-900 dark:text-[#E6EDF3] placeholder-slate-500 focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-[#1A1F27] border-b border-gray-200 dark:border-[#30363D]">
              {enableSelection && (
                <th className="w-10 px-4 py-2 border-r border-gray-200 dark:border-[#30363D]">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === items.length && items.length > 0}
                    onChange={toggleAll}
                    className="accent-[#FF9900] cursor-pointer rounded-sm border-gray-300"
                  />
                </th>
              )}
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-[#C9D1D9] border-r border-gray-200 dark:border-[#30363D] relative select-none whitespace-nowrap"
                  style={{ width: columnWidths[i] || col.width || 'auto', minWidth: '50px' }}
                >
                  {col.header}
                  {/* Resizer Handle */}
                  <div
                    onMouseDown={(e) => startResize(i, e, col.width || 150)}
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[#FF9900]/50 z-10 touch-none group"
                  >
                    <div className="absolute right-0 top-1/4 bottom-1/4 w-[1px] bg-gray-300 dark:bg-gray-600 group-hover:bg-[#FF9900]" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (enableSelection ? 1 : 0)} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 text-[#FF9900] animate-spin" />
                    <span className="text-sm text-slate-500">Loading resources...</span>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (enableSelection ? 1 : 0)} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm text-slate-500 font-medium">No resources found</span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    'border-b border-gray-200 dark:border-[#21262D] bg-white dark:bg-transparent hover:bg-blue-50 dark:hover:bg-[#1C2128]/50 transition-colors',
                    onRowClick && 'cursor-pointer',
                    selectedIds.includes(item.id) && 'bg-blue-50/50 dark:bg-[#1C2128]'
                  )}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {enableSelection && (
                    <td className="px-4 py-2 w-10 border-r border-gray-200 dark:border-[#30363D]" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="accent-[#FF9900] cursor-pointer rounded-sm border-gray-300"
                      />
                    </td>
                  )}
                  {columns.map((col, i) => (
                    <td key={i} className="px-4 py-2 border-r border-gray-200 dark:border-[#30363D] text-gray-900 dark:text-[#E6EDF3]">
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
      <div className="px-4 py-2 border-t border-slate-200 dark:border-[#21262D] flex items-center justify-end gap-4 bg-gray-50 dark:bg-[#0D1117]/50">
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded text-slate-600 dark:text-[#C9D1D9] hover:bg-slate-200 dark:hover:bg-[#30363D] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-slate-700 dark:text-[#E6EDF3] tabular-nums font-medium">
            {page}
          </span>
          <button
            disabled={page === totalPages || total === 0}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded text-slate-600 dark:text-[#C9D1D9] hover:bg-slate-200 dark:hover:bg-[#30363D] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button className="p-1 rounded text-slate-600 dark:text-[#C9D1D9] hover:bg-slate-200 dark:hover:bg-[#30363D] transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

