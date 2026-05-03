import { useState, useEffect, useMemo } from 'react';
import {
  Clock, Users, DollarSign, TrendingUp,
  Search, ChevronLeft, ChevronRight, X, FileText
} from 'lucide-react';


const getToken = () => localStorage.getItem('token');
const headers = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const MOIS_LABELS = [
  { value: '01', label: 'Janvier' }, { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' }, { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' }, { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' }, { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' }, { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' },
];

const ITEMS_PAR_PAGE = 8;

const avatarColors = [
  'bg-gradient-to-br from-purple-400 to-purple-600',
  'bg-gradient-to-br from-emerald-400 to-emerald-600',
  'bg-gradient-to-br from-amber-400 to-amber-600',
  'bg-gradient-to-br from-violet-400 to-violet-600',
  'bg-gradient-to-br from-pink-400 to-pink-600',
  'bg-gradient-to-br from-teal-400 to-teal-600',
  'bg-gradient-to-br from-orange-400 to-orange-600',
  'bg-gradient-to-br from-cyan-400 to-cyan-600',
];

export default function Heures() {
  const [donnees, setDonnees] = useState([]);
  const [resume, setResume] = useState([]);
  const [totaux, setTotaux] = useState({ total_reelles: 0, total_equiv_td: 0, total_montant: 0, nb_enseignants: 0 });
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState('liste');
  const [search, setSearch] = useState('');
  const [filtreMois, setFiltreMois] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search, filtreMois]);

  const fetchDonnees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtreMois) params.set('mois', filtreMois);

      const [resListe, resResume] = await Promise.all([
        fetch(`/api/heures?${params.toString()}`, { headers: headers() }).then((r) => r.ok ? r.json().catch(() => ({})) : ({})),
        fetch(`/api/heures/resume?${params.toString()}`, { headers: headers() }).then((r) => r.ok ? r.json().catch(() => ({})) : ({})),
      ]);

      if (resListe?.succes && Array.isArray(resListe.donnees)) {
        setDonnees(resListe.donnees);
        setTotaux(resListe.totaux || { total_reelles: 0, total_equiv_td: 0, total_montant: 0, nb_enseignants: 0 });
      } else {
        setDonnees([]);
      }

      if (resResume?.succes && Array.isArray(resResume.donnees)) {
        setResume(resResume.donnees);
      } else {
        setResume([]);
      }
    } catch {
      setDonnees([]);
      setResume([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDonnees(); }, [filtreMois]);

  const donneesFiltrees = useMemo(() => {
    if (!search) return donnees;
    const term = search.toLowerCase();
    return donnees.filter((d) =>
      (d.enseignant_nom || '').toLowerCase().includes(term) ||
      (d.enseignant_prenom || '').toLowerCase().includes(term) ||
      (d.matiere_nom || '').toLowerCase().includes(term) ||
      (d.classe_nom || '').toLowerCase().includes(term) ||
      (d.matricule || '').toLowerCase().includes(term)
    );
  }, [donnees, search]);

  const totalPages = Math.ceil(donneesFiltrees.length / ITEMS_PAR_PAGE);
  const paginees = donneesFiltrees.slice((page - 1) * ITEMS_PAR_PAGE, page * ITEMS_PAR_PAGE);

  const resumeFiltrees = useMemo(() => {
    if (!search) return resume;
    const term = search.toLowerCase();
    return resume.filter((d) =>
      (d.nom || '').toLowerCase().includes(term) ||
      (d.prenom || '').toLowerCase().includes(term) ||
      (d.matricule || '').toLowerCase().includes(term) ||
      (d.departement_nom || '').toLowerCase().includes(term)
    );
  }, [resume, search]);

  const formatMontant = (v) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(v || 0);
  const formatHeures = (v) => parseFloat(v || 0).toFixed(1);

  return (
    <div className="space-y-6">

      {/* ─── En-tête ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Teacher's Plan</span>
            <ChevronRight size={12} />
            <span>Heures effectuées</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F2B46]">Heures effectuées</h1>
          <p className="text-gray-500 text-sm mt-0.5">Suivi et gestion des heures de cours réalisées</p>
        </div>
        <button
          onClick={fetchDonnees}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md shadow-purple-200"
        >
          <FileText size={16} />
          Actualiser
        </button>
      </div>

      {/* ─── Cartes statistiques ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-5 shadow-lg">
          <Clock className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Heures réelles</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? <span className="inline-block w-16 h-8 bg-white/20 rounded animate-pulse" /> : (formatHeures(totaux.total_reelles) + ' h')}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 shadow-lg">
          <TrendingUp className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Heures équiv. TD</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? <span className="inline-block w-16 h-8 bg-white/20 rounded animate-pulse" /> : (formatHeures(totaux.total_equiv_td) + ' h')}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 shadow-lg">
          <DollarSign className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Montant total</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? <span className="inline-block w-24 h-8 bg-white/20 rounded animate-pulse" /> : formatMontant(totaux.total_montant)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-5 shadow-lg">
          <Users className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Enseignants concernés</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? <span className="inline-block w-16 h-8 bg-white/20 rounded animate-pulse" /> : (totaux.nb_enseignants ?? 0)}
          </p>
        </div>
      </div>

      {/* ─── Filtres ─── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, matière, classe, matricule..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={filtreMois}
          onChange={(e) => setFiltreMois(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none min-w-[150px]"
        >
          <option value="">Tous les mois</option>
          {MOIS_LABELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      {/* ─── Onglets ─── */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setOnglet('liste')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            onglet === 'liste' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Liste des heures
        </button>
        <button
          onClick={() => setOnglet('resume')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            onglet === 'resume' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Résumé par enseignant
        </button>
      </div>

      {/* ─── Contenu ─── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      ) : onglet === 'liste' ? (
        <ListeHeures
          donnees={paginees}
          total={donneesFiltrees.length}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          formatHeures={formatHeures}
          formatMontant={formatMontant}
        />
      ) : (
        <ResumeEnseignants
          donnees={resumeFiltrees}
          total={resume.length}
          formatHeures={formatHeures}
          formatMontant={formatMontant}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   COMPOSANT : Liste des heures
   ═══════════════════════════════════════════════ */
function ListeHeures({ donnees, total, page, totalPages, setPage, formatHeures, formatMontant }) {
  const typeSeanceBadge = (type) => {
    if (!type) return { label: '—', cls: 'bg-gray-100 text-gray-700' };
    const map = {
      'CM': { label: 'CM', cls: 'bg-purple-100 text-purple-700' },
      'TD': { label: 'TD', cls: 'bg-emerald-100 text-emerald-700' },
      'TP': { label: 'TP', cls: 'bg-amber-100 text-amber-700' },
    };
    return map[type] || { label: type, cls: 'bg-gray-100 text-gray-700' };
  };

  const moisLabel = (m) => {
    const found = MOIS_LABELS.find((mo) => mo.value === m);
    return found ? found.label : (m || '—');
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 via-purple-600 to-violet-600">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Enseignant</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Matière</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Classe</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Type</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Mois</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">H. réelles</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">H. equiv TD</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {donnees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    {total === 0 ? 'Aucune heure enregistrée' : 'Aucun résultat trouvé'}
                  </td>
                </tr>
              ) : (
                donnees.map((d, i) => {
                  const t = typeSeanceBadge(d.type_seance);
                  return (
                    <tr key={d.id} className={`transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-purple-50/40'} hover:bg-purple-50/70`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm`}>
                            {(d.enseignant_prenom || '?')[0]}{(d.enseignant_nom || '?')[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#0F2B46] truncate">{d.enseignant_prenom} {d.enseignant_nom}</p>
                            <p className="text-xs text-gray-400">{d.matricule || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-gray-700 font-medium">{d.matiere_nom || '—'}</p>
                        <p className="text-xs text-gray-400">{d.matiere_code || ''}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{d.classe_nom || '—'}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${t.cls}`}>{t.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-sm text-gray-600">{moisLabel(d.mois)}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-[#0F2B46]">{formatHeures(d.heures_reelles)}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-purple-600">{formatHeures(d.heures_equiv_td)}</td>
                      <td className="px-5 py-3.5 text-right text-sm text-gray-700">{formatMontant(d.montant_calcule)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Pagination ─── */}
      {total > ITEMS_PAR_PAGE && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm text-gray-500">
            Affichage {(page - 1) * ITEMS_PAR_PAGE + 1}-{Math.min(page * ITEMS_PAR_PAGE, total)} sur {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   COMPOSANT : Résumé par enseignant
   ═══════════════════════════════════════════════ */
function ResumeEnseignants({ donnees, total, formatHeures, formatMontant }) {
  const gradeBadge = (cat) => {
    if (!cat) return { label: '—', cls: 'bg-gray-100 text-gray-700' };
    const map = {
      'A': { label: 'A', cls: 'bg-purple-100 text-purple-700' },
      'B': { label: 'B', cls: 'bg-emerald-100 text-emerald-700' },
      'C': { label: 'C', cls: 'bg-amber-100 text-amber-700' },
      'D': { label: 'D', cls: 'bg-violet-100 text-violet-700' },
    };
    return map[cat] || { label: cat, cls: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 via-purple-600 to-violet-600">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Enseignant</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Département</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Catégorie</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Séances</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">H. réelles</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">H. equiv TD</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {donnees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    {total === 0 ? 'Aucune donnée de résumé' : 'Aucun résultat trouvé'}
                  </td>
                </tr>
              ) : (
                donnees.map((d, i) => {
                  const g = gradeBadge(d.categorie);
                  return (
                    <tr key={d.id} className={`transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-purple-50/40'} hover:bg-purple-50/70`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm`}>
                            {(d.prenom || '?')[0]}{(d.nom || '?')[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#0F2B46] truncate">{d.prenom} {d.nom}</p>
                            <p className="text-xs text-gray-400">{d.matricule || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{d.departement_nom || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${g.cls}`}>{g.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-sm font-semibold text-[#0F2B46]">{d.nb_seances || 0}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-[#0F2B46]">{formatHeures(d.total_reelles)}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-purple-600">{formatHeures(d.total_equiv_td)}</td>
                      <td className="px-5 py-3.5 text-right text-sm text-gray-700">{formatMontant(d.total_montant)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}