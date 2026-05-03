import { useState, useEffect, useMemo } from 'react';
import {
  Building2, Search, ChevronRight, ChevronLeft, Plus, X, Pencil,
  Trash2, Users, GraduationCap, User
} from 'lucide-react';

const getToken = () => localStorage.getItem('token');
const fetchApi = (url, opts = {}) => fetch(url, {
  headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, ...opts,
});

const ITEMS = 6;
const emptyForm = { code: '', nom: '', description: '' };

const avatarColors = [
  'bg-gradient-to-br from-purple-500 to-violet-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-sky-500 to-blue-600',
  'bg-gradient-to-br from-rose-500 to-pink-600',
  'bg-gradient-to-br from-indigo-500 to-violet-600',
];

export default function Departements() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setPage(1); }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/departements');
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        const arr = json?.data || [];
        if (Array.isArray(arr)) setData(arr);
      }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    if (!search) return data;
    const term = search.toLowerCase();
    return data.filter((d) => (d.nom || '').toLowerCase().includes(term) || (d.code || '').toLowerCase().includes(term));
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS);
  const paginees = filtered.slice((page - 1) * ITEMS, page * ITEMS);

  const stats = useMemo(() => ({
    total: data.length,
    totalEns: data.reduce((s, d) => s + parseInt(d.nb_enseignants || 0), 0),
    totalFil: data.reduce((s, d) => s + parseInt(d.nb_filieres || 0), 0),
  }), [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/departements/${editing.id}` : '/api/departements';
      const res = await fetchApi(url, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      }).then(r => r.ok ? r.json().catch(() => ({})) : ({}));
      if (res.success) { closeModal(); fetchData(); }
    } catch {} finally { setSaving(false); }
  };

  const handleEdit = (d) => {
    setEditing(d);
    setForm({ code: d.code || '', nom: d.nom || '', description: d.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce département ?')) return;
    try {
      await fetchApi(`/api/departements/${id}`, { method: 'DELETE' });
      fetchData();
    } catch {}
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          <span>Teacher's Plan</span>
          <ChevronRight size={12} />
          <span>Départements</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0F2B46]">Départements</h1>
        <p className="text-gray-500 text-sm mt-0.5">Organisation des départements de l'université</p>
      </div>

      {/* Stats dégradées */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-5 shadow-lg">
          <Building2 className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Départements</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? <span className="inline-block w-12 h-8 bg-white/20 rounded animate-pulse" /> : stats.total}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 shadow-lg">
          <Users className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Enseignants</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? <span className="inline-block w-12 h-8 bg-white/20 rounded animate-pulse" /> : stats.totalEns}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 shadow-lg">
          <GraduationCap className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Filières</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? <span className="inline-block w-12 h-8 bg-white/20 rounded animate-pulse" /> : stats.totalFil}
          </p>
        </div>
      </div>

      {/* Recherche + Ajouter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un département..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
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
              {/* En-tête gradient */}
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 via-purple-600 to-violet-600">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Département</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Code</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Enseignants</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Filières</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Chef</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400">
                      <Building2 size={40} className="mx-auto mb-3 opacity-30" />
                      <p>Aucun département trouvé</p>
                    </td>
                  </tr>
                ) : (
                  paginees.map((d, i) => (
                    <tr key={d.id} className={`transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-purple-50/40'} hover:bg-purple-50/70`}>
                      {/* Département */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${avatarColors[i % avatarColors.length]} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <Building2 size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0F2B46]">{d.nom}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{d.description || '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-5 py-4">
                        <span className="bg-purple-100 text-purple-700 text-xs font-bold font-mono px-2.5 py-1 rounded-lg">
                          {d.code || '—'}
                        </span>
                      </td>

                      {/* Enseignants */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                          <Users size={13} className="text-emerald-500" />
                          {d.nb_enseignants || 0}
                        </span>
                      </td>

                      {/* Filières */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                          <GraduationCap size={13} className="text-amber-500" />
                          {d.nb_filieres || 0}
                        </span>
                      </td>

                      {/* Chef */}
                      <td className="px-5 py-4">
                        {d.chef_prenom ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-white">{d.chef_prenom.charAt(0)}</span>
                            </div>
                            <span className="text-sm text-gray-700">{d.chef_prenom} {d.chef_nom}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(d)}
                            className="p-2 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors" title="Modifier">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(d.id)}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      p === page
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editing ? 'Modifier le département' : 'Nouveau département'}
              </h2>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none"
                    placeholder="Ex: INFO" required disabled={!!editing} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md disabled:opacity-60">
                  {saving ? '...' : editing ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}