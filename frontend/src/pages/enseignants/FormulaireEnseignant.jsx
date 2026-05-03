import { useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import Bouton from '../../components/ui/Bouton.jsx';
import Select from '../../components/ui/Select.jsx';

export default function FormulaireEnseignant({ enseignant, departements, fermer, sauvegarder }) {
  const estEdition = !!enseignant;
  const [formulaire, setFormulaire] = useState({
    matricule: enseignant?.matricule || '',
    nom: enseignant?.nom || '',
    prenom: enseignant?.prenom || '',
    email: enseignant?.email || enseignant?.utilisateur?.email || '',
    telephone: enseignant?.telephone || '',
    specialite: enseignant?.specialite || '',
    specialite: enseignant?.specialite || '', // Le champ specialite n'existe pas dans la table enseignants du Init.sql, il faudra le gérer côté backend si nécessaire ou le retirer du formulaire.
    grade: enseignant?.grade || '',
    departement_id: enseignant?.departement_id || enseignant?.departementId || '',
    departement_id: enseignant?.departement_id || '', // Simplifié pour la cohérence
    mot_de_passe: '',
  });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleChange = (champ, valeur) => {
    setFormulaire((prev) => ({ ...prev, [champ]: valeur }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      await sauvegarder(formulaire);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setChargement(false);
    }
  };

  const deps = (departements || []).map((d) => ({ value: d.id, label: d.nom }));

  return (
    <Modal ouvert={true} fermer={fermer} titre={estEdition ? 'Modifier l\'enseignant' : 'Nouvel enseignant'}>
      {erreur && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{erreur}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Nom *</label>
            <input type="text" value={formulaire.nom} onChange={(e) => handleChange('nom', e.target.value)} required className="input-field" />
          </div>
          <div>
            <label className="label-field">Prénom *</label>
            <input type="text" value={formulaire.prenom} onChange={(e) => handleChange('prenom', e.target.value)} required className="input-field" />
          </div>
        </div>

        <div>
          <label className="label-field">Matricule *</label>
          <input type="text" value={formulaire.matricule} onChange={(e) => handleChange('matricule', e.target.value)} required className="input-field" placeholder="Ex: ENS-2024-001" />
        </div>

        <div>
          <label className="label-field">Email *</label>
          <input type="email" value={formulaire.email} onChange={(e) => handleChange('email', e.target.value)} required className="input-field" />
        </div>

        {!estEdition && (
          <div>
            <label className="label-field">Mot de passe *</label>
            <input type="password" value={formulaire.mot_de_passe} onChange={(e) => handleChange('mot_de_passe', e.target.value)} required={!estEdition} className="input-field" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">Téléphone</label>
            <input type="text" value={formulaire.telephone} onChange={(e) => handleChange('telephone', e.target.value)} className="input-field" />
          </div>
          <div>
            <Select
              label="Grade"
              valeur={formulaire.grade}
              onChange={(v) => handleChange('grade', v)}
              options={[
                { value: 'PROF', label: 'Professeur' },
                { value: 'MA', label: 'Maître Assistant' },
                { value: 'MC', label: 'Maître de Conférences' },
                { value: 'DR', label: 'Docteur' },
                { value: 'PAST', label: 'PAST' },
                { value: 'VAC', label: 'Vacataire' },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="label-field">Spécialité</label>
          <input type="text" value={formulaire.specialite} onChange={(e) => handleChange('specialite', e.target.value)} className="input-field" />
        </div>

        <Select
          label="Département *"
          valeur={formulaire.departement_id}
          onChange={(v) => handleChange('departement_id', v)}
          options={deps}
        />

        <div className="flex gap-3 pt-2">
          <Bouton variante="secondaire" onClick={fermer} type="button">Annuler</Bouton>
          <Bouton type="submit" chargement={chargement}>
            {estEdition ? 'Mettre à jour' : 'Créer l\'enseignant'}
          </Bouton>
        </div>
      </form>
    </Modal>
  );
}