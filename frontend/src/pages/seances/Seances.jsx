import { toast } from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';
import {
   Calendar, Plus, Search, Pencil, Trash2, Clock, MapPin, Users, BookOpen,
  Filter, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, AlertTriangle,
  RefreshCw, Save, X, School, DoorOpen,
} from 'lucide-react';
const getToken = () => localStorage.getItem('token');
const fetchApi = (url, opts = {}) => fetch(url, {
  headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, ...opts,
});

// ==================== SÉANCES DE COURS ====================

export default function Seances() {
  const [seances, setSeances] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filtres
  const [search, setSearch] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [filtreAnnee, setFiltreAnnee] = useState('');
  const [page, setPage] = useState(1);
  const parPage = 8;

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDetail, setDialogDetail] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Form
  const [form, setForm] = useState({
    enseignantId: '', matiereId: '', classeId: '', salleId: '',
    anneeAcademiqueId: '', date: '', heureDebut: '', heureFin: '',
    typeSeance: 'TD', nombreHeures: 2, remarques: '',
  });

  // Données pour les selects
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [salles, setSalles] = useState([]);
  const [annees, setAnnees] = useState([]);

  // === FETCH ===
  const fetchSeances = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filtreType) params.append('type', filtreType);
      if (filtreStatut) params.append('statut', filtreStatut);
      if (filtreAnnee) params.append('annee', filtreAnnee);
      params.append('page', page);
      params.append('limit', parPage);

      const res = await fetchApi(`/api/seances?${params.toString()}`);
      const json = await res.json();
      const data = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.donnees)
            ? json.donnees
            : Array.isArray(json?.seances)
              ? json.seances
              : [];
      const totalCount = json?.total ?? (Array.isArray(data) ? data.length : 0) ?? json?.totaux?.all ?? 0;
      setSeances(data);
      setTotal(totalCount);
    } catch {
      setSeances([]);
      setTotal(0);
    }
    setLoading(false);
  }, [search, filtreType, filtreStatut, filtreAnnee, page]);

  const fetchOptions = useCallback(async () => {
    try {
      const [rEns, rMat, rCl, rSa, rAn] = await Promise.allSettled([
        fetchApi('/api/enseignants').then(r => r.json()),
        fetchApi('/api/matieres').then(r => r.json()),
        fetchApi('/api/classes').then(r => r.json()),
        fetchApi('/api/salles').then(r => r.json()),
        fetchApi('/api/annees-academiques').then(r => r.json()),
      ]);

      const normalize = (value) => Array.isArray(value)
        ? value
        : Array.isArray(value?.data)
          ? value.data
          : Array.isArray(value?.donnees)
            ? value.donnees
            : Array.isArray(value?.seances)
              ? value.seances
              : [];

      if (rEns.status === 'fulfilled') setEnseignants(normalize(rEns.value));
      if (rMat.status === 'fulfilled') setMatieres(normalize(rMat.value));
      if (rCl.status === 'fulfilled') setClasses(normalize(rCl.value));
      if (rSa.status === 'fulfilled') setSalles(normalize(rSa.value));
      if (rAn.status === 'fulfilled') setAnnees(normalize(rAn.value));
    } catch {
      setEnseignants([]);
      setMatieres([]);
      setClasses([]);
      setSalles([]);
      setAnnees([]);
    }
  }, []);

  useEffect(() => { fetchSeances(); }, [fetchSeances]);
  useEffect(() => { fetchOptions(); }, [fetchOptions]);

  // === STATS ===
  const planifiees = seances.filter(s => s.statut === 'planifiee').length;
  const effectuees = seances.filter(s => s.statut === 'effectuee').length;
  const annulees = seances.filter(s => s.statut === 'annulee').length;
  const heuresTotal = seances.reduce((acc, s) => acc + (s.nombreHeures || 0), 0);

  // === ACTIONS ===
  const openCreate = () => {
    setEditing(null);
    setForm({
      enseignantId: '', matiereId: '', classeId: '', salleId: '',
      anneeAcademiqueId: annees.find(a => a.active)?.id || '', date: '',
      heureDebut: '08:00', heureFin: '10:00', typeSeance: 'TD', nombreHeures: 2, remarques: '',
    });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      enseignantId: item.enseignantId || item.enseignant?.id || '',
      matiereId: item.matiereId || item.matiere?.id || '',
      classeId: item.classeId || item.classe?.id || '',
      salleId: item.salleId || item.salle?.id || '',
      anneeAcademiqueId: item.anneeAcademiqueId || item.anneeAcademique?.id || '',
      date: item.date || '', heureDebut: item.heureDebut || '08:00',
      heureFin: item.heureFin || '10:00', typeSeance: item.typeSeance || 'TD',
      nombreHeures: item.nombreHeures || 2, remarques: item.remarques || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.enseignantId || !form.matiereId || !form.classeId || !form.salleId || !form.date) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/seances/${editing.id}` : '/api/seances';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetchApi(url, { method, body: JSON.stringify(form) });
      const json = await res.json();
      if (json.succes || res.ok) {
        toast.success(editing ? 'Séance modifiée' : 'Séance créée');
        setDialogOpen(false);
        fetchSeances();
      } else {
        toast.error(json.error || json.erreur || "Erreur");
      }
    } catch { toast.error('Erreur réseau'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await fetchApi(`/api/seances/${deleting.id}`, { method: 'DELETE' });
      toast.success('Séance supprimée');
      setDeleteOpen(false);
      fetchSeances();
    } catch { toast.error('Erreur'); }
  };

  const validerSeance = async (item) => {
    try {
      const res = await fetchApi(`/api/seances/${item.id}/valider`, { method: 'POST' });
      const json = await res.json();
      if (json.succes || res.ok) { toast.success('Séance validée'); fetchSeances(); }
      else toast.error(json.error || 'Erreur');
    } catch { toast.error('Erreur'); }
  };

  // === HELPERS ===
  const getStatutBadge = (statut) => {
    if (statut === 'effectuee') return 'bg-emerald-100 text-emerald-700';
    if (statut === 'planifiee') return 'bg-amber-100 text-amber-700';
    if (statut === 'annulee') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  };
  const getStatutLabel = (statut) => {
    if (statut === 'effectuee') return 'Effectuée';
    if (statut === 'planifiee') return 'Planifiée';
    if (statut === 'annulee') return 'Annulée';
    return statut;
  };
  const getStatutIcon = (statut) => {
    if (statut === 'effectuee') return CheckCircle;
    if (statut === 'planifiee') return Clock;
    if (statut === 'annulee') return XCircle;
    return AlertTriangle;
  };
  const getTypeBadge = (type) => {
    if (type === 'CM') return 'bg-purple-100 text-purple-700';
    if (type === 'TD') return 'bg-amber-100 text-amber-700';
    if (type === 'TP') return 'bg-sky-100 text-sky-700';
    return 'bg-gray-100 text-gray-600';
  };

  const totalPages = Math.ceil(total / parPage);

  const getEnseignantNom = (s) => {
    if (s.enseignant) {
      if (s.enseignant.user) return `${s.enseignant.user.prenom} ${s.enseignant.user.nom}`;
      if (s.enseignant.nom) return s.enseignant.nom;
    }
    if (s.enseignantNom) return s.enseignantNom;
    return '—';
  };
  const getMatiereNom = (s) => s.matiere?.nom || s.matiereNom || '—';
  const getClasseNom = (s) => s.classe?.nom || s.classeNom || '—';
  const getSalleNom = (s) => s.salle?.nom || s.salleNom || '—';

  // ==================== RENDU ====================
  return (
    <div className="space-y-6">
      {/* === EN-TÊTE === */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Teacher's Plan</span><ChevronRight size={12} /><span>Gestion</span>
            <ChevronRight size={12} /><span className="text-purple-600 font-medium">Séances de cours</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0F2B46]">Séances de cours</h2>
          <p className="text-gray-500 text-sm mt-0.5">{total} séance(s) au total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchSeances} disabled={loading} className="inline-flex items-center gap-2 bg-white border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Nouvelle séance
          </button>
        </div>
      </div>

      {/* === CARTES STATS === */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Planifiées', value: planifiees, icon: Clock, gradient: 'bg-gradient-to-br from-amber-500 to-amber-600', iconColor: 'bg-white/20' },
          { label: 'Effectuées', value: effectuees, icon: CheckCircle, gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600', iconColor: 'bg-white/20' },
          { label: 'Annulées', value: annulees, icon: XCircle, gradient: 'bg-gradient-to-br from-red-500 to-red-600', iconColor: 'bg-white/20' },
          { label: 'Heures totales', value: `${heuresTotal}h`, icon: Clock, gradient: 'bg-gradient-to-br from-purple-500 to-purple-600', iconColor: 'bg-white/20' },
        ].map((card, i) => {
          const Icon = card.icon;
          return loading ? (
            <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
          ) : (
            <div key={i} className={`${card.gradient} rounded-xl p-5 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
              <div className={`w-10 h-10 ${card.iconColor} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-white/80 mt-1 font-medium">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* === FILTRES === */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtres</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher (matière, enseignant...)" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" />
          </div>
          <select value={filtreType} onChange={e => { setFiltreType(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none bg-white">
            <option value="">Tous les types</option>
            <option value="CM">CM</option>
            <option value="TD">TD</option>
            <option value="TP">TP</option>
          </select>
          <select value={filtreStatut} onChange={e => { setFiltreStatut(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none bg-white">
            <option value="">Tous les statuts</option>
            <option value="planifiee">Planifiée</option>
            <option value="effectuee">Effectuée</option>
            <option value="annulee">Annulée</option>
          </select>
          <select value={filtreAnnee} onChange={e => { setFiltreAnnee(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none bg-white">
            <option value="">Toutes les années</option>
            {annees.map(a => <option key={a.id} value={a.id}>{a.libelle} {a.active ? '✓' : ''}</option>)}
          </select>
        </div>
      </div>

      {/* === TABLEAU === */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
                <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : seances.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucune séance trouvée</p>
            <p className="text-gray-400 text-sm mt-1">Créez votre première séance de cours</p>
            <button onClick={openCreate} className="mt-4 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <Plus size={16} /> Nouvelle séance
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Séance</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Enseignant</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Classe</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Salle</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Statut</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {seances.map(s => {
                    const StatutIcon = getStatutIcon(s.statut);
                    return (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-purple-50/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                              <BookOpen size={18} className="text-purple-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#0F2B46] truncate max-w-[180px]">{getMatiereNom(s)}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Calendar size={12} /> {s.date || '—'} · {s.heureDebut || ''}-{s.heureFin || ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 text-xs font-bold shrink-0">
                              {getEnseignantNom(s).split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <span className="text-sm text-[#0F2B46] truncate max-w-[120px]">{getEnseignantNom(s)}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <span className="text-sm text-gray-600">{getClasseNom(s)}</span>
                        </td>
                        <td className="py-3.5 px-4 hidden lg:table-cell">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                            <DoorOpen size={14} className="text-gray-400" /> {getSalleNom(s)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getTypeBadge(s.typeSeance)}`}>{s.typeSeance || '—'}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${getStatutBadge(s.statut)}`}>
                            <StatutIcon size={12} /> {getStatutLabel(s.statut)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setDialogDetail(s)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Détails">
                              <Eye size={15} className="text-gray-400" />
                            </button>
                            <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                              <Pencil size={15} className="text-gray-400 hover:text-blue-500" />
                            </button>
                            {s.statut === 'planifiee' && (
                              <button onClick={() => validerSeance(s)} className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors" title="Valider">
                                <CheckCircle size={15} className="text-gray-400 hover:text-emerald-500" />
                              </button>
                            )}
                            <button onClick={() => { setDeleting(s); setDeleteOpen(true); }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                              <Trash2 size={15} className="text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Affichage {(page - 1) * parPage + 1}–{Math.min(page * parPage, total)} sur {total}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-purple-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ==================== DIALOG CRÉER/MODIFIER ==================== */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-10 overflow-y-auto" onClick={() => setDialogOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 mb-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#0F2B46]">{editing ? 'Modifier la séance' : 'Nouvelle séance de cours'}</h3>
              <button onClick={() => setDialogOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Ligne 1 : Enseignant + Matière */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enseignant *</label>
                  <select value={form.enseignantId} onChange={e => setForm({ ...form, enseignantId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none bg-white">
                    <option value="">Sélectionner...</option>
                    {enseignants.map(e => (
                      <option key={e.id} value={e.id}>{e.user ? `${e.user.prenom} ${e.user.nom}` : e.nom || e.matricule}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matière *</label>
                  <select value={form.matiereId} onChange={e => setForm({ ...form, matiereId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none bg-white">
                    <option value="">Sélectionner...</option>
                    {matieres.map(m => <option key={m.id} value={m.id}>{m.code} — {m.nom}</option>)}
                  </select>
                </div>
              </div>

              {/* Ligne 2 : Classe + Salle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Classe *</label>
                  <select value={form.classeId} onChange={e => setForm({ ...form, classeId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none bg-white">
                    <option value="">Sélectionner...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.code || c.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salle *</label>
                  <select value={form.salleId} onChange={e => setForm({ ...form, salleId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none bg-white">
                    <option value="">Sélectionner...</option>
                    {salles.map(s => <option key={s.id} value={s.id}>{s.code} — {s.nom} ({s.capacite || '?'} places)</option>)}
                  </select>
                </div>
              </div>

              {/* Ligne 3 : Date + Heures */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
                  <input type="time" value={form.heureDebut} onChange={e => setForm({ ...form, heureDebut: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                  <input type="time" value={form.heureFin} onChange={e => setForm({ ...form, heureFin: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" />
                </div>
              </div>

              {/* Ligne 4 : Type + Nb heures + Année */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de séance</label>
                  <select value={form.typeSeance} onChange={e => setForm({ ...form, typeSeance: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none bg-white">
                    <option value="CM">CM — Cours Magistral</option>
                    <option value="TD">TD — Travaux Dirigés</option>
                    <option value="TP">TP — Travaux Pratiques</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'heures</label>
                  <input type="number" step="0.5" min="0.5" value={form.nombreHeures} onChange={e => setForm({ ...form, nombreHeures: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Année académique</label>
                  <select value={form.anneeAcademiqueId} onChange={e => setForm({ ...form, anneeAcademiqueId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none bg-white">
                    <option value="">Sélectionner...</option>
                    {annees.map(a => <option key={a.id} value={a.id}>{a.libelle} {a.active ? '(active)' : ''}</option>)}
                  </select>
                </div>
              </div>

              {/* Remarques */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarques</label>
                <textarea value={form.remarques} onChange={e => setForm({ ...form, remarques: e.target.value })} rows={3}
                  placeholder="Notes ou observations..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setDialogOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors">Annuler</button>
              <button disabled={saving} onClick={handleSave}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-60 inline-flex items-center gap-2">
                <Save size={16} /> {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer la séance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DIALOG DÉTAIL ==================== */}
      {dialogDetail && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-10 overflow-y-auto" onClick={() => setDialogDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 mb-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#0F2B46]">Détails de la séance</h3>
              <button onClick={() => setDialogDetail(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Statut banner */}
              <div className={`rounded-xl p-4 ${dialogDetail.statut === 'effectuee' ? 'bg-emerald-50 border border-emerald-200' : dialogDetail.statut === 'annulee' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                <div className="flex items-center gap-3">
                  {(() => { const I = getStatutIcon(dialogDetail.statut); return <I size={24} className={dialogDetail.statut === 'effectuee' ? 'text-emerald-600' : dialogDetail.statut === 'annulee' ? 'text-red-600' : 'text-amber-600'} />; })()}
                  <div>
                    <p className={`font-semibold ${dialogDetail.statut === 'effectuee' ? 'text-emerald-700' : dialogDetail.statut === 'annulee' ? 'text-red-700' : 'text-amber-700'}`}>{getStatutLabel(dialogDetail.statut)}</p>
                    <p className="text-xs text-gray-500">{dialogDetail.nombreHeures} heure(s) · {dialogDetail.typeSeance}</p>
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Matière', value: getMatiereNom(dialogDetail), icon: BookOpen, color: 'text-purple-600 bg-purple-100' },
                  { label: 'Enseignant', value: getEnseignantNom(dialogDetail), icon: Users, color: 'text-blue-600 bg-blue-100' },
                  { label: 'Classe', value: getClasseNom(dialogDetail), icon: School, color: 'text-emerald-600 bg-emerald-100' },
                  { label: 'Salle', value: getSalleNom(dialogDetail), icon: DoorOpen, color: 'text-amber-600 bg-amber-100' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}><Icon size={16} /></div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">{item.label}</p>
                        <p className="text-sm font-medium text-[#0F2B46] truncate">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Date & heures */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-[#0F2B46]">{dialogDetail.date || '—'}</p>
                  <p className="text-sm text-gray-500">{dialogDetail.heureDebut || ''} — {dialogDetail.heureFin || ''}</p>
                </div>
              </div>

              {dialogDetail.remarques && (
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Remarques</p>
                  <p className="text-sm text-gray-700">{dialogDetail.remarques}</p>
                </div>
              )}

              {dialogDetail.dateValidation && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs text-emerald-700">
                    <CheckCircle size={14} className="inline mr-1" />
                    Validée le {dialogDetail.dateValidation} par {dialogDetail.valideePar || '—'}
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-2">
              {dialogDetail.statut === 'planifiee' && (
                <button onClick={() => { validerSeance(dialogDetail); setDialogDetail(null); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors inline-flex items-center gap-2">
                  <CheckCircle size={16} /> Valider
                </button>
              )}
              <button onClick={() => setDialogDetail(null)} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DIALOG SUPPRIMER ==================== */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F2B46]">Supprimer la séance ?</h3>
              <p className="text-sm text-gray-500 mt-2">
                {deleting && `La séance de ${getMatiereNom(deleting)} du ${deleting.date} sera définitivement supprimée.`}
              </p>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-center gap-3">
              <button onClick={() => setDeleteOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50">Annuler</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}