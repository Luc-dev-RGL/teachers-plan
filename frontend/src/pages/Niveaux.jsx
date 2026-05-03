import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Search, ChevronRight, ChevronLeft, Plus, X, Pencil, Trash2, Layers, Users, ArrowUpDown
} from 'lucide-react';

const getToken = () => localStorage.getItem('token');
const fetchApi = (url, opts = {}) => fetch(url, {
  headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, ...opts,
});
const ITEMS = 8;
const emptyForm = { code: '', nom: '', ordre: '' };

const avatarColors = [
  'bg-gradient-to-br from-purple-400 to-purple-600',
  'bg-gradient-to-br from-emerald-400 to-emerald-600',
  'bg-gradient-to-br from-amber-400 to-amber-600',
  'bg-gradient-to-br from-violet-400 to-violet-600',
  'bg-gradient-to-br from-pink-400 to-pink-600',
  'bg-gradient-to-br from-teal-400 to-teal-600',
];

export default function Niveaux() {
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
      const res = await fetchApi('/api/niveaux').then((r) => r.ok ? r.json().catch(() => ({})) : ({}));
      if (res?.succes && Array.isArray(res.donnees)) setData(res.donnees);
    } catch {} setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    if (!search) return data;
    const t = search.toLowerCase();
    return data.filter((n) => (n.nom || '').toLowerCase().includes(t) || (n.code || '').toLowerCase().includes(t));
  }, [data, search]);
  const totalP = Math.ceil(filtered.length / ITEMS);
  const paginees = filtered.slice((page - 1) * ITEMS, page * ITEMS);

  const stats = useMemo(() => {
    const sorted = [...data].sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999));
    const minOrdre = sorted[0]?.ordre ?? 0;
    const maxOrdre = sorted.length > 0 ? sorted[sorted.length - 1]?.ordre ?? 0 : 0;
    return { total: data.length, minOrdre, maxOrdre };
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const url = editing ? `/api/niveaux/${editing.id}` : '/api/niveaux';
      const res = await fetchApi(url, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form, ordre: form.ordre ? parseInt(form.ordre) : null })
      }).then((r) => r.ok ? r.json().catch(() => ({})) : ({}));
      if (res.success){ closeModal(); fetchData(); }
    } catch {} setSaving(false);
  };

  const handleEdit = (n) => {
    setEditing(n);
    setForm({ code: n.code, nom: n.nom, ordre: n.ordre || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce niveau ?')) return;
    await fetchApi(`/api/niveaux/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Teacher's Plan</span><ChevronRight size={12} /><span>Niveaux</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F2B46]">Niveaux</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestion des niveaux académiques (L1, L2, L3, M1, M2...)</p>
        </div>
        <button
          onClick={() => { closeModal(); setShowModal(true); }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md shadow-purple-200"
        >
          <Plus size={16} />Ajouter
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-5 shadow-lg">
          <Layers className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Niveaux enregistrés</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? <span className="inline-block w-12 h-8 bg-white/20 rounded animate-pulse" /> : stats.total}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 shadow-lg">
          <ArrowUpDown className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Ordre le plus bas</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? <span className="inline-block w-12 h-8 bg-white/20 rounded animate-pulse" /> : stats.minOrdre || '—'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 shadow-lg">
          <BookOpen className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Ordre le plus haut</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? <span className="inline-block w-12 h-8 bg-white/20 rounded animate-pulse" /> : stats.maxOrdre || '—'}
          </p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un niveau..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
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
              <thead className="bg-gradient-to-r from-purple-600 via-purple-600 to-violet-600">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Niveau</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Code</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Ordre</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginees.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-gray-400">Aucun niveau trouvé</td></tr>
                ) : paginees.map((n, i) => (
                  <tr key={n.id} className={`transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-purple-50/40'} hover:bg-purple-50/70`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${avatarColors[i % avatarColors.length]} flex items-center justify-center shrink-0 shadow-sm`}>
                          <BookOpen size={18} className="text-white" />
                        </div>
                        <p className="text-sm font-semibold text-[#0F2B46]">{n.nom}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-purple-100 text-purple-700 text-xs font-mono px-2.5 py-1 rounded-md font-medium">{n.code}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {n.ordre != null ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                          <ArrowUpDown size={12} />{n.ordre}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      <button onClick={() => handleEdit(n)} className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > ITEMS && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Affichage {(page - 1) * ITEMS + 1}-{Math.min(page * ITEMS, filtered.length)} sur {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalP }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p} onClick={() => setPage(p)}
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
                  onClick={() => setPage((p) => Math.min(totalP, p + 1))} disabled={page === totalP}
                  className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editing ? 'Modifier le niveau' : 'Nouveau niveau'}</h2>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input
                    type="text" value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none"
                    placeholder="Ex: L1" required disabled={!!editing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text" value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none"
                    placeholder="Ex: Licence 1" required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                <input
                  type="number" value={form.ordre}
                  onChange={(e) => setForm({ ...form, ordre: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none"
                  placeholder="1, 2, 3..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit" disabled={saving}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md shadow-purple-200 disabled:opacity-60"
                >
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