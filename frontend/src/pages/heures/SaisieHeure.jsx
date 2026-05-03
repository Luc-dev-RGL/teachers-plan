import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Bouton from '../../components/ui/Bouton.jsx';
import Select from '../../components/ui/Select.jsx';
import Alerte from '../../components/ui/Alerte.jsx';
import { Calendar, Save } from 'lucide-react';

export default function SaisieHeure({ apresSauvegarde }) {
  const [form, setForm] = useState({
    enseignant_id: '',
    matiere_id: '',
    salle_id: '',
    classe_id: '',
    date_seance: new Date().toISOString().split('T')[0],
    heure_debut: '08:00',
    heure_fin: '09:30',
    type_cours: 'CM',
    annee_academique: '',
  });
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [salles, setSalles] = useState([]);
  const [classes, setClasses] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/enseignants'),
      api.get('/matieres'),
      api.get('/salles'),
      api.get('/classes'),
      api.get('/annees-academiques'),
    ]).then(([r1, r2, r3, r4, r5]) => {
      setEnseignants(r1.data);
      setMatieres(r2.data);
      setSalles(r3.data);
      setClasses(r4.data);
      setAnnees(r5.data);
      if (r5.data?.[0]) setForm((p) => ({ ...p, annee_academique: r5.data[0].id }));
    }).catch(() => {});
  }, []);

  const sauvegarder = async (e) => {
    e.preventDefault();
    setErreur('');
    setSucces('');
    setChargement(true);
    try {
      await api.post('/seances', form);
      setSucces('Séance créée avec succès ! Les heures seront calculées automatiquement.');
      setForm((p) => ({ ...p, enseignant_id: '', date_seance: '' }));
      apresSauvegarde?.();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur de création');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {erreur && <Alerte type="erreur" message={erreur} fermer={() => setErreur('')} />}
      {succes && <Alerte type="succes" message={succes} fermer={() => setSucces('')} />}

      <form onSubmit={sauvegarder} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Enseignant *" valeur={form.enseignant_id} onChange={(v) => setForm({ ...form, enseignant_id: v })} options={enseignants.map((e) => ({ value: e.id, label: `${e.prenom} ${e.nom} (${e.matricule})` }))} />
          <Select label="Matière *" valeur={form.matiere_id} onChange={(v) => setForm({ ...form, matiere_id: v })} options={matieres.map((m) => ({ value: m.id, label: `${m.code} - ${m.nom}` }))} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Salle" valeur={form.salle_id} onChange={(v) => setForm({ ...form, salle_id: v })} options={salles.map((s) => ({ value: s.id, label: `${s.code} - ${s.nom}` }))} />
          <Select label="Classe *" valeur={form.classe_id} onChange={(v) => setForm({ ...form, classe_id: v })} options={classes.map((c) => ({ value: c.id, label: `${c.code} - ${c.nom}` }))} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Date de la séance *</label>
            <input type="date" value={form.date_seance} onChange={(e) => setForm({ ...form, date_seance: e.target.value })} required className="input-field" />
          </div>
          <Select label="Année académique *" valeur={form.annee_academique} onChange={(v) => setForm({ ...form, annee_academique: v })} options={annees.map((a) => ({ value: a.id, label: a.libelle }))} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label-field">Heure début *</label>
            <input type="time" value={form.heure_debut} onChange={(e) => setForm({ ...form, heure_debut: e.target.value })} required className="input-field" />
          </div>
          <div>
            <label className="label-field">Heure fin *</label>
            <input type="time" value={form.heure_fin} onChange={(e) => setForm({ ...form, heure_fin: e.target.value })} required className="input-field" />
          </div>
          <Select label="Type de cours" valeur={form.type_cours} onChange={(v) => setForm({ ...form, type_cours: v })} options={[{ value: 'CM', label: 'CM' }, { value: 'TD', label: 'TD' }, { value: 'TP', label: 'TP' }, { value: 'Projet', label: 'Projet' }]} />
        </div>

        <Bouton type="submit" chargement={chargement}>
          <Save size={16} /> Enregistrer la séance
        </Bouton>
      </form>
    </div>
  );
}