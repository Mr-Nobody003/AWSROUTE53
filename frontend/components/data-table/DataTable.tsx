'use client';
import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, RefreshCw, Plus } from 'lucide-react';
import { cn } from '../notifications/ToastProvider';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  fetchData: (page: number, search: string) => Promise<{ items: T[], total: number }>;
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
  searchPlaceholder = "Search",
  createButtonText,
  onCreateClick,
  title
}: DataTableProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, [page, search]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="bg-white border border-slate-200 shadow-sm">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800">{title} ({total})</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
            />
          </div>
          <button onClick={loadData} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded border border-slate-300">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          {createButtonText && onCreateClick && (
            <button 
              onClick={onCreateClick}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-sm font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> {createButtonText}
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 whitespace-nowrap">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  No records found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr 
                  key={item.id} 
                  className={cn(
                    "border-b border-slate-100 hover:bg-blue-50 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((col, i) => (
                    <td key={i} className="px-4 py-3">
                      {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey]) : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
        <div>
          Showing {Math.min((page - 1) * pageSize + 1, total)} to {Math.min(page * pageSize, total)} of {total}
        </div>
        <div className="flex items-center gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages || total === 0}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="p-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
