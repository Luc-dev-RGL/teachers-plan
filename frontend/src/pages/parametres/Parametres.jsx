import { useState, useEffect, useCallback } from 'react';
import { Settings, Save, RefreshCw, ChevronRight, Building2, GraduationCap, DollarSign, Scale, Layers, Bell, Users, FileText, Plus, Pencil, Trash2, Check, X, Eye, Search, Download, Shield, Clock, AlertTriangle, CalendarDays, Mail, Phone, Globe, MapPin, UserCog, Activity, Star } from 'lucide-react';

// ==================== VIDES PAR DÉFAUT ====================

const VIDE_ETABLISSEMENT = {
  nom: '', sigle: '', adresse: '', telephone: '', email: '',
  siteWeb: '', devise: 'FCFA', recteur: '', description: '', logoUrl: '',
};
const VIDE_NIVEAUX = { niveaux: ['L1', 'L2', 'L3', 'M1', 'M2'], nombreSemestres: 2 };
const VIDE_ALERTES = {
  rappelSeance: true, conflitEdt: true, depassementHeures: true, seuilHeuresMin: 100,
  delaiRappelJours: 7, alerteEnseignantInactif: true, seanceSansSalle: false, rappelValidation: true,
};

// ==================== COMPOSANT ====================

export default function Parametres() {
  const [activeTab, setActiveTab] = useState('etablissement');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // === Données ===
  const [etablissement, setEtablissement] = useState(VIDE_ETABLISSEMENT);
  const [annees, setAnnees] = useState([]);
  const [tauxHoraires, setTauxHoraires] = useState([]);
  const [equivalences, setEquivalences] = useState([]);
  const [niveauxConfig, setNiveauxConfig] = useState(VIDE_NIVEAUX);
  const [alertes, setAlertes] = useState(VIDE_ALERTES);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // === Dialogs ===
  const [dialogAnnee, setDialogAnnee] = useState(false);
  const [dialogUser, setDialogUser] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingAnnee, setEditingAnnee] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [formAnnee, setFormAnnee] = useState({ libelle: '', dateDebut: '', dateFin: '' });
  const [formUser, setFormUser] = useState({ email: '', nom: '', prenom: '', role: 'enseignant', password: '' });
  const [searchUser, setSearchUser] = useState('');
  const [searchAudit, setSearchAudit] = useState('');

  // === FETCH ===
  const getToken = () => localStorage.getItem('token');
  const fetchApi = (url, opts = {}) => fetch(url, {
    headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, ...opts,
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const endpoints = [
        { key: 'etablissement', url: '/api/parametres/etablissement' },
        { key: 'annees', url: '/api/annees-academiques' },
        { key: 'tauxHoraires', url: '/api/parametres/taux-horaires' },
        { key: 'equivalences', url: '/api/parametres/equivalences' },
        { key: 'niveauxConfig', url: '/api/parametres/niveaux-semestres' },
        { key: 'alertes', url: '/api/parametres/alertes' },
        { key: 'utilisateurs', url: '/api/parametres/utilisateurs' },
        { key: 'auditLogs', url: '/api/parametres/audit-logs' },
      ];
      const results = await Promise.allSettled(
        endpoints.map(ep => fetchApi(ep.url).then(r => r.ok ? r.json() : null).catch(() => null))
      );
      results.forEach((res, i) => {
        if (res.status !== 'fulfilled' || !res.value) return;
        const d = res.value;
        const k = endpoints[i].key;
        if (k === 'etablissement' && d.etablissement) setEtablissement({ ...VIDE_ETABLISSEMENT, ...d.etablissement });
        if (k === 'etablissement' && d.donnees) setEtablissement({ ...VIDE_ETABLISSEMENT, ...d.donnees });
        if (k === 'annees' && Array.isArray(d)) setAnnees(d);
        if (k === 'annees' && d.donnees) setAnnees(d.donnees);
        if (k === 'tauxHoraires' && Array.isArray(d)) setTauxHoraires(d);
        if (k === 'tauxHoraires' && d.donnees) setTauxHoraires(d.donnees);
        if (k === 'equivalences' && Array.isArray(d)) setEquivalences(d);
        if (k === 'equivalences' && d.donnees) setEquivalences(d.donnees);
        if (k === 'niveauxConfig' && (d.niveaux || d.donnees)) setNiveauxConfig({ ...VIDE_NIVEAUX, ...(d.niveaux ? d : d.donnees) });
        if (k === 'alertes' && (d.rappelSeance !== undefined || d.donnees)) setAlertes({ ...VIDE_ALERTES, ...(d.rappelSeance !== undefined ? d : d.donnees) });
        if (k === 'utilisateurs' && Array.isArray(d)) setUtilisateurs(d);
        if (k === 'utilisateurs' && d.donnees) setUtilisateurs(d.donnees);
        if (k === 'auditLogs' && Array.isArray(d)) setAuditLogs(d);
        if (k === 'auditLogs' && d.donnees) setAuditLogs(d.donnees);
      });
    } catch { /* keep defaults */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // === SAVERS ===
  const saveJson = async (url, data) => {
    setSaving(true);
    try {
      const res = await fetchApi(url, { method: 'PUT', body: JSON.stringify(data) });
      const json = await res.json();
      if (res.ok || json.succes) { toast.success('Enregistré avec succès'); fetchAll(); }
      else { toast.error(json.error || json.erreur || 'Erreur'); }
    } catch { toast.error('Erreur réseau'); }
    setSaving(false);
  };

  const postJson = async (url, data) => {
    setSaving(true);
    try {
      const res = await fetchApi(url, { method: 'POST', body: JSON.stringify(data) });
      const json = await res.json();
      if (res.ok || json.succes) { toast.success('Créé avec succès'); fetchAll(); return true; }
      else { toast.error(json.error || json.erreur || 'Erreur'); return false; }
    } catch { toast.error('Erreur réseau'); return false; }
    finally { setSaving(false); }
  };

  const deleteItem = async (url) => {
    try {
      await fetchApi(url, { method: 'DELETE' });
      toast.success('Supprimé'); fetchAll();
    } catch { toast.error('Erreur réseau'); }
  };

  // === Helpers ===
  const getRoleBadge = (role) => {
    if (role === 'admin') return 'bg-purple-100 text-purple-700';
    if (role === 'rh') return 'bg-amber-100 text-amber-700';
    return 'bg-sky-100 text-sky-700';
  };
  const getRoleLabel = (role) => {
    if (role === 'admin') return 'Administrateur';
    if (role === 'rh') return 'Ressources Humaines';
    return 'Enseignant';
  };
  const getActionBadge = (action) => {
    if (action === 'CREATE') return 'bg-emerald-100 text-emerald-700';
    if (action === 'UPDATE') return 'bg-amber-100 text-amber-700';
    if (action === 'DELETE') return 'bg-red-100 text-red-700';
    if (action === 'LOGIN') return 'bg-sky-100 text-sky-700';
    if (action === 'VALIDATE') return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  // === Stats ===
  const statsCards = [
    { label: 'Établissement', sub: 'Config générale', value: etablissement.nom || 'Non défini', icon: Building2, gradient: 'bg-gradient-to-br from-purple-500 to-purple-700' },
    { label: 'Années', sub: 'Académiques', value: `${annees.length} année(s)`, icon: CalendarDays, gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-700' },
    { label: 'Taux', sub: 'Horaires', value: `${tauxHoraires.length} grille(s)`, icon: DollarSign, gradient: 'bg-gradient-to-br from-amber-500 to-amber-700' },
    { label: 'Alertes', sub: 'Notifications', value: `${Object.values(alertes).filter(v => typeof v === 'boolean' && v).length} active(s)`, icon: Bell, gradient: 'bg-gradient-to-br from-rose-500 to-rose-700' },
    { label: 'Équivalences', sub: 'Coefficients', value: `${equivalences.length} type(s)`, icon: Scale, gradient: 'bg-gradient-to-br from-sky-500 to-sky-700' },
    { label: 'Niveaux', sub: '& Semestres', value: `${niveauxConfig.niveaux.length} niveau(x)`, icon: Layers, gradient: 'bg-gradient-to-br from-teal-500 to-teal-700' },
    { label: 'Utilisateurs', sub: 'Comptes', value: `${utilisateurs.length} utilisateur(s)`, icon: Users, gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-700' },
    { label: 'Journal', sub: "D'activité", value: `${auditLogs.length} entrée(s)`, icon: FileText, gradient: 'bg-gradient-to-br from-slate-500 to-slate-700' },
  ];
  const tabKeys = ['etablissement', 'annees', 'taux-horaires', 'alertes', 'equivalences', 'niveaux', 'utilisateurs', 'audit'];

  // ==================== RENDU ====================
  return (
    <div className="space-y-6">
      {/* === EN-TÊTE === */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Teacher's Plan</span><ChevronRight size={12} /><span>Administration</span><ChevronRight size={12} /><span className="text-purple-600 font-medium">Paramètres</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0F2B46]">Paramètres</h2>
          <p className="text-gray-500 text-sm mt-0.5">Configuration complète de l'application</p>
        </div>
        <button onClick={fetchAll} disabled={loading} className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Recharger tout
        </button>
      </div>

      {/* === CARTES STATS === */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {statsCards.map((card, i) => {
          const Icon = card.icon;
          return loading ? (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ) : (
            <div key={i} className={`${card.gradient} rounded-xl p-4 text-white hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer`} onClick={() => setActiveTab(tabKeys[i])}>
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mb-2"><Icon size={18} /></div>
              <p className="font-bold text-sm truncate">{card.value}</p>
              <p className="text-white/70 text-[10px] font-medium mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* === ONGLETS === */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {[
            { key: 'etablissement', label: 'Établissement', icon: Building2 },
            { key: 'annees', label: 'Années Académiques', icon: CalendarDays },
            { key: 'taux-horaires', label: 'Taux Horaires', icon: DollarSign },
            { key: 'equivalences', label: 'Équivalences', icon: Scale },
            { key: 'niveaux', label: 'Niveaux & Semestres', icon: Layers },
            { key: 'alertes', label: 'Alertes', icon: Bell },
            { key: 'utilisateurs', label: 'Utilisateurs', icon: Users },
            { key: 'audit', label: "Journal d'activité", icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-200 border-t-purple-600 mx-auto" />
          <p className="text-sm text-gray-500 mt-4">Chargement des paramètres...</p>
        </div>
      ) : (
        <>

          {/* ==================== ONGLET : ÉTABLISSEMENT ==================== */}
          {activeTab === 'etablissement' && (
            <div className="space-y-4">
              {/* Carte infos principales */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 bg-purple-500 rounded-xl flex items-center justify-center"><Building2 size={20} className="text-white" /></div>
                  <div>
                    <h3 className="font-semibold text-[#0F2B46]">Informations de l'établissement</h3>
                    <p className="text-xs text-gray-500">Apparaîtront sur les exports et documents officiels</p>
                  </div>
                </div>

                {/* Logo + Nom */}
                <div className="flex flex-col sm:flex-row gap-6 mb-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {etablissement.sigle?.substring(0, 3) || 'UNI'}
                    </div>
                    <span className="text-xs text-gray-400">Logo</span>
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'établissement *</label>
                      <input type="text" value={etablissement.nom} onChange={e => setEtablissement({ ...etablissement, nom: e.target.value })} placeholder="Université Nangui Abrogoua" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sigle *</label>
                      <input type="text" value={etablissement.sigle} onChange={e => setEtablissement({ ...etablissement, sigle: e.target.value })} placeholder="UNA" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" />
                    </div>
                  </div>
                </div>

                <hr className="my-5 border-gray-100" />

                {/* Coordonnées */}
                <h4 className="text-sm font-semibold text-[#0F2B46] mb-3 flex items-center gap-2"><Phone size={16} className="text-purple-500" />Coordonnées</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <div className="relative"><MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={etablissement.adresse} onChange={e => setEtablissement({ ...etablissement, adresse: e.target.value })} placeholder="02 BP 801 Abidjan 02" className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" /></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <div className="relative"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={etablissement.telephone} onChange={e => setEtablissement({ ...etablissement, telephone: e.target.value })} placeholder="+225 01 02 03 04" className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" /></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={etablissement.email} onChange={e => setEtablissement({ ...etablissement, email: e.target.value })} placeholder="contact@univ.ci" className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" /></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                    <div className="relative"><Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={etablissement.siteWeb} onChange={e => setEtablissement({ ...etablissement, siteWeb: e.target.value })} placeholder="www.univ.ci" className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" /></div>
                  </div>
                </div>

                <hr className="my-5 border-gray-100" />

                {/* Infos académiques */}
                <h4 className="text-sm font-semibold text-[#0F2B46] mb-3 flex items-center gap-2"><GraduationCap size={16} className="text-purple-500" />Informations académiques</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recteur / Doyen</label>
                    <input type="text" value={etablissement.recteur} onChange={e => setEtablissement({ ...etablissement, recteur: e.target.value })} placeholder="Pr. KONÉ Amadou" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                    <input type="text" value={etablissement.devise} onChange={e => setEtablissement({ ...etablissement, devise: e.target.value })} placeholder="FCFA" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" />
                  </div>
                </div>

                <hr className="my-5 border-gray-100" />

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={etablissement.description} onChange={e => setEtablissement({ ...etablissement, description: e.target.value })} placeholder="Description de l'établissement..." rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none resize-none" />
                </div>

                <div className="flex justify-end">
                  <button onClick={() => saveJson('/api/parametres/etablissement', etablissement)} disabled={saving} className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
                    <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ONGLET : ANNÉES ACADÉMIQUES ==================== */}
          {activeTab === 'annees' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center"><CalendarDays size={20} className="text-white" /></div>
                  <div>
                    <h3 className="font-semibold text-[#0F2B46]">Années académiques</h3>
                    <p className="text-xs text-gray-500">Gérez les périodes académiques</p>
                  </div>
                </div>
                <button onClick={() => { setEditingAnnee(null); setFormAnnee({ libelle: '', dateDebut: '', dateFin: '' }); setDialogAnnee(true); }} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Plus size={16} /> Nouvelle année
                </button>
              </div>

              {annees.length === 0 ? (
                <div className="py-16 text-center">
                  <CalendarDays size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Aucune année académique configurée</p>
                  <button onClick={() => postJson('/api/annees-academiques', { libelle: '2024-2025', dateDebut: '2024-09-01', dateFin: '2025-06-30' })} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"><Plus size={16} /> Créer 2024-2025</button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {annees.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center"><CalendarDays size={24} className="text-emerald-600" /></div>
                        <div>
                          <p className="font-semibold text-[#0F2B46]">{a.libelle}</p>
                          <p className="text-xs text-gray-500 mt-0.5"><Clock size={12} className="inline mr-1" />{a.dateDebut || '...'} → {a.dateFin || '...'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.active ? (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1"><Check size={12} />Active</span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">Inactive</span>
                        )}
                        {!a.active && (
                          <button onClick={() => saveJson(`/api/annees-academiques/${a.id}/activate`, {})} className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors" title="Activer">
                            <Star size={16} className="text-gray-400 hover:text-amber-500" />
                          </button>
                        )}
                        <button onClick={() => { setEditingAnnee(a); setFormAnnee({ libelle: a.libelle, dateDebut: a.dateDebut, dateFin: a.dateFin }); setDialogAnnee(true); }} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                          <Pencil size={16} className="text-gray-400 hover:text-blue-500" />
                        </button>
                        {!a.active && (
                          <button onClick={() => deleteItem(`/api/annees-academiques/${a.id}`)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                            <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dialog Année */}
              {dialogAnnee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDialogAnnee(false)}>
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-[#0F2B46]">{editingAnnee ? "Modifier l'année" : 'Nouvelle année académique'}</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Libellé *</label>
                        <input type="text" value={formAnnee.libelle} onChange={e => setFormAnnee({ ...formAnnee, libelle: e.target.value })} placeholder="2025-2026" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                          <input type="date" value={formAnnee.dateDebut} onChange={e => setFormAnnee({ ...formAnnee, dateDebut: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
                          <input type="date" value={formAnnee.dateFin} onChange={e => setFormAnnee({ ...formAnnee, dateFin: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-300 focus:border-emerald-500 outline-none" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6 border-t border-gray-100 flex justify-end gap-2">
                      <button onClick={() => setDialogAnnee(false)} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors">Annuler</button>
                      <button disabled={saving} onClick={() => {
                        if (editingAnnee) saveJson(`/api/annees-academiques/${editingAnnee.id}`, formAnnee);
                        else postJson('/api/annees-academiques', formAnnee);
                        setDialogAnnee(false);
                      }} className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-60">{saving ? '...' : editingAnnee ? 'Modifier' : 'Créer'}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== ONGLET : TAUX HORAIRES ==================== */}
          {activeTab === 'taux-horaires' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center"><DollarSign size={20} className="text-white" /></div>
                <div>
                  <h3 className="font-semibold text-[#0F2B46]">Taux horaires</h3>
                  <p className="text-xs text-gray-500">Montants par heure selon le type d'enseignant et de séance</p>
                </div>
              </div>

              {tauxHoraires.length === 0 ? (
                <div className="py-16 text-center">
                  <DollarSign size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Aucun taux horaire configuré</p>
                  <button onClick={() => {
                    postJson('/api/parametres/taux-horaires/init', {});
                  }} className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium"><Plus size={16} /> Initialiser les taux par défaut</button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Catégorie</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase bg-purple-50 rounded-tl-lg">CM</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase bg-amber-50">TD</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase bg-sky-50 rounded-tr-lg">TP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['Permanent', 'Vacataire'].map(cat => {
                          const cm = tauxHoraires.find(t => t.categorie === cat && t.typeSeance === 'CM');
                          const td = tauxHoraires.find(t => t.categorie === cat && t.typeSeance === 'TD');
                          const tp = tauxHoraires.find(t => t.categorie === cat && t.typeSeance === 'TP');
                          return (
                            <tr key={cat} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat === 'Permanent' ? 'bg-purple-100' : 'bg-amber-100'}`}>
                                    <UserCog size={16} className={cat === 'Permanent' ? 'text-purple-600' : 'text-amber-600'} />
                                  </div>
                                  <span className="font-medium text-[#0F2B46] text-sm">{cat}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 bg-purple-50/50">
                                <div className="relative">
                                  <input type="number" className="w-full text-center h-10 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" value={cm?.montant || ''} onChange={e => {
                                    setTauxHoraires(tauxHoraires.map(t => t.id === cm?.id ? { ...t, montant: Number(e.target.value) } : t));
                                  }} />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">{etablissement.devise || 'FCFA'}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 bg-amber-50/50">
                                <div className="relative">
                                  <input type="number" className="w-full text-center h-10 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-300 focus:border-amber-500 outline-none" value={td?.montant || ''} onChange={e => {
                                    setTauxHoraires(tauxHoraires.map(t => t.id === td?.id ? { ...t, montant: Number(e.target.value) } : t));
                                  }} />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">{etablissement.devise || 'FCFA'}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 bg-sky-50/50">
                                <div className="relative">
                                  <input type="number" className="w-full text-center h-10 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-sky-300 focus:border-sky-500 outline-none" value={tp?.montant || ''} onChange={e => {
                                    setTauxHoraires(tauxHoraires.map(t => t.id === tp?.id ? { ...t, montant: Number(e.target.value) } : t));
                                  }} />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">{etablissement.devise || 'FCFA'}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end pt-6">
                    <button onClick={() => saveJson('/api/parametres/taux-horaires', tauxHoraires)} disabled={saving} className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
                      <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer les taux'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==================== ONGLET : ÉQUIVALENCES ==================== */}
          {activeTab === 'equivalences' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-sky-500 rounded-xl flex items-center justify-center"><Scale size={20} className="text-white" /></div>
                <div>
                  <h3 className="font-semibold text-[#0F2B46]">Coefficients d'équivalence</h3>
                  <p className="text-xs text-gray-500">Conversion des heures réelles en heures équivalentes TD</p>
                </div>
              </div>

              {equivalences.length === 0 ? (
                <div className="py-16 text-center">
                  <Scale size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Aucune équivalence configurée</p>
                  <button onClick={() => postJson('/api/parametres/equivalences/init', {})} className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium"><Plus size={16} /> Initialiser par défaut</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {equivalences.map(eq => (
                      <div key={eq.id} className={`rounded-xl p-5 border-2 transition-all hover:shadow-md ${eq.type === 'CM' ? 'bg-purple-50 border-purple-200' : eq.type === 'TD' ? 'bg-amber-50 border-amber-200' : 'bg-sky-50 border-sky-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-2xl font-bold ${eq.type === 'CM' ? 'text-purple-600' : eq.type === 'TD' ? 'text-amber-600' : 'text-sky-600'}`}>{eq.type}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${eq.type === 'CM' ? 'bg-purple-200 text-purple-700' : eq.type === 'TD' ? 'bg-amber-200 text-amber-700' : 'bg-sky-200 text-sky-700'}`}>Coefficient</span>
                        </div>
                        <input type="number" step="0.1" value={eq.coefficient} onChange={e => {
                          setEquivalences(equivalences.map(x => x.id === eq.id ? { ...x, coefficient: Number(e.target.value) } : x));
                        }} className="w-full text-center text-xl font-bold h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-300 focus:border-sky-500 outline-none" />
                        <p className="text-xs text-gray-500 mt-2">1h {eq.type} = {eq.coefficient}h éq. TD</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <p className="text-xs text-gray-600 flex items-start gap-2">
                      <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Formule :</strong> Heures éq. TD = Heures réelles × Coefficient. Les TD/TP ne sont généralement pas pondérés (1.0), tandis que les CM le sont (1.5).</span>
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button onClick={() => saveJson('/api/parametres/equivalences', equivalences)} disabled={saving} className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
                      <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==================== ONGLET : NIVEAUX & SEMESTRES ==================== */}
          {activeTab === 'niveaux' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Niveaux */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 bg-teal-500 rounded-xl flex items-center justify-center"><Layers size={20} className="text-white" /></div>
                  <div>
                    <h3 className="font-semibold text-[#0F2B46]">Niveaux académiques</h3>
                    <p className="text-xs text-gray-500">Niveaux disponibles (L1, L2, L3, M1, M2...)</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {niveauxConfig.niveaux.map((n, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-teal-100 text-teal-700 text-sm font-medium">
                      {n}
                      <button onClick={() => setNiveauxConfig({ ...niveauxConfig, niveaux: niveauxConfig.niveaux.filter((_, idx) => idx !== i) })} className="ml-0.5 hover:text-red-600"><X size={14} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mb-4">
                  <input type="text" placeholder="Ex: D1" id="niveau-input" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-300 focus:border-teal-500 outline-none" onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = e.target.value.trim().toUpperCase();
                      if (val && !niveauxConfig.niveaux.includes(val)) {
                        setNiveauxConfig({ ...niveauxConfig, niveaux: [...niveauxConfig.niveaux, val] });
                        e.target.value = '';
                      }
                    }
                  }} />
                  <button onClick={() => {
                    const input = document.getElementById('niveau-input');
                    const val = input.value.trim().toUpperCase();
                    if (val && !niveauxConfig.niveaux.includes(val)) {
                      setNiveauxConfig({ ...niveauxConfig, niveaux: [...niveauxConfig.niveaux, val] });
                      input.value = '';
                    }
                  }} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><Plus size={16} /></button>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => saveJson('/api/parametres/niveaux-semestres', niveauxConfig)} disabled={saving} className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
                    <Save size={16} /> {saving ? '...' : 'Enregistrer'}
                  </button>
                </div>
              </div>

              {/* Semestres */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 bg-violet-500 rounded-xl flex items-center justify-center"><Clock size={20} className="text-white" /></div>
                  <div>
                    <h3 className="font-semibold text-[#0F2B46]">Configuration des semestres</h3>
                    <p className="text-xs text-gray-500">Nombre et dates des semestres</p>
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de semestres par année</label>
                  <select value={niveauxConfig.nombreSemestres} onChange={e => setNiveauxConfig({ ...niveauxConfig, nombreSemestres: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-500 outline-none bg-white">
                    <option value="1">1 semestre</option>
                    <option value="2">2 semestres</option>
                    <option value="3">3 semestres</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[1, 2].filter(s => s <= niveauxConfig.nombreSemestres).map(s => (
                    <div key={s} className="rounded-xl border border-gray-200 p-4 space-y-3">
                      <p className="text-sm font-semibold text-[#0F2B46]">Semestre {s}</p>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Début</label>
                        <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Fin</label>
                        <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-300 focus:border-violet-500 outline-none" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button onClick={() => saveJson('/api/parametres/niveaux-semestres', niveauxConfig)} disabled={saving} className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
                    <Save size={16} /> {saving ? '...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ONGLET : ALERTES ==================== */}
          {activeTab === 'alertes' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-rose-500 rounded-xl flex items-center justify-center"><Bell size={20} className="text-white" /></div>
                <div>
                  <h3 className="font-semibold text-[#0F2B46]">Configuration des alertes</h3>
                  <p className="text-xs text-gray-500">Seuils et types de notifications</p>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Rappels de séance', desc: 'Envoyer un rappel avant chaque séance planifiée', key: 'rappelSeance', icon: CalendarDays, color: 'bg-purple-100 text-purple-600' },
                  { label: "Conflits d'emploi du temps", desc: 'Détecter les chevauchements de créneaux', key: 'conflitEdt', icon: AlertTriangle, color: 'bg-amber-100 text-amber-600' },
                  { label: "Dépassement d'heures", desc: "Alerter quand un enseignant dépasse le seuil minimum", key: 'depassementHeures', icon: Clock, color: 'bg-red-100 text-red-600' },
                  { label: 'Enseignant inactif', desc: 'Détecter les enseignants sans séance depuis longtemps', key: 'alerteEnseignantInactif', icon: UserCog, color: 'bg-gray-100 text-gray-600' },
                  { label: 'Séance sans salle', desc: 'Signaler les séances planifiées sans salle assignée', key: 'seanceSansSalle', icon: Building2, color: 'bg-sky-100 text-sky-600' },
                  { label: 'Rappel de validation', desc: 'Rappeler de valider les séances effectuées', key: 'rappelValidation', icon: Check, color: 'bg-emerald-100 text-emerald-600' },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-rose-200 hover:bg-rose-50/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}><Icon size={20} /></div>
                        <div>
                          <p className="text-sm font-medium text-[#0F2B46]">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={alertes[item.key]} onChange={e => setAlertes({ ...alertes, [item.key]: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-purple-600 transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
                      </label>
                    </div>
                  );
                })}
              </div>

              <hr className="my-5 border-gray-100" />

              {/* Seuils */}
              <h4 className="text-sm font-semibold text-[#0F2B46] mb-3">Seuils de notification</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'heures minimum</label>
                  <div className="relative">
                    <input type="number" value={alertes.seuilHeuresMin} onChange={e => setAlertes({ ...alertes, seuilHeuresMin: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 focus:border-rose-500 outline-none" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">heures</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Alerter si un enseignant a moins de ce nombre d'heures</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Délai de rappel</label>
                  <div className="relative">
                    <input type="number" value={alertes.delaiRappelJours} onChange={e => setAlertes({ ...alertes, delaiRappelJours: Number(e.target.value) })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-300 focus:border-rose-500 outline-none" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">jours</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Rappeler les validations non effectuées après ce délai</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => saveJson('/api/parametres/alertes', alertes)} disabled={saving} className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
                  <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer les alertes'}
                </button>
              </div>
            </div>
          )}

          {/* ==================== ONGLET : UTILISATEURS ==================== */}
          {activeTab === 'utilisateurs' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-500 rounded-xl flex items-center justify-center"><Users size={20} className="text-white" /></div>
                  <div>
                    <h3 className="font-semibold text-[#0F2B46]">Gestion des utilisateurs</h3>
                    <p className="text-xs text-gray-500">{utilisateurs.length} compte(s) enregistré(s)</p>
                  </div>
                </div>
                <button onClick={() => { setEditingUser(null); setFormUser({ email: '', nom: '', prenom: '', role: 'enseignant', password: '' }); setDialogUser(true); }} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Plus size={16} /> Nouvel utilisateur
                </button>
              </div>

              <div className="relative max-w-sm mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Rechercher un utilisateur..." value={searchUser} onChange={e => setSearchUser(e.target.value)} className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none" />
              </div>

              {utilisateurs.filter(u => `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(searchUser.toLowerCase())).length === 0 ? (
                <div className="py-12 text-center"><Users size={48} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Aucun utilisateur trouvé</p></div>
              ) : (
                <div className="grid gap-2 max-h-96 overflow-y-auto">
                  {utilisateurs.filter(u => `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(searchUser.toLowerCase())).map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">{u.prenom?.[0]}{u.nom?.[0]}</div>
                        <div>
                          <p className="font-medium text-[#0F2B46] text-sm">{u.prenom} {u.nom}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${getRoleBadge(u.role)}`}>{getRoleLabel(u.role)}</span>
                        <div className={`w-2 h-2 rounded-full ${u.actif ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        <button onClick={() => { setEditingUser(u); setFormUser({ email: u.email, nom: u.nom, prenom: u.prenom, role: u.role, password: '' }); setDialogUser(true); }} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={14} className="text-gray-400 hover:text-blue-500" /></button>
                        <button onClick={() => { setDeletingUser(u); setDeleteOpen(true); }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} className="text-gray-400 hover:text-red-500" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dialog Utilisateur */}
              {dialogUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDialogUser(false)}>
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-[#0F2B46]">{editingUser ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                          <input type="text" value={formUser.prenom} onChange={e => setFormUser({ ...formUser, prenom: e.target.value })} placeholder="Amadou" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                          <input type="text" value={formUser.nom} onChange={e => setFormUser({ ...formUser, nom: e.target.value })} placeholder="KONÉ" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" value={formUser.email} onChange={e => setFormUser({ ...formUser, email: e.target.value })} placeholder="amadou.kone@univ.ci" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                        <select value={formUser.role} onChange={e => setFormUser({ ...formUser, role: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none bg-white">
                          <option value="admin">Administrateur</option>
                          <option value="rh">Ressources Humaines</option>
                          <option value="enseignant">Enseignant</option>
                        </select>
                      </div>
                      {!editingUser && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                          <input type="password" value={formUser.password} onChange={e => setFormUser({ ...formUser, password: e.target.value })} placeholder="••••••••" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 border-t border-gray-100 flex justify-end gap-2">
                      <button onClick={() => setDialogUser(false)} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50">Annuler</button>
                      <button disabled={saving} onClick={() => {
                        if (editingUser) saveJson(`/api/parametres/utilisateurs/${editingUser.id}`, formUser);
                        else postJson('/api/parametres/utilisateurs', formUser);
                        setDialogUser(false);
                      }} className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60">{saving ? '...' : editingUser ? 'Modifier' : 'Créer'}</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dialog Supprimer */}
              {deleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeleteOpen(false)}>
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                    <div className="p-6">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-500" /></div>
                      <h3 className="text-lg font-semibold text-[#0F2B46] text-center">Supprimer cet utilisateur ?</h3>
                      <p className="text-sm text-gray-500 text-center mt-2">Cette action est irréversible. Toutes les données associées seront supprimées.</p>
                    </div>
                    <div className="p-4 border-t border-gray-100 flex justify-center gap-3">
                      <button onClick={() => setDeleteOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50">Annuler</button>
                      <button onClick={() => { if (deletingUser) deleteItem(`/api/parametres/utilisateurs/${deletingUser.id}`); setDeleteOpen(false); }} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white">Supprimer</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== ONGLET : JOURNAL D'ACTIVITÉ ==================== */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-slate-500 rounded-xl flex items-center justify-center"><FileText size={20} className="text-white" /></div>
                  <div>
                    <h3 className="font-semibold text-[#0F2B46]">Journal d'activité</h3>
                    <p className="text-xs text-gray-500">Historique de toutes les actions sur la plateforme</p>
                  </div>
                </div>
                <button className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"><Download size={16} /> Exporter</button>
              </div>

              <div className="relative max-w-sm mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Filtrer les actions..." value={searchAudit} onChange={e => setSearchAudit(e.target.value)} className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-slate-300 focus:border-slate-500 outline-none" />
              </div>

              {auditLogs.filter(a => !searchAudit || `${a.action} ${a.entite} ${a.utilisateur || ''}`.toLowerCase().includes(searchAudit.toLowerCase())).length === 0 ? (
                <div className="py-12 text-center"><Activity size={48} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Aucune activité enregistrée</p></div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {auditLogs.filter(a => !searchAudit || `${a.action} ${a.entite} ${a.utilisateur || ''}`.toLowerCase().includes(searchAudit.toLowerCase())).map(entry => (
                    <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${getActionBadge(entry.action)}`}>
                        {entry.action === 'CREATE' ? <Plus size={16} /> :
                         entry.action === 'UPDATE' ? <Pencil size={16} /> :
                         entry.action === 'DELETE' ? <Trash2 size={16} /> :
                         entry.action === 'LOGIN' ? <Eye size={16} /> :
                         <Check size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0F2B46]">
                          <span className="font-medium">{entry.utilisateur || 'Système'}</span>
                          <span className="text-gray-500"> a effectué </span>
                          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${getActionBadge(entry.action)}`}>{entry.action}</span>
                          <span className="text-gray-500"> sur </span>
                          <span className="font-medium">{entry.entite}</span>
                        </p>
                        {entry.details && <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.details}</p>}
                      </div>
                      <p className="text-[10px] text-gray-400 shrink-0 mt-1">{entry.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </>
      )}
    </div>
  );
}