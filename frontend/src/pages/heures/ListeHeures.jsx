import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import Chargement from '../../components/ui/Chargement.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Select from '../../components/ui/Select.jsx';
import { Clock, Search, CheckCircle, XCircle } from 'lucide-react';

export default function ListeHeures({ cle }) {
  const { utilisateur } = utiliserAuth();
  const role = utilisateur?.role || 'enseignant';
  const [heures, setHeures] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [filtreEnseignant, setFiltreEnseignant] = useState('');
  const [filtreMois, setFiltreMois] = useState('');
  const [page, setPage] = useState(1);
  const parPage = 15;

  useEffect(() => {
    const fetch = async () => {
      setChargement(true);
      try {
        const [resH, resE] = await Promise.all([
          api.get('/heures'),
          api.get('/enseignants'),
        ]);
        setHeures(resH.data);
        setEnseignants(resE.data);
      } catch {
        setHeures([]);
      } finally {
        setChargement(false);
      }
    };
    fetch();
  }, [cle]);

  const filtered = heures.filter((h) => {
    const t = recherche.toLowerCase();
    if (filtreEnseignant && h.enseignant_id !== filtreEnseignant) return false;
    if (filtreMois && h.mois !== filtreMois) return false;
    if (t) {
      const nom = `${h.enseignant?.prenom || ''} ${h.enseignant?.nom || ''}`.toLowerCase();
      return nom.includes(t);
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * parPage, page * parPage);
  const totalMontant = filtered.reduce((s, h) => s + (h.montant || 0), 0);
  const totalHeures = filtered.reduce((s, h) => s + (h.heures_equiv_td || 0), 0);

  const valider = async (id) => {
    try {
      await api.put(`/heures/${id}/valider`);
      setHeures((prev) => prev.map((h) => (h.id === id ? { ...h, statut: 'validee' } : h)));
    } catch {}
  };

  const rejeter = async (id) => {
    try {
      await api.put(`/heures/${id}/rejeter`);
      setHeures((prev) => prev.map((h) => (h.id === id ? { ...h, statut: 'rejetee' } : h)));
    } catch {}
  };

  if (chargement) return <Chargement />;
  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} placeholder="Rechercher un enseignant..." className="input-field pl-9" />
        </div>
        <Select valeur={filtreEnseignant} onChange={(v) => { setFiltreEnseignant(v); setPage(1); }} placeholder="Tous les enseignants" options={enseignants.map((e) => ({ value: e.id, label: `${e.prenom} ${e.nom}` }))} />
        <Select valeur={filtreMois} onChange={(v) => { setFiltreMois(v); setPage(1); }} placeholder="Tous les mois" options={[{ value: '01', label: 'Janvier' }, { value: '02', label: 'Février' }, { value: '03', label: 'Mars' }, { value: '04', label: 'Avril' }, { value: '05', label: 'Mai' }, { value: '06', label: 'Juin' }, { value: '07', label: 'Juillet' }, { value: '08', label: 'Août' }, { value: '09', label: 'Septembre' }, { value: '10', label: 'Octobre' }, { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' }]} />
      </div>

      {/* Totaux */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500">Heures équiv. TD</p>
          <p className="text-xl font-bold text-midnight">{totalHeures.toFixed(2)}h</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500">Montant total</p>
          <p className="text-xl font-bold text-green-600">{new Intl.NumberFormat('fr-FR').format(totalMontant)} FCFA</p>
        </div>
      </div>

      {/* Tableau */}
      {paginated.length === 0 ? (
        <EmptyState message="Aucune heure trouvée" icone={Clock} />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container border-0 rounded-none">
            <table className="data-table">
              <thead>
                <tr><th>Enseignant</th><th>Mois</th><th>Heures réelles</th><th>Heures equiv. TD</th><th>Taux</th><th>Montant</th><th>Statut</th>{(role === 'rh' || role === 'admin') && <th className="text-right">Actions</th>}</tr>
              </thead>
              <tbody>
                {paginated.map((h) => (
                  <tr key={h.id}>
                    <td className="font-medium">{h.enseignant?.prenom} {h.enseignant?.nom}</td>
                    <td>{h.mois}/{h.annee}</td>
                    <td>{h.heures_reelles}h</td>
                    <td className="font-medium">{h.heures_equiv_td}h</td>
                    <td>{h.taux_horaire ? new Intl.NumberFormat('fr-FR').format(h.taux_horaire) + ' FCFA' : '—'}</td>
                    <td className="font-medium text-green-600">{new Intl.NumberFormat('fr-FR').format(h.montant)} FCFA</td>
                    <td><Badge variant={h.statut === 'validee' ? 'succes' : h.statut === 'rejetee' ? 'danger' : 'warning'}>{h.statut === 'validee' ? 'Validée' : h.statut === 'rejetee' ? 'Rejetée' : 'En attente'}</Badge></td>
                    {(role === 'rh' || role === 'admin') && h.statut === 'en_attente' && (
                      <td className="text-right">
                        <button onClick={() => valider(h.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600"><CheckCircle size={15} /></button>
                        <button onClick={() => rejeter(h.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><XCircle size={15} /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3">
            <Pagination page={page} total={filtered.length} parPage={parPage} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}