import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import Chargement from '../../components/ui/Chargement.jsx';
import Select from '../../components/ui/Select.jsx';
import { formaterHeures, formaterMontant } from '../../hooks/useCalculs.jsx';
import { BarChart3 } from 'lucide-react';

export default function ResumeHeures({ cle }) {
  const [resume, setResume] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [annee, setAnnee] = useState(new Date().getFullYear().toString());
  const [chargement, setChargement] = useState(true);
  const [totalGlobal, setTotalGlobal] = useState({ heures: 0, montant: 0 });

  useEffect(() => {
    const fetch = async () => {
      setChargement(true);
      try {
        const [resE, resH] = await Promise.all([api.get('/enseignants'), api.get('/heures/resume', { params: { annee } })]);
        setEnseignants(resE.data);
        setResume(resH.data || []);
        const t = (resH.data || []).reduce((acc, r) => ({ heures: acc.heures + (r.total_heures || 0), montant: acc.montant + (r.total_montant || 0) }), { heures: 0, montant: 0 });
        setTotalGlobal(t);
      } catch {
        setResume([]);
      } finally {
        setChargement(false);
      }
    };
    fetch();
  }, [cle, annee]);

  if (chargement) return <Chargement />;

  const maxHeures = Math.max(...resume.map((r) => r.total_heures || 0), 1);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <Select label="Année" valeur={annee} onChange={setAnnee} options={[
          { value: '2024', label: '2024' }, { value: '2025', label: '2025' }, { value: '2026', label: '2026' },
        ]} />
      </div>

      {/* Totaux globaux */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 text-center">
          <p className="text-sm text-slate-500">Total heures equiv. TD</p>
          <p className="text-2xl font-bold text-midnight">{formaterHeures(totalGlobal.heures)}</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-sm text-slate-500">Montant total</p>
          <p className="text-2xl font-bold text-green-600">{formaterMontant(totalGlobal.montant)}</p>
        </div>
      </div>

      {/* Barres */}
      {resume.length === 0 ? (
        <div className="text-center py-8 text-slate-400">Aucune donnée pour cette année</div>
      ) : (
        <div className="space-y-3">
          {resume.map((r, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-navy/10 flex items-center justify-center text-navy text-[10px] font-bold">
                    {r.prenom?.[0]}{r.nom?.[0]}
                  </div>
                  <span className="font-medium text-sm">{r.prenom} {r.nom}</span>
                </div>
                <div className="text-right text-sm">
                  <span className="font-medium">{formaterHeures(r.total_heures)}</span>
                  <span className="text-slate-400 ml-2">{formaterMontant(r.total_montant)}</span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-midnight transition-all" style={{ width: `${(r.total_heures / maxHeures) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}