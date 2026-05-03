import { useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import Bouton from '../../components/ui/Bouton.jsx';
import Select from '../../components/ui/Select.jsx';

export default function FormulaireMatiere({ matiere, filieres, fermer, sauvegarder }) {
  const estEdit = !!matiere;
  const [form, setForm] = useState({
    code: matiere?.code || '',
    nom: matiere?.nom || '',
    type_cours: matiere?.type_cours || 'CM',
    credit: matiere?.credit || 0,
    coefficient: matiere?.coefficient || 1,
    description: matiere?.description || '',
    filiere_id: matiere?.filiere_id || matiere?.filiereId || '',
  });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      await sauvegarder(form);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur');
    } finally {
      setChargement(false);
    }
  };

  return (
    <Modal ouvert={true} fermer={fermer} titre={estEdit ? 'Modifier la matière' : 'Nouvelle matière'}>
      {erreur && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{erreur}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Code *</label>
            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className="input-field" />
          </div>
          <div>
            <label className="label-field">Nom *</label>
            <input type="text" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Select label="Type de cours" valeur={form.type_cours} onChange={(v) => setForm({ ...form, type_cours: v })} options={[{ value: 'CM', label: 'CM' }, { value: 'TD', label: 'TD' }, { value: 'TP', label: 'TP' }, { value: 'Projet', label: 'Projet' }]} />
          <div>
            <label className="label-field">Crédits</label>
            <input type="number" value={form.credit} onChange={(e) => setForm({ ...form, credit: parseInt(e.target.value) || 0 })} className="input-field" min={0} />
          </div>
          <div>
            <label className="label-field">Coefficient</label>
            <input type="number" value={form.coefficient} onChange={(e) => setForm({ ...form, coefficient: parseInt(e.target.value) || 1 })} className="input-field" min={1} />
          </div>
        </div>
        <Select label="Filière *" valeur={form.filiere_id} onChange={(v) => setForm({ ...form, filiere_id: v })} options={(filieres || []).map((f) => ({ value: f.id, label: `${f.code} - ${f.nom}` }))} />
        <div>
          <label className="label-field">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
        </div>
        <div className="flex gap-3 pt-2">
          <Bouton variante="secondaire" onClick={fermer} type="button">Annuler</Bouton>
          <Bouton type="submit" chargement={chargement}>{estEdit ? 'Mettre à jour' : 'Créer'}</Bouton>
        </div>
      </form>
    </Modal>
  );
}