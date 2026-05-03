import { useState, useEffect, useMemo } from 'react';
import {
  DoorOpen, Search, ChevronRight, ChevronLeft, Plus, X, Pencil,
  Trash2, Users, Building2, Maximize2
} from 'lucide-react';

const getToken = () => localStorage.getItem('token');
const fetchApi = (url, opts = {}) => fetch(url, {
  headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, ...opts,
});

const ITEMS = 6;
const emptyForm = { code: '', nom: '', capacite: '', type: 'standard', batiment: '' };

const avatarColors = [
  'bg-gradient-to-br from-sky-500 to-blue-600',
  'bg-gradient-to-br from-violet-500 to-purple-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-rose-500 to-pink-600',
  'bg-gradient-to-br from-indigo-500 to-violet-600',
];

export default function Salles() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setPage(1); }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/salles');
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        const arr = json?.donnees || json?.data || [];
        if (Array.isArray(arr)) setData(arr);
      }
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [filtreType]);

  const filtered = useMemo(() => {
    return data.filter((s) => {
      const t = search.toLowerCase();
      return (!t || (s.nom || '').toLowerCase().includes(t) || (s.code || '').toLowerCase().includes(t))
        && (!filtreType || s.type === filtreType);
    });
  }, [data, search, filtreType]);
  const totalP = Math.ceil(filtered.length / ITEMS);
  const paginees = filtered.slice((page - 1) * ITEMS, page * ITEMS);

  const stats = useMemo(() => ({
    total: data.length,
    totalCap: data.reduce((s, s2) => s + parseInt(s2.capacite || 0), 0),
    types: new Set(data.map((s) => s.type).filter(Boolean)).size,
  }), [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/salles/${editing.id}` : '/api/salles';
      const res = await fetchApi(url, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form, capacite: form.capacite ? parseInt(form.capacite) : 30 }),
      }).then(r => r.ok ? r.json().catch(() => ({})) : ({}));
      if (res.success){ closeModal(); fetchData(); }
    } catch {} finally { setSaving(false); }
  };

  const handleEdit = (s) => {
    setEditing(s);
    setForm({ code: s.code || '', nom: s.nom || '', capacite: s.capacite || '', type: s.type || 'standard', batiment: s.batiment || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette salle ?')) return;
    try { await fetchApi(`/api/salles/${id}`, { method: 'DELETE' }); fetchData(); } catch {}
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };

  const typeBadge = (type) => {
    if (type === 'amphi') return { label: 'Amphi', cls: 'bg-purple-100 text-purple-700' };
    if (type === 'laboratoire') return { label: 'Labo', cls: 'bg-emerald-100 text-emerald-700' };
    if (type === 'informatique') return { label: 'Info', cls: 'bg-amber-100 text-amber-700' };
    return { label: 'Standard', cls: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          <span>Teacher's Plan</span><ChevronRight size={12} /><span>Salles</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0F2B46]">Salles</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gestion des salles et amphithéâtres</p>
      </div>

      {/* Stats dégradées */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl p-5 shadow-lg">
          <DoorOpen className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Salles</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? <span className="inline-block w-12 h-8 bg-white/20 rounded animate-pulse" /> : stats.total}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 shadow-lg">
          <Users className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Places totales</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? <span className="inline-block w-12 h-8 bg-white/20 rounded animate-pulse" /> : stats.totalCap}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 shadow-lg">
          <Building2 className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Types de salles</p>
          <p className="text-2xl font-bold text-white mt-1">
            {loading ? <span className="inline-block w-12 h-8 bg-white/20 rounded animate-pulse" /> : stats.types}
          </p>
        </div>
      </div>

      {/* Filtres + Ajouter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une salle..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <select value={filtreType} onChange={(e) => setFiltreType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none min-w-[160px]">
          <option value="">Tous les types</option>
          <option value="standard">Standard</option>
          <option value="amphi">Amphithéâtre</option>
          <option value="laboratoire">Laboratoire</option>
          <option value="informatique">Informatique</option>
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
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Salle</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Code</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Type</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Capacité</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Bâtiment</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400">
                      <DoorOpen size={40} className="mx-auto mb-3 opacity-30" />
                      <p>Aucune salle trouvée</p>
                    </td>
                  </tr>
                ) : (
                  paginees.map((s, i) => {
                    const t = typeBadge(s.type);
                    return (
                      <tr key={s.id} className={`transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-purple-50/40'} hover:bg-purple-50/70`}>
                        {/* Salle */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${avatarColors[i % avatarColors.length]} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                              <DoorOpen size={18} className="text-white" />
                            </div>
                            <p className="text-sm font-semibold text-[#0F2B46]">{s.nom}</p>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="px-5 py-4">
                          <span className="bg-sky-100 text-sky-700 text-xs font-bold font-mono px-2.5 py-1 rounded-lg">
                            {s.code || '—'}
                          </span>
                        </td>

                        {/* Type */}
                        <td className="px-5 py-4 text-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${t.cls}`}>{t.label}</span>
                        </td>

                        {/* Capacité */}
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                            <Users size={13} className="text-emerald-500" />
                            {s.capacite || 30}
                          </span>
                        </td>

                        {/* Bâtiment */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                            <Building2 size={14} className="text-gray-400" />
                            {s.batiment || '—'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEdit(s)}
                              className="p-2 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors" title="Modifier">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => handleDelete(s.id)}
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Supprimer">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editing ? 'Modifier la salle' : 'Nouvelle salle'}
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
                    required disabled={!!editing} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none">
                    <option value="standard">Standard</option>
                    <option value="amphi">Amphithéâtre</option>
                    <option value="laboratoire">Laboratoire</option>
                    <option value="informatique">Informatique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
                  <input type="number" value={form.capacite} onChange={(e) => setForm({ ...form, capacite: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none"
                    placeholder="30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bâtiment</label>
                <input type="text" value={form.batiment} onChange={(e) => setForm({ ...form, batiment: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none" />
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