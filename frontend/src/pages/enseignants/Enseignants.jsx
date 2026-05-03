import { useState, useEffect, useMemo } from 'react';
import {
  Users, Search, ChevronRight, ChevronLeft, Plus, X, Pencil,
  Trash2, Phone, Mail, Clock, GraduationCap, Building2
} from 'lucide-react';

const getToken = () => localStorage.getItem('token');
const fetchApi = (url, opts = {}) => fetch(url, {
  headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, ...opts,
});

const ITEMS = 6;
const emptyForm = { 
  nom: '', prenoms: '', email: '', telephone: '', 
  grade: '', departement_id: '', statut: 'actif', password: '' 
};

const gradeColors = {
  'Professeur': 'bg-violet-100 text-violet-700',
  'Maître de Conférences': 'bg-purple-100 text-purple-700',
  'Maître Assistant': 'bg-indigo-100 text-indigo-700',
  'Docteur': 'bg-sky-100 text-sky-700',
  'Attaché': 'bg-emerald-100 text-emerald-700',
  'Assistant': 'bg-amber-100 text-amber-700',
  'Vacataire': 'bg-rose-100 text-rose-700',
};

export default function Enseignants() {
  const [data, setData] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filtreDep, setFiltreDep] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { setPage(1); }, [search, filtreDep, filtreStatut]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resEns, resDep] = await Promise.all([
        fetchApi('/api/enseignants').then(r => r.ok ? r.json().catch(() => ({})) : ({})),
        fetchApi('/api/departements').then(r => r.ok ? r.json().catch(() => ({})) : ({})),
      ]);
      const ensData = resEns?.donnees || resEns?.data || [];
      if (Array.isArray(ensData)) setData(ensData);
      const depData = resDep?.donnees || resDep?.data || [];
      if (Array.isArray(depData)) setDepartements(depData);
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    return data.filter(e => {
      const t = search.toLowerCase();
      const full = `${e.nom || ''} ${e.prenom || ''} ${e.prenoms || ''} ${e.email || ''} ${e.utilisateur_email || ''}`.toLowerCase();
      return (
        (!t || full.includes(t)) &&
        (!filtreDep || String(e.departement_id) === filtreDep || e.departement_nom === filtreDep) &&
        (!filtreStatut || (e.statut || 'actif') === filtreStatut)
      );
    });
  }, [data, search, filtreDep, filtreStatut]);
  const totalP = Math.ceil(filtered.length / ITEMS);
  const paginees = filtered.slice((page - 1) * ITEMS, page * ITEMS);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError('');
    setSuccessMsg('');
    setSaving(true);
    try {
      const payload = {
        nom: form.nom,
        prenoms: form.prenoms,
        email: form.email,
        telephone: form.telephone,
        grade: form.grade,
        departement_id: form.departement_id || null,
        statut: form.statut,
      };

      // Le mot de passe est obligatoire seulement à la création
      if (!editing) {
        payload.password = form.password;
        if (!payload.password) {
          setError('Le mot de passe est obligatoire pour créer un enseignant');
          setSaving(false);
          return;
        }
      }

      const url = editing ? `/api/enseignants/${editing.id}` : '/api/enseignants';
      const response = await fetchApi(url, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setError(errData.message || `Erreur serveur (${response.status})`);
        return;
      }

      const res = await response.json().catch(() => ({}));
      if (res.succes || res.success) {
        setSuccessMsg(editing ? 'Enseignant modifié avec succès' : 'Enseignant créé avec succès');
        closeModal();
        fetchData();
      } else {
        setError(res.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion au serveur');
    } finally { setSaving(false); }
  };

  const handleEdit = (e) => {
    setEditing(e);
    setForm({
      nom: e.nom || '',
      prenoms: e.prenom || e.prenoms || '',
      email: e.email || e.utilisateur_email || '',
      telephone: e.telephone || '',
      grade: e.grade || '',
      departement_id: e.departement_id || '',
      statut: e.statut || 'actif',
      password: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet enseignant ?')) return;
    try {
      const response = await fetchApi(`/api/enseignants/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchData();
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur de connexion au serveur');
    }
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); setError(''); };

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-100 text-gray-600';
    for (const [key, val] of Object.entries(gradeColors)) {
      if (grade.includes(key) || key.includes(grade)) return val;
    }
    return 'bg-purple-100 text-purple-700';
  };

  const avatarColors = [
    'bg-gradient-to-br from-violet-500 to-purple-600',
    'bg-gradient-to-br from-emerald-500 to-teal-600',
    'bg-gradient-to-br from-amber-500 to-orange-600',
    'bg-gradient-to-br from-sky-500 to-blue-600',
    'bg-gradient-to-br from-rose-500 to-pink-600',
    'bg-gradient-to-br from-indigo-500 to-violet-600',
  ];

  return (
    <div className="space-y-6">
      {/* Message de succès */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-center justify-between">
          {successMsg}
          <button onClick={() => setSuccessMsg('')} className="text-green-500 hover:text-green-700"><X size={16} /></button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          <span>Teacher&apos;s Plan</span>
          <ChevronRight size={12} />
          <span>Enseignants</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0F2B46]">Enseignants</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gérez les enseignants, leurs affectations et leurs informations</p>
      </div>

      {/* Filtres + Ajouter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un enseignant..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        <select value={filtreDep} onChange={(e) => setFiltreDep(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none min-w-[180px]">
          <option value="">Tous les départements</option>
          {Array.isArray(departements) && departements.map(d => (
            <option key={d.id} value={d.id}>{d.nom}</option>
          ))}
        </select>

        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none min-w-[150px]">
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
          <option value="suspendu">Suspendu</option>
        </select>

        <button onClick={() => { closeModal(); setShowModal(true); }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg whitespace-nowrap">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 via-purple-600 to-violet-600">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Enseignant</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Département</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Grade</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Téléphone</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Heures</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <Users size={40} className="mx-auto mb-3 opacity-30" />
                      <p>Aucun enseignant trouvé</p>
                    </td>
                  </tr>
                ) : (
                  paginees.map((e, i) => (
                    <tr key={e.id} className={`transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-purple-50/40'} hover:bg-purple-50/70`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm`}>
                            {(e.prenom || e.prenoms || e.nom || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0F2B46]">{e.prenom || e.prenoms} {e.nom}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Mail size={11} /> {e.email || e.utilisateur_email || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600 flex items-center gap-1.5">
                          <Building2 size={14} className="text-gray-400" />
                          {e.departement_nom || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${getGradeColor(e.grade)}`}>
                          <GraduationCap size={12} />
                          {e.grade || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600 flex items-center gap-1.5">
                          <Phone size={13} className="text-gray-400" />
                          {e.telephone || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                          <Clock size={13} className="text-purple-400" />
                          {e.heures || 0}h
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          (e.statut || 'actif') === 'actif'
                            ? 'bg-emerald-100 text-emerald-700'
                            : (e.statut || '') === 'suspendu'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          {(e.statut || 'actif') === 'actif' ? '● ' : ''}{(e.statut || 'actif').charAt(0).toUpperCase() + (e.statut || 'actif').slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(e)}
                            className="p-2 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors" title="Modifier">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(e.id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Supprimer">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > ITEMS && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-sm text-gray-500">
                Affichage {(page - 1) * ITEMS + 1}-{Math.min(page * ITEMS, filtered.length)} sur {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalP }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      p === page
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalP, p + 1))} disabled={page === totalP}
                  className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={(ev) => ev.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editing ? 'Modifier l&apos;enseignant' : 'Nouvel enseignant'}
              </h2>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input type="text" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénoms *</label>
                  <input type="text" value={form.prenoms} onChange={e => setForm({ ...form, prenoms: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none"
                    placeholder="email@una.ci" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="tel" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none"
                    placeholder="+225 07 XX XX XX" />
                </div>
              </div>

              {/* Champ mot de passe - uniquement à la création */}
              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none"
                    placeholder="Définir un mot de passe" required />
                  <p className="text-xs text-gray-400 mt-1">Ce mot de passe sera utilisé pour la connexion de l'enseignant</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                  <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" required>
                    <option value="">— Sélectionner —</option>
                    <option value="Professeur">Professeur Titulaire</option>
                    <option value="Maître de Conférences">Maître de Conférences</option>
                    <option value="Maître Assistant">Maître Assistant</option>
                    <option value="Docteur">Docteur</option>
                    <option value="Attaché">Attaché de Recherche</option>
                    <option value="Assistant">Assistant</option>
                    <option value="Vacataire">Vacataire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                  <select value={form.departement_id} onChange={e => setForm({ ...form, departement_id: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none">
                    <option value="">— Sélectionner —</option>
                    {Array.isArray(departements) && departements.map(d => (
                      <option key={d.id} value={d.id}>{d.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none">
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md disabled:opacity-60">
                  {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}