import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Bouton from '../../components/ui/Bouton.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Alerte from '../../components/ui/Alerte.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Plus, Users, Pencil, Trash2, Search } from 'lucide-react';

export default function GestionUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const parPage = 10;

  useEffect(() => {
    api.get('/utilisateurs')
      .then((r) => setUtilisateurs(r.data))
      .catch(() => setUtilisateurs([]))
      .finally(() => setChargement(false));
  }, []);

  const filtered = utilisateurs.filter((u) => {
    const t = recherche.toLowerCase();
    return u.nom?.toLowerCase().includes(t) || u.prenom?.toLowerCase().includes(t) || u.email?.toLowerCase().includes(t);
  });
  const paginated = filtered.slice((page - 1) * parPage, page * parPage);

  const ouvrir = (u = null) => {
    setEdit(u);
    setModal(true);
    setErreur('');
  };

  const sauvegarder = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const donnees = Object.fromEntries(form);
    try {
      if (edit) {
        const res = await api.put(`/utilisateurs/${edit.id}`, donnees);
        setUtilisateurs((prev) => prev.map((u) => (u.id === edit.id ? { ...u, ...res.data } : u)));
      } else {
        const res = await api.post('/utilisateurs', donnees);
        setUtilisateurs((prev) => [...prev, res.data]);
      }
      setModal(false);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/utilisateurs/${id}`);
      setUtilisateurs((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    }
  };

  if (chargement) return <div className="py-8 text-center text-slate-400">Chargement...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} placeholder="Rechercher..." className="input-field pl-9" />
        </div>
        <Bouton onClick={() => ouvrir()}><Plus size={16} /> Nouvel utilisateur</Bouton>
      </div>

      {erreur && <Alerte type="erreur" message={erreur} fermer={() => setErreur('')} />}

      {paginated.length === 0 ? (
        <EmptyState message="Aucun utilisateur" icone={Users} />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container border-0 rounded-none">
            <table className="data-table">
              <thead>
                <tr><th>Nom complet</th><th>Email</th><th>Rôle</th><th>Statut</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody>
                {paginated.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.prenom} {u.nom}</td>
                    <td className="text-slate-500">{u.email}</td>
                    <td><Badge variant={u.role === 'admin' ? 'danger' : u.role === 'rh' ? 'warning' : 'info'}>{u.role === 'admin' ? 'Admin' : u.role === 'rh' ? 'RH' : 'Enseignant'}</Badge></td>
                    <td><Badge variant={u.actif !== false ? 'succes' : 'danger'}>{u.actif !== false ? 'Actif' : 'Inactif'}</Badge></td>
                    <td className="text-right">
                      <button onClick={() => ouvrir(u)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy"><Pencil size={15} /></button>
                      <button onClick={() => supprimer(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                    </td>
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

      {modal && (
        <Modal ouvert={modal} fermer={() => setModal(false)} titre={edit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}>
          <form onSubmit={sauvegarder} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Nom *</label>
                <input name="nom" type="text" defaultValue={edit?.nom || ''} required className="input-field" />
              </div>
              <div>
                <label className="label-field">Prénom *</label>
                <input name="prenom" type="text" defaultValue={edit?.prenom || ''} required className="input-field" />
              </div>
            </div>
            <div>
              <label className="label-field">Email *</label>
              <input name="email" type="email" defaultValue={edit?.email || ''} required className="input-field" />
            </div>
            <div>
              <label className="label-field">Rôle *</label>
              <select name="role" defaultValue={edit?.role || 'enseignant'} className="select-field">
                <option value="admin">Administrateur</option>
                <option value="rh">RH</option>
                <option value="enseignant">Enseignant</option>
              </select>
            </div>
            {!edit && (
              <div>
                <label className="label-field">Mot de passe *</label>
                <input name="mot_de_passe" type="password" required className="input-field" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input type="checkbox" name="actif" id="actif" defaultChecked={edit?.actif !== false} className="rounded" />
              <label htmlFor="actif" className="text-sm">Compte actif</label>
            </div>
            <div className="flex gap-3 pt-2">
              <Bouton variante="secondaire" onClick={() => setModal(false)} type="button">Annuler</Bouton>
              <Bouton type="submit">{edit ? 'Mettre à jour' : 'Créer'}</Bouton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}