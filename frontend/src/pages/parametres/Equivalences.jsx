import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Bouton from '../../components/ui/Bouton.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Alerte from '../../components/ui/Alerte.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Plus, Calculator, Pencil, Trash2 } from 'lucide-react';

export default function Equivalences() {
  const [equivalences, setEquivalences] = useState([]);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ type_cours: '', facteur: '' });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);
  const [enSauvegarde, setEnSauvegarde] = useState(false);

  useEffect(() => {
    api.get('/equivalences')
      .then((r) => setEquivalences(r.data))
      .catch(() => setEquivalences([]))
      .finally(() => setChargement(false));
  }, []);

  const ouvrir = (eq = null) => {
    setEdit(eq);
    setForm(eq ? { type_cours: eq.type_cours, facteur: eq.facteur.toString() } : { type_cours: '', facteur: '' });
    setModal(true);
    setErreur('');
  };

  const sauvegarder = async (e) => {
    e.preventDefault();
    setEnSauvegarde(true);
    setErreur('');
    try {
      const donnees = { type_cours: form.type_cours, facteur: parseFloat(form.facteur) };
      if (edit) {
        const res = await api.put(`/equivalences/${edit.id}`, donnees);
        setEquivalences((prev) => prev.map((eq) => (eq.id === edit.id ? { ...eq, ...res.data } : eq)));
      } else {
        const res = await api.post('/equivalences', donnees);
        setEquivalences((prev) => [...prev, res.data]);
      }
      setModal(false);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    } finally {
      setEnSauvegarde(false);
    }
  };

  const supprimer = async (id) => {
    if (!confirm('Supprimer cette équivalence ?')) return;
    try {
      await api.delete(`/equivalences/${id}`);
      setEquivalences((prev) => prev.filter((eq) => eq.id !== id));
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de suppression');
    }
  };

  if (chargement) return <div className="py-8 text-center text-slate-400">Chargement...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Définissez les facteurs de conversion pour chaque type de cours vers des heures équivalentes TD.
        </p>
        <Bouton onClick={() => ouvrir()}><Plus size={16} /> Ajouter</Bouton>
      </div>

      {erreur && <Alerte type="erreur" message={erreur} fermer={() => setErreur('')} />}

      {equivalences.length === 0 ? (
        <EmptyState message="Aucune équivalence définie" icone={Calculator} />
      ) : (
        <div className="space-y-2">
          {equivalences.map((eq) => (
            <div key={eq.id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                  eq.type_cours === 'CM' ? 'bg-blue-100 text-blue-700'
                  : eq.type_cours === 'TD' ? 'bg-amber-100 text-amber-700'
                  : eq.type_cours === 'TP' ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-700'
                }`}>
                  {eq.type_cours}
                </div>
                <div>
                  <p className="font-medium text-sm">{eq.type_cours === 'CM' ? 'Cours Magistral' : eq.type_cours === 'TD' ? 'Travaux Dirigés' : eq.type_cours === 'TP' ? 'Travaux Pratiques' : eq.type_cours}</p>
                  <p className="text-xs text-slate-500">1 heure {eq.type_cours} = <span className="font-bold text-navy">{eq.facteur}h</span> équiv. TD</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => ouvrir(eq)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-navy"><Pencil size={15} /></button>
                <button onClick={() => supprimer(eq.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal ouvert={modal} fermer={() => setModal(false)} titre={edit ? 'Modifier l\'équivalence' : 'Nouvelle équivalence'}>
          <form onSubmit={sauvegarder} className="space-y-4">
            <div>
              <label className="label-field">Type de cours *</label>
              <select value={form.type_cours} onChange={(e) => setForm({ ...form, type_cours: e.target.value })} required className="select-field">
                <option value="">Sélectionner...</option>
                <option value="CM">CM - Cours Magistral</option>
                <option value="TD">TD - Travaux Dirigés</option>
                <option value="TP">TP - Travaux Pratiques</option>
                <option value="Projet">Projet</option>
              </select>
            </div>
            <div>
              <label className="label-field">Facteur d'équivalence *</label>
              <input type="number" step="0.1" min="0" value={form.facteur} onChange={(e) => setForm({ ...form, facteur: e.target.value })} required className="input-field" placeholder="Ex: 1.5" />
              <p className="text-xs text-slate-400 mt-1">1 heure de ce type de cours = X heures équiv. TD</p>
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