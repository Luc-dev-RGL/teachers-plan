import { Download } from 'lucide-react';

export default function ExportBouton({ label = 'Exporter', exporter }) {
  return (
    <button
      onClick={exporter}
      className="flex items-center gap-2 h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
    >
      <Download size={16} />
      {label}
    </button>
  );
}