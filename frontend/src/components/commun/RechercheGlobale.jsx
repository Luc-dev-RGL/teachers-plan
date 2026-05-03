import { Search } from 'lucide-react';

export default function RechercheGlobale({ valeur, changer, placeholder = 'Rechercher...' }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={valeur}
        onChange={(e) => changer(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
      />
    </div>
  );
}