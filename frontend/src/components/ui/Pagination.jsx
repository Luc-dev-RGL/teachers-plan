import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, total, parPage, onPageChange }) {
  const totalPages = Math.ceil(total / parPage);
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-slate-500">
        {(page - 1) * parPage + 1}–{Math.min(page * parPage, total)} sur {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {pages[0] > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="px-3 py-1 rounded-lg text-sm hover:bg-slate-100">1</button>
            {pages[0] > 2 && <span className="px-1 text-slate-400">…</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              p === page ? 'bg-navy text-white' : 'hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ))}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
            <button onClick={() => onPageChange(totalPages)} className="px-3 py-1 rounded-lg text-sm hover:bg-slate-100">
              {totalPages}
            </button>
          </>
        )}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}