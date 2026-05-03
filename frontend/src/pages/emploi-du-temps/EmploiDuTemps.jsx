import { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, Users,
  BookOpen, DoorOpen, RefreshCw, Eye, GraduationCap,
} from 'lucide-react';

const getToken = () => localStorage.getItem('token');
const fetchApi = (url, opts = {}) => fetch(url, {
  headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, ...opts,
});

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const CRENEAUX = [
  '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
  '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
];

const getHeureMinutes = (h) => {
  const [hh, mm] = (h || '00:00').split(':').map(Number);
  return hh * 60 + (mm || 0);
};

const getTopPosition = (heure) => {
  const mins = getHeureMinutes(heure);
  return ((mins - 450) / 30) * 40;
};

const getHeight = (debut, fin) => {
  const mins = getHeureMinutes(fin) - getHeureMinutes(debut);
  return Math.max((mins / 30) * 40, 30);
};

export default function EmploiDuTemps() {
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Filtres
  const [vue, setVue] = useState('classe');
  const [filtreId, setFiltreId] = useState('');

  // Options
  const [classes, setClasses] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [salles, setSalles] = useState([]);

  // Detail
  const [detail, setDetail] = useState(null);

  // === Semaine ===
  const getWeekDates = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const lundi = new Date(d.setDate(diff));
    return JOURS.map((_, i) => {
      const dd = new Date(lundi);
      dd.setDate(lundi.getDate() + i);
      return dd.toISOString().split('T')[0];
    });
  };

  const weekDates = getWeekDates(currentWeek);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[5];
  const formatDateRange = () => {
    const d1 = new Date(weekStart + 'T00:00:00');
    const d2 = new Date(weekEnd + 'T00:00:00');
    const opts = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${d1.toLocaleDateString('fr-FR', opts)} — ${d2.toLocaleDateString('fr-FR', opts)}`;
  };

  const prevWeek = () => { const d = new Date(currentWeek); d.setDate(d.getDate() - 7); setCurrentWeek(d); };
  const nextWeek = () => { const d = new Date(currentWeek); d.setDate(d.getDate() + 7); setCurrentWeek(d); };
  const goToday = () => setCurrentWeek(new Date());

  // === FETCH ===
  const fetchSeances = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/seances?dateDebut=${weekStart}&dateFin=${weekEnd}`;
      if (filtreId) {
        if (vue === 'classe') url += `&classeId=${filtreId}`;
        else if (vue === 'enseignant') url += `&enseignantId=${filtreId}`;
        else if (vue === 'salle') url += `&salleId=${filtreId}`;
      }
      const res = await fetchApi(url);
      if (!res.ok) { setSeances([]); setLoading(false); return; }
      const json = await res.json().catch(() => ({}));
      const data = json.donnees || json.seances || json;
      setSeances(Array.isArray(data) ? data : []);
    } catch { setSeances([]); }
    setLoading(false);
  }, [weekStart, weekEnd, filtreId, vue]);

  const fetchOptions = useCallback(async () => {
    try {
      const [rCl, rEns, rSa] = await Promise.allSettled([
        fetchApi('/api/classes').then(r => r.ok ? r.json().catch(() => []) : []).catch(() => []),
        fetchApi('/api/enseignants').then(r => r.ok ? r.json().catch(() => []) : []).catch(() => []),
        fetchApi('/api/salles').then(r => r.ok ? r.json().catch(() => []) : []).catch(() => []),
      ]);
      const c = rCl.status === 'fulfilled' ? (rCl.value.donnees || rCl.value || []) : [];
      const e = rEns.status === 'fulfilled' ? (rEns.value.donnees || rEns.value || []) : [];
      const s = rSa.status === 'fulfilled' ? (rSa.value.donnees || rSa.value || []) : [];
      setClasses(Array.isArray(c) ? c : []);
      setEnseignants(Array.isArray(e) ? e : []);
      setSalles(Array.isArray(s) ? s : []);
    } catch {
      setClasses([]);
      setEnseignants([]);
      setSalles([]);
    }
  }, []);

  useEffect(() => { fetchSeances(); }, [fetchSeances]);
  useEffect(() => { fetchOptions(); }, [fetchOptions]);

  // === HELPERS ===
  const getSeancesByJour = (dateStr) => seances.filter(s => s.date === dateStr);

  const getEnseignantNom = (s) => {
    if (s.enseignant?.user) return `${s.enseignant.user.prenom} ${s.enseignant.user.nom}`;
    if (s.enseignant?.nom) return s.enseignant.nom;
    return s.enseignantNom || '—';
  };
  const getMatiereNom = (s) => s.matiere?.nom || s.matiereNom || '—';
  const getClasseNom = (s) => s.classe?.nom || s.classeNom || '—';
  const getSalleNom = (s) => s.salle?.nom || s.salleNom || '—';

  const getTypeColor = (type) => {
    if (type === 'CM') return { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700', dot: 'bg-purple-500' };
    if (type === 'TD') return { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-700', dot: 'bg-amber-500' };
    return { bg: 'bg-sky-100', border: 'border-sky-300', text: 'text-sky-700', dot: 'bg-sky-500' };
  };

  const getStatutDot = (statut) => {
    if (statut === 'effectuee') return 'bg-emerald-500';
    if (statut === 'annulee') return 'bg-red-500';
    return 'bg-amber-500';
  };

  const totalSeances = seances.length;
  const totalHeures = seances.reduce((a, s) => a + (s.nombreHeures || 0), 0);
  const cmCount = seances.filter(s => s.typeSeance === 'CM').length;
  const tdCount = seances.filter(s => s.typeSeance === 'TD').length;
  const tpCount = seances.filter(s => s.typeSeance === 'TP').length;

  const getEnseignantNomSimple = (e) => {
    if (e.user) return `${e.user.prenom} ${e.user.nom}`;
    return e.nom || e.matricule || '—';
  };

  // ==================== RENDU ====================
  return (
    <div className="space-y-6">
      {/* === EN-TÊTE === */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>Teacher's Plan</span><ChevronRight size={12} /><span>Gestion</span>
            <ChevronRight size={12} /><span className="text-purple-600 font-medium">Emploi du temps</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0F2B46]">Emploi du temps</h2>
          <p className="text-gray-500 text-sm mt-0.5">Vue hebdomadaire des séances</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchSeances} disabled={loading} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-60">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={prevWeek} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"><ChevronLeft size={16} /></button>
          <button onClick={goToday} className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium">Aujourd'hui</button>
          <button onClick={nextWeek} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* === STATS === */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total séances', value: totalSeances, gradient: 'bg-gradient-to-br from-purple-500 to-purple-600' },
          { label: 'Heures', value: `${totalHeures}h`, gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
          { label: 'CM', value: cmCount, gradient: 'bg-gradient-to-br from-purple-500 to-purple-700' },
          { label: 'TD', value: tdCount, gradient: 'bg-gradient-to-br from-amber-500 to-amber-600' },
          { label: 'TP', value: tpCount, gradient: 'bg-gradient-to-br from-sky-500 to-sky-600' },
        ].map((card, i) => (
          <div key={i} className={`${card.gradient} rounded-xl p-4 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
            <p className="text-xl font-bold">{card.value}</p>
            <p className="text-xs text-white/80 mt-0.5 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* === FILTRES === */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {[
              { key: 'classe', label: 'Par classe', icon: GraduationCap },
              { key: 'enseignant', label: 'Par enseignant', icon: Users },
              { key: 'salle', label: 'Par salle', icon: DoorOpen },
            ].map(v => {
              const Icon = v.icon;
              return (
                <button key={v.key} onClick={() => { setVue(v.key); setFiltreId(''); }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${vue === v.key ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  <Icon size={14} /> {v.label}
                </button>
              );
            })}
          </div>

          <select value={filtreId} onChange={e => setFiltreId(e.target.value)}
            className="flex-1 sm:max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-500 outline-none bg-white">
            <option value="">Tous</option>
            {vue === 'classe' && classes.map(c => <option key={c.id} value={c.id}>{c.code || c.nom}</option>)}
            {vue === 'enseignant' && enseignants.map(e => <option key={e.id} value={e.id}>{getEnseignantNomSimple(e)}</option>)}
            {vue === 'salle' && salles.map(s => <option key={s.id} value={s.id}>{s.code || s.nom}</option>)}
          </select>

          <p className="text-sm text-gray-500 flex items-center gap-1">
            <CalendarDays size={16} /> {formatDateRange()}
          </p>
        </div>
      </div>

      {/* === GRILLE === */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-200 border-t-purple-600 mx-auto" />
            <p className="text-sm text-gray-500 mt-4">Chargement de l'emploi du temps...</p>
          </div>
        ) : seances.length === 0 ? (
          <div className="py-20 text-center">
            <CalendarDays size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucune séance cette semaine</p>
            <p className="text-gray-400 text-sm mt-1">Changez de semaine ou de filtre pour voir des séances</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* En-tête jours */}
              <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-gray-200 bg-gray-50">
                <div className="p-2 text-xs font-semibold text-gray-500 text-center border-r border-gray-200">Heure</div>
                {weekDates.map((date, i) => {
                  const d = new Date(date + 'T00:00:00');
                  const isToday = date === new Date().toISOString().split('T')[0];
                  return (
                    <div key={i} className={`p-2 text-center border-r border-gray-200 last:border-r-0 ${isToday ? 'bg-purple-50' : ''}`}>
                      <p className={`text-xs font-semibold ${isToday ? 'text-purple-600' : 'text-gray-500'}`}>{JOURS[i]}</p>
                      <p className={`text-sm font-bold ${isToday ? 'text-purple-700' : 'text-gray-700'}`}>{d.getDate()}</p>
                    </div>
                  );
                })}
              </div>

              {/* Créneaux */}
              <div className="relative" style={{ minHeight: CRENEAUX.length * 40 }}>
                {CRENEAUX.map((creneau, i) => (
                  <div key={i} className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-gray-100" style={{ height: 40 }}>
                    <div className="text-[10px] text-gray-400 text-center py-1 border-r border-gray-200 font-medium">{creneau}</div>
                    <div className="border-r border-gray-100" />
                    <div className="border-r border-gray-100" />
                    <div className="border-r border-gray-100" />
                    <div className="border-r border-gray-100" />
                    <div className="border-r border-gray-100" />
                    <div />
                  </div>
                ))}

                {/* Séances positionnées */}
                {weekDates.map((date, jourIdx) => {
                  const seancesJour = getSeancesByJour(date);
                  return seancesJour.map(s => {
                    const colors = getTypeColor(s.typeSeance);
                    const top = getTopPosition(s.heureDebut);
                    const height = getHeight(s.heureDebut, s.heureFin);
                    const colLeft = `calc(80px + ${jourIdx} * calc((100% - 80px) / 6))`;
                    const colWidth = `calc((100% - 80px) / 6)`;
                    return (
                      <div key={s.id} onClick={() => setDetail(s)}
                        className={`absolute ${colors.bg} ${colors.border} border-l-[3px] rounded-lg p-1.5 cursor-pointer hover:shadow-md hover:z-20 transition-all overflow-hidden`}
                        style={{ top: `${top}px`, height: `${height}px`, left: colLeft, width: colWidth, zIndex: 10 }}
                        title={`${getMatiereNom(s)} — ${getEnseignantNom(s)}`}>
                        <p className="text-[10px] font-bold text-[#0F2B46] truncate leading-tight">{getMatiereNom(s)}</p>
                        <p className="text-[9px] text-gray-600 truncate leading-tight mt-0.5">{getEnseignantNom(s)}</p>
                        <p className="text-[9px] text-gray-500 truncate leading-tight mt-0.5">{s.heureDebut}-{s.heureFin} · {getSalleNom(s)}</p>
                        {height > 60 && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-semibold ${colors.text} ${colors.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />{s.typeSeance}
                            </span>
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatutDot(s.statut)}`} />
                          </div>
                        )}
                      </div>
                    );
                  });
                })}

                {/* Ligne maintenant */}
                {(() => {
                  const now = new Date();
                  const today = now.toISOString().split('T')[0];
                  if (weekDates.includes(today)) {
                    const mins = now.getHours() * 60 + now.getMinutes();
                    const top = ((mins - 450) / 30) * 40;
                    if (top > 0 && top < CRENEAUX.length * 40) {
                      const jourIdx = weekDates.indexOf(today);
                      const colLeft = `calc(80px + ${jourIdx} * calc((100% - 80px) / 6))`;
                      const colWidth = `calc((100% - 80px) / 6)`;
                      return (
                        <div className="absolute z-30 pointer-events-none" style={{ top: `${top}px`, left: colLeft, width: colWidth }}>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <div className="flex-1 h-[2px] bg-red-500" />
                          </div>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === LÉGENDE === */}
      <div className="flex flex-wrap items-center gap-4 px-2">
        <span className="text-xs text-gray-500 font-medium">Légende :</span>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500" /><span className="text-xs text-gray-600">CM</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-xs text-gray-600">TD</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-500" /><span className="text-xs text-gray-600">TP</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" /><span className="text-xs text-gray-600">Maintenant</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-xs text-gray-600">Effectuée</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-xs text-gray-600">Planifiée</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-600" /><span className="text-xs text-gray-600">Annulée</span></div>
      </div>

      {/* === DIALOG DÉTAIL === */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {(() => {
                  const c = getTypeColor(detail.typeSeance);
                  return <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg}`}><BookOpen size={24} className={c.text} /></div>;
                })()}
                <div>
                  <h3 className="text-lg font-semibold text-[#0F2B46]">{getMatiereNom(detail)}</h3>
                  <p className="text-sm text-gray-500">{detail.typeSeance} · {detail.nombreHeures}h</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <CalendarDays size={20} className="text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-[#0F2B46]">{detail.date}</p>
                  <p className="text-xs text-gray-500">{detail.heureDebut} — {detail.heureFin}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Enseignant', value: getEnseignantNom(detail), icon: Users, color: 'text-blue-600 bg-blue-100' },
                  { label: 'Classe', value: getClasseNom(detail), icon: GraduationCap, color: 'text-emerald-600 bg-emerald-100' },
                  { label: 'Salle', value: getSalleNom(detail), icon: DoorOpen, color: 'text-amber-600 bg-amber-100' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="text-center p-3 rounded-xl bg-gray-50">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${item.color}`}><Icon size={16} /></div>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">{item.label}</p>
                      <p className="text-xs font-medium text-[#0F2B46] truncate mt-0.5">{item.value}</p>
                    </div>
                  );
                })}
              </div>
              {detail.remarques && (
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Remarques</p>
                  <p className="text-sm text-gray-700">{detail.remarques}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setDetail(null)} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}