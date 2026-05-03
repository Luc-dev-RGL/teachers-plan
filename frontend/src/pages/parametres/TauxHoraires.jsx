import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Bouton from '../../components/ui/Bouton.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Alerte from '../../components/ui/Alerte.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { Plus, Settings, Pencil, Trash2 } from 'lucide-react';

const TYPES_ENSEIGNANT = ['PROF', 'MA', 'MC', 'DR', 'PAST', 'VAC', 'Contractuel'];
const TYPES_COURS = ['CM', 'TD', 'TP', 'Projet'];

export default function TauxHoraires() {
  const [taux, setTaux] = useState([]);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ type_enseignant: '', type_cours: '', montant: '' });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);
  const [enSauvegarde, setEnSauvegarde] = useState(false);

  useEffect(() => {
    api.get('/taux-horaires')
      .then((r) => setTaux(r.data))
      .catch(() => setTaux([]))
      .finally(() => setChargement(false));
  }, []);

  const ouvrir = (t = null) => {
    setEdit(t);
    setForm(t ? { type_enseignant: t.type_enseignant, type_cours: t.type_cours, montant: t.montant.toString() } : { type_enseignant: '', type_cours: '', montant: '' });
    setModal(true);
    setErreur('');
  };

  const sauvegarder = async (e) => {
    e.preventDefault();
    setEnSauvegarde(true);
    setErreur('');
    try {
      const donnees = { ...form, montant: parseFloat(form.montant) };
      if (edit) {
        const res = await api.put(`/taux-horaires/${edit.id}`, donnees);
        setTaux((prev) => prev.map((t) => (t.id === edit.id ? { ...t, ...res.data } : t)));
      } else {
        const res = await api.post('/taux-horaires', donnees);
        setTaux((prev) => [...prev, res.data]);
      }
      setModal(false);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    } finally {
      setEnSauvegarde(false);
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer ce taux ?')) return;
    try {
      await api.delete(`/taux-horaires/${id}`);
      setTaux((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    }
  };

  if (chargement) return <div className="py-8 text-center text-slate-400">Chargement...</div>;

  const getLabelType = (type) => {
    const labels = { PROF: 'Professeur', MA: 'Maître Assistant', MC: 'Maître de Conférences', DR: 'Docteur', PAST: 'PAST', VAC: 'Vacataire', Contractuel: 'Contractuel' };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Définissez les taux horaires par type d'enseignant et de cours.</p>
        <Bouton onClick={() => ouvrir()}><Plus size={16} /> Ajouter</Bouton>
      </div>

      {erreur && <Alerte type="erreur" message={erreur} fermer={() => setErreur('')} />}

      {taux.length === 0 ? (
        <EmptyState message="Aucun taux horaire défini" icone={Settings} />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container border-0 rounded-none">
            <table className="data-table">
              <thead>
                <tr><th>Type d'enseignant</th><th>Type de cours</th><th>Taux horaire</th><th>Devise</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody>
                {taux.map((t) => (
                  <tr key={t.id}>
                    <td className="font-medium">{getLabelType(t.type_enseignant)}</td>
                    <td><span className={`badge ${t.type_cours === 'CM' ? 'badge-info' : t.type_cours === 'TP' ? 'badge-success' : 'badge-warning'}`}>{t.type_cours}</span></td>
                    <td className="font-bold text-green-600">{new Intl.NumberFormat('fr-FR').format(t.montant)} FCFA</td>
                    <td className="text-slate-500">{t.devise || 'FCFA'}</td>
                    <td className="text-right">
                      <button onClick={() => ouvrir(t)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy"><Pencil size={15} /></button>
                      <button onClick={() => supprimer(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <Modal ouvert={modal} fermer={() => setModal(false)} titre={edit ? 'Modifier le taux' : 'Nouveau taux horaire'}>
          <form onSubmit={sauvegarder} className="space-y-4">
            <div>
              <label className="label-field">Type d'enseignant *</label>
              <select value={form.type_enseignant} onChange={(e) => setForm({ ...form, type_enseignant: e.target.value })} required className="select-field">
                <option value="">Sélectionner...</option>
                {TYPES_ENSEIGNANT.map((t) => <option key={t} value={t}>{getLabelType(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Type de cours *</label>
              <select value={form.type_cours} onChange={(e) => setForm({ ...form, type_cours: e.target.value })} required className="select-field">
                <option value="">Sélectionner...</option>
                {TYPES_COURS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Montant (FCFA) *</label>
              <input type="number" step="1" min="0" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} required className="input-field" placeholder="Ex: 5000" />
            </div>
            <div className="flex gap-3 pt-2">
              <Bouton variante="secondaire" onClick={() => setModal(false)} type="button">Annuler</Bouton>
              <Bouton type="submit" chargement={enSauvegarde}>{edit ? 'Mettre à jour' : 'Ajouter'}</Bouton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}