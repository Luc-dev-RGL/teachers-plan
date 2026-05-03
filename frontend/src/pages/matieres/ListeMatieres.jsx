import Pagination from '../../components/ui/Pagination.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';

export default function ListeMatieres({ matieres, total, page, parPage, onPageChange, onModifier, onSupprimer, peutModifier }) {
  if (matieres.length === 0) return <EmptyState message="Aucune matière trouvée" icone={BookOpen} />;

  return (
    <div className="card overflow-hidden">
      <div className="table-container border-0 rounded-none">
        <table className="data-table">
          <thead>
            <tr><th>Code</th><th>Nom</th><th>Type</th><th>Crédits</th><th>Coef.</th><th>Filière</th>{peutModifier && <th className="text-right">Actions</th>}</tr>
          </thead>
          <tbody>
            {matieres.map((m) => (
              <tr key={m.id}>
                <td className="font-mono text-xs">{m.code}</td>
                <td className="font-medium">{m.nom}</td>
                <td><Badge variant={m.type_cours === 'CM' ? 'info' : m.type_cours === 'TP' ? 'succes' : 'warning'}>{m.type_cours}</Badge></td>
                <td>{m.credit}</td>
                <td>{m.coefficient}</td>
                <td className="text-slate-500">{m.filiere?.nom || '—'}</td>
                {peutModifier && (
                  <td className="text-right">
                    <button onClick={() => onModifier(m)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy"><Pencil size={15} /></button>
                    <button onClick={() => onSupprimer(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3">
        <Pagination page={page} total={total} parPage={parPage} onPageChange={onPageChange} />
      </div>
    </div>
  );
}