import { useState } from 'react';
import api from '../../services/api.js';
import Bouton from '../../components/ui/Bouton.jsx';
import Alerte from '../../components/ui/Alerte.jsx';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

export default function ImportDonnees() {
  const [fichier, setFichier] = useState(null);
  const [type, setType] = useState('enseignants');
  const [chargement, setChargement] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState('');

  const handleImport = async (e) => {
    e.preventDefault();
    if (!fichier) return;
    setChargement(true);
    setErreur('');
    setResultat(null);

    const formData = new FormData();
    formData.append('fichier', fichier);
    formData.append('type', type);

    try {
      const res = await api.post('/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResultat(res.data);
      setFichier(null);
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de l'import");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-slate-500">
        Importez des données en masse depuis un fichier CSV ou Excel. Le fichier doit respecter le format attendu pour chaque type de données.
      </p>

      {erreur && <Alerte type="erreur" message={erreur} fermer={() => setErreur('')} />}
      {resultat && (
        <Alerte
          type="succes"
          message={`${resultat.crees || 0} enregistrements créés, ${resultat.mis_a_jour || 0} mis à jour, ${resultat.erreurs || 0} erreurs.`}
          fermer={() => setResultat(null)}
        />
      )}

      <form onSubmit={handleImport} className="card p-6 space-y-4">
        <div>
          <label className="label-field">Type de données</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="select-field">
            <option value="enseignants">Enseignants</option>
            <option value="matieres">Matières</option>
            <option value="seances">Séances de cours</option>
            <option value="departements">Départements</option>
          </select>
        </div>

        <div>
          <label className="label-field">Fichier (CSV ou Excel)</label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-navy/50 transition-colors">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFichier(e.target.files[0])}
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file" className="cursor-pointer">
              <FileSpreadsheet size={32} className="mx-auto text-slate-400 mb-2" />
              {fichier ? (
                <p className="text-sm text-navy font-medium">{fichier.name}</p>
              ) : (
                <>
                  <p className="text-sm text-slate-500">Cliquez ou glissez un fichier</p>
                  <p className="text-xs text-slate-400 mt-1">CSV, XLS, XLSX</p>
                </>
              )}
            </label>
          </div>
        </div>

        <Bouton type="submit" chargement={chargement} desactive={!fichier}>
          <Upload size={16} /> Importer
        </Bouton>
      </form>

      {/* Modèles */}
      <div className="card p-5">
        <h4 className="font-medium text-sm text-midnight mb-3">Formats attendus</h4>
        <div className="space-y-2 text-xs text-slate-500">
          <p><strong>Enseignants :</strong> matricule, nom, prénom, email, téléphone, grade, spécialité, code_département</p>
          <p><strong>Matières :</strong> code, nom, type_cours, crédit, coefficient, code_filière</p>
          <p><strong>Séances :</strong> date, heure_début, heure_fin, type_cours, matricule_enseignant, code_matière, code_salle, code_classe</p>
          <p><strong>Départements :</strong> code, nom, description</p>
        </div>
      </div>
    </div>
  );
}