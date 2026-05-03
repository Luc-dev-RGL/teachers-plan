import Pagination from '../../components/ui/Pagination.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Users, Pencil, Trash2 } from 'lucide-react';

export default function ListeEnseignants({ enseignants, total, page, parPage, onPageChange, onModifier, onSupprimer, peutModifier }) {
  if (enseignants.length === 0) {
    return <EmptyState message="Aucun enseignant trouvé" icone={Users} />;
  }

  return (
    <div className="card overflow-hidden">
      <div className="table-container border-0 rounded-none">
        <table className="data-table">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom complet</th>
              <th>Email</th>
              <th>Département</th>
              <th>Grade</th>
              <th>Statut</th>
              {peutModifier && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {enseignants.map((e) => (
              <tr key={e.id}>
                <td className="font-mono text-xs">{e.matricule}</td>
                <td className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-navy/10 flex items-center justify-center text-navy text-[10px] font-bold shrink-0">
                      {e.prenom?.[0]}{e.nom?.[0]}
                    </div>
                    <span>{e.prenom} {e.nom}</span>
                  </div>
                </td>
                <td className="text-slate-500">{e.email || e.utilisateur?.email}</td>
                <td>{e.departement?.nom || '—'}</td>
                <td>
                  <Badge variant={e.grade === 'PAST' ? 'info' : e.grade === 'PR' ? 'succes' : 'default'}>
                    {e.grade || '—'}
                  </Badge>
                </td>
                <td>
                  <Badge variant={e.actif !== false ? 'succes' : 'danger'}>
                    {e.actif !== false ? 'Actif' : 'Inactif'}
                  </Badge>
                </td>
                {peutModifier && (
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onModifier(e)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onSupprimer(e.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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