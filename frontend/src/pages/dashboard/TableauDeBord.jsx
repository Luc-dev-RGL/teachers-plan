import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import {
  Users, Clock, Calendar, DoorOpen, UserPlus,
  PlusCircle, ClipboardList, TrendingUp, CalendarX,
  Building2, ChevronRight
} from 'lucide-react';

export default function TableauDeBord() {
  const { utilisateur } = utiliserAuth();
  const navigate = useNavigate();
  const [donnees, setDonnees] = useState({
    annee: null,
    statistiques: { nb_enseignants: 0, seances_ce_mois: 0, total_heures: 0, nb_salles: 0, heures_prevues: 0 },
    departements: [],
    seances_recentes: [],
  });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => {
        const d = res.data;
        // Compatible : success OU succes, data OU donnees
        const ok = d.success || d.succes;
        const payload = d.data || d;
        if (ok && payload) {
          setDonnees({
            annee: payload.annee || null,
            statistiques: payload.statistiques || { nb_enseignants: 0, seances_ce_mois: 0, total_heures: 0, nb_salles: 0, heures_prevues: 0 },
            departements: Array.isArray(payload.departements) ? payload.departements : [],
            seances_recentes: Array.isArray(payload.seances_recentes) ? payload.seances_recentes : [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  const { statistiques, departements, seances_recentes, annee } = donnees;
  const heuresEffectuees = parseFloat(statistiques.total_heures || 0);
  const heuresPrevues = parseFloat(statistiques.heures_prevues || 0);
  const progressionHeures = heuresPrevues > 0 ? Math.round((heuresEffectuees / heuresPrevues) * 100) : 0;
  const maxHeures = departements.length > 0 ? Math.max(...departements.map((d) => parseFloat(d.heures || 0)), 1) : 1;

  const formatStatut = (statut) => {
    const map = {
      'planifiee': { label: 'Planifiée', classe: 'bg-blue-100 text-blue-700' },
      'terminee': { label: 'Terminée', classe: 'bg-emerald-100 text-emerald-700' },
      'en_cours': { label: 'En cours', classe: 'bg-amber-100 text-amber-700' },
      'annulee': { label: 'Annulée', classe: 'bg-red-100 text-red-700' },
    };
    return map[statut] || { label: statut, classe: 'bg-gray-100 text-gray-700' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const barCouleurs = ['bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-pink-500', 'bg-indigo-500'];

  return (
    <div className="space-y-6">
      {/* Bannière */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 p-6 md:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-purple-200 text-sm font-medium">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              Bonjour, {utilisateur?.prenom || ''} 👋
            </h1>
            <p className="text-purple-100 mt-2 text-sm">
              {annee?.libelle ? `Année académique : ${annee.libelle}` : "Tableau de bord"}
            </p>
          </div>
          {!chargement && (
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{heuresEffectuees.toFixed(0)}h</p>
                <p className="text-purple-200 text-xs">Effectuées</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">{heuresPrevues.toFixed(0)}h</p>
                <p className="text-purple-200 text-xs">Prévues</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">{progressionHeures}%</p>
                <p className="text-purple-200 text-xs">Progression</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-5 shadow-lg">
          <Clock className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Heures effectuées</p>
          <p className="text-2xl font-bold text-white mt-1">
            {chargement ? <span className="inline-block w-16 h-7 bg-white/20 rounded animate-pulse" /> : heuresEffectuees.toFixed(1) + ' h'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 shadow-lg">
          <Users className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Enseignants actifs</p>
          <p className="text-2xl font-bold text-white mt-1">
            {chargement ? <span className="inline-block w-16 h-7 bg-white/20 rounded animate-pulse" /> : (statistiques.nb_enseignants || 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 shadow-lg">
          <Calendar className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Séances ce mois</p>
          <p className="text-2xl font-bold text-white mt-1">
            {chargement ? <span className="inline-block w-16 h-7 bg-white/20 rounded animate-pulse" /> : (statistiques.seances_ce_mois || 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl p-5 shadow-lg">
          <DoorOpen className="w-6 h-6 text-white/40" />
          <p className="text-white/80 text-sm mt-3">Salles</p>
          <p className="text-2xl font-bold text-white mt-1">
            {chargement ? <span className="inline-block w-16 h-7 bg-white/20 rounded animate-pulse" /> : (statistiques.nb_salles || 0)}
          </p>
        </div>
      </div>

      {/* Progression */}
      {!chargement && heuresPrevues > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#0F2B46] flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-500" /> Progression heures
            </h3>
            <span className="text-sm font-bold text-purple-600">{progressionHeures}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${progressionHeures >= 100 ? 'bg-emerald-500' : progressionHeures >= 75 ? 'bg-amber-500' : 'bg-purple-500'}`}
              style={{ width: `${Math.min(progressionHeures, 100)}%` }} />
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button onClick={() => navigate('/enseignants')} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all hover:shadow-lg text-sm font-medium">
          <UserPlus size={18} /> <span>Nouvel enseignant</span>
        </button>
        <button onClick={() => navigate('/heures')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all hover:shadow-lg text-sm font-medium">
          <PlusCircle size={18} /> <span>Saisir des heures</span>
        </button>
        <button onClick={() => navigate('/seances')} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all hover:shadow-lg text-sm font-medium">
          <ClipboardList size={18} /> <span>Séances de cours</span>
        </button>
        <button onClick={() => navigate('/emploi-du-temps')} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all hover:shadow-lg text-sm font-medium">
          <TrendingUp size={18} /> <span>Emploi du temps</span>
        </button>
      </div>

      {/* Départements + Séances récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-[#0F2B46] text-base flex items-center gap-2">
              <Building2 size={18} className="text-purple-500" /> Heures par département
            </h3>
            <button onClick={() => navigate('/enseignants')} className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium">
              Voir tout <ChevronRight size={14} />
            </button>
          </div>
          {chargement ? (
            <div className="space-y-4">{[1, 2, 3].map((n) => (
              <div key={n}>
                <div className="flex justify-between mb-1.5"><span className="w-28 h-4 bg-gray-200 rounded animate-pulse" /><span className="w-14 h-4 bg-gray-200 rounded animate-pulse" /></div>
                <div className="w-full bg-gray-100 rounded-full h-3"><div className="h-full rounded-full bg-gray-300 animate-pulse" style={{ width: `${n * 25}%` }} /></div>
              </div>
            ))}</div>
          ) : departements.length > 0 ? (
            <div className="space-y-4">
              {departements.slice(0, 5).map((dept, i) => {
                const pct = Math.round((parseFloat(dept.heures || 0) / maxHeures) * 100);
                return (
                  <div key={dept.code || i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{dept.nom}</span>
                      <span className="text-sm font-semibold text-[#0F2B46]">{parseFloat(dept.heures || 0).toFixed(1)} h</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className={`h-full rounded-full ${barCouleurs[i % barCouleurs.length]} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <TrendingUp size={36} className="mb-2 opacity-30" />
              <p className="text-sm">Aucune donnée</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#0F2B46] text-base flex items-center gap-2">
              <Calendar size={18} className="text-purple-500" /> Séances récentes
            </h3>
            <button onClick={() => navigate('/seances')} className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium">
              Voir tout <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {chargement ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-100">
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="w-1/2 h-3 bg-gray-100 rounded animate-pulse" />
                </div>
              ))
            ) : seances_recentes.length > 0 ? (
              seances_recentes.slice(0, 6).map((s, i) => {
                const st = formatStatut(s.statut);
                return (
                  <div key={i} className="p-3 rounded-lg border border-gray-50 hover:border-purple-100 hover:bg-purple-50/30 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0F2B46] truncate">{s.matiere_nom}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.enseignant_prenom} {s.enseignant_nom}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.classe_nom} · {formatDate(s.date)} {s.heure_debut}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${st.classe}`}>{st.label}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <CalendarX size={36} className="mb-2 opacity-30" />
                <p className="text-sm">Aucune séance récente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}