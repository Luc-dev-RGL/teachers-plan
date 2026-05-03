import React, { useState, useRef } from 'react';
import {
  FileText, Download, FileSpreadsheet, Printer, Calendar,
  Filter, Clock, Users, School, BookOpen, CheckCircle, X,
  ChevronDown, Search, BarChart3, TrendingUp, Eye
} from 'lucide-react';

const getToken = () => localStorage.getItem('token');
const fetchApi = (url, opts = {}) => fetch(url, {
  headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
  ...opts,
});

const TYPES_EXPORT = [
  { id: 'heures_enseignant', label: "Heures par Enseignant", icon: Users, desc: "Récapitulatif des heures enseignées par enseignant", color: 'from-violet-500 to-purple-600' },
  { id: 'heures_classe', label: "Heures par Classe", icon: School, desc: "Volume horaire total par classe/niveau", color: 'from-emerald-500 to-teal-600' },
  { id: 'emploi_du_temps', label: "Emploi du Temps", icon: Calendar, desc: "Export de la grille hebdomadaire", color: 'from-amber-500 to-orange-600' },
  { id: 'presence', label: "Rapport de Présences", icon: CheckCircle, desc: "Statistiques de présence par séance", color: 'from-sky-500 to-blue-600' },
  { id: 'seances_detail', label: "Détail des Séances", icon: Clock, desc: "Liste complète de toutes les séances", color: 'from-rose-500 to-pink-600' },
  { id: 'bilan_global', label: "Bilan Global", icon: BarChart3, desc: "Synthèse générale de l'année", color: 'from-indigo-500 to-violet-600' },
];

const FORMATS = [
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
  { id: 'print', label: 'Imprimer', icon: Printer },
];

export default function Export() {
  const [selectedType, setSelectedType] = useState('heures_enseignant');
  const [format, setFormat] = useState('pdf');
  const [anneeId, setAnneeId] = useState('');
  const [semestre, setSemestre] = useState('');
  const [enseignantId, setEnseignantId] = useState('');
  const [classeId, setClasseId] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [annees, setAnnees] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [classes, setClasses] = useState([]);

  React.useEffect(() => {
    Promise.all([
      fetchApi('/api/annees-academiques').then(r => r.ok ? r.json().catch(() => ({})) : ({})).then(d => { const arr = d?.donnees || d?.data || []; if (Array.isArray(arr)) setAnnees(arr); }),
      fetchApi('/api/enseignants').then(r => r.ok ? r.json().catch(() => ({})) : ({})).then(d => { const arr = d?.donnees || d?.data || []; if (Array.isArray(arr)) setEnseignants(arr); }),
      fetchApi('/api/classes').then(r => r.ok ? r.json().catch(() => ({})) : ({})).then(d => { const arr = d?.donnees || d?.data || []; if (Array.isArray(arr)) setClasses(arr); }),
    ]);
  }, []);

  const activeType = TYPES_EXPORT.find(t => t.id === selectedType);
  const activeFormat = FORMATS.find(f => f.id === format);
  const ActiveIcon = activeType?.icon || FileText;
  const FormatIcon = activeFormat?.icon || FileText;

  const handleExport = async () => {
    setLoading(true);
    setPreview(null);

    try {
      const params = new URLSearchParams();
      params.set('type', selectedType);
      params.set('format', format);
      if (anneeId) params.set('annee_id', anneeId);
      if (semestre) params.set('semestre', semestre);
      if (enseignantId) params.set('enseignant_id', enseignantId);
      if (classeId) params.set('classe_id', classeId);
      if (dateDebut) params.set('date_debut', dateDebut);
      if (dateFin) params.set('date_fin', dateFin);

      const res = await fetchApi(`/api/exports?${params.toString()}`);

      if (!res.ok) {
        setPreview({ error: true, message: `Erreur serveur (${res.status}). Vérifiez les filtres.` });
        setLoading(false);
        return;
      }

      if (format === 'print') {
        const data = await res.json().catch(() => ({}));
        const printContent = data?.donnees || data?.data || data;
        if (printContent) {
          setPreview({ data: printContent, raw: data });
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(generatePrintHTML(printContent, activeType));
            printWindow.document.close();
            printWindow.print();
          }
        } else {
          setPreview({ error: true, message: "Aucune donnée trouvée pour ces critères." });
        }
      } else {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json().catch(() => ({}));
          const result = data?.donnees || data?.data || data;
          if (Array.isArray(result) && result.length > 0) {
            setPreview({ data: result, raw: data });
          } else if (result && typeof result === 'object') {
            setPreview({ data: result, raw: data });
          } else {
            setPreview({ error: true, message: "Aucune donnée trouvée pour ces critères." });
          }
        } else {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${activeType?.label?.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setPreview({ success: true, message: "Fichier téléchargé avec succès !" });
        }
      }
    } catch (err) {
      setPreview({ error: true, message: "Erreur de connexion au serveur." });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    setPreview(null);

    try {
      const params = new URLSearchParams();
      params.set('type', selectedType);
      if (anneeId) params.set('annee_id', anneeId);
      if (semestre) params.set('semestre', semestre);
      if (enseignantId) params.set('enseignant_id', enseignantId);
      if (classeId) params.set('classe_id', classeId);
      if (dateDebut) params.set('date_debut', dateDebut);
      if (dateFin) params.set('date_fin', dateFin);

      const res = await fetchApi(`/api/exports/preview?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      const result = data?.donnees || data?.data || data;

      if (result && (Array.isArray(result) ? result.length > 0 : Object.keys(result).length > 0)) {
        setPreview({ data: result, raw: data });
      } else {
        setPreview({ error: true, message: "Aucune donnée à afficher pour ces critères." });
      }
    } catch (err) {
      setPreview({ error: true, message: "Erreur lors de la prévisualisation." });
    } finally {
      setLoading(false);
    }
  };

  const getSummaryData = () => {
    const summary = [
      { label: "Enseignants", value: enseignants.length, icon: Users, color: 'from-violet-500 to-purple-600' },
      { label: "Classes", value: classes.length, icon: School, color: 'from-emerald-500 to-teal-600' },
      { label: "Années Acad.", value: annees.length, icon: BookOpen, color: 'from-amber-500 to-orange-600' },
      { label: "Types Export", value: TYPES_EXPORT.length, icon: FileText, color: 'from-sky-500 to-blue-600' },
    ];
    return summary;
  };

  const renderPreviewTable = () => {
    if (!preview || !preview.data) return null;

    if (preview.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <X className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium">{preview.message}</p>
        </div>
      );
    }

    if (preview.success) {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-emerald-600 font-medium">{preview.message}</p>
        </div>
      );
    }

    const data = preview.data;

    if (Array.isArray(data) && data.length > 0) {
      const columns = Object.keys(data[0]).filter(k => k !== 'id' && k !== 'created_at' && k !== 'updated_at');

      return (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                {columns.map(col => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.slice(0, 10).map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  {columns.map(col => (
                    <td key={col} className="px-4 py-3 text-gray-700">
                      {typeof row[col] === 'boolean' ? (row[col] ? '✓' : '✗') :
                       typeof row[col] === 'number' ? row[col].toLocaleString('fr-FR') :
                       String(row[col] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 10 && (
            <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
              ... et {data.length - 10} autres lignes. Exportez pour voir tout.
            </div>
          )}
        </div>
      );
    }

    if (typeof data === 'object' && !Array.isArray(data)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">{key.replace(/_/g, ' ')}</p>
              <p className="text-lg font-bold text-gray-800">
                {typeof value === 'number' ? value.toLocaleString('fr-FR') : String(value ?? '-')}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            Export & Rapports
          </h1>
          <p className="text-gray-500 mt-1">Générez et téléchargez vos rapports en PDF ou Excel</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {getSummaryData().map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-white/30" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Type Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-violet-500" />
          Type de Rapport
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TYPES_EXPORT.map(type => {
            const Icon = type.icon;
            const isActive = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => { setSelectedType(type.id); setPreview(null); }}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  isActive
                    ? 'border-violet-500 bg-violet-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${isActive ? 'text-violet-700' : 'text-gray-800'}`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{type.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters & Format */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-violet-500" />
              Critères de Filtrage
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              {showFilters ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Année Académique */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année Académique</label>
              <select
                value={anneeId}
                onChange={e => setAnneeId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">Toutes les années</option>
                {Array.isArray(annees) && annees.map(a => (
                  <option key={a.id} value={a.id}>{a.libelle || a.nom || `${a.debut} - ${a.fin}`}</option>
                ))}
              </select>
            </div>

            {/* Semestre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
              <select
                value={semestre}
                onChange={e => setSemestre(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">Tous</option>
                <option value="1">Semestre 1</option>
                <option value="2">Semestre 2</option>
              </select>
            </div>

            {/* Enseignant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enseignant</label>
              <select
                value={enseignantId}
                onChange={e => setEnseignantId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">Tous les enseignants</option>
                {Array.isArray(enseignants) && enseignants.map(e => (
                  <option key={e.id} value={e.id}>{e.nom} {e.prenoms}</option>
                ))}
              </select>
            </div>

            {/* Classe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
              <select
                value={classeId}
                onChange={e => setClasseId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                <option value="">Toutes les classes</option>
                {Array.isArray(classes) && classes.map(c => (
                  <option key={c.id} value={c.id}>{c.libelle || c.nom}</option>
                ))}
              </select>
            </div>

            {/* Extra Filters (toggle) */}
            {showFilters && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={e => setDateDebut(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input
                    type="date"
                    value={dateFin}
                    onChange={e => setDateFin(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={handlePreview}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {loading ? 'Chargement...' : 'Aperçu'}
            </button>
            <button
              onClick={() => {
                setAnneeId('');
                setSemestre('');
                setEnseignantId('');
                setClasseId('');
                setDateDebut('');
                setDateFin('');
                setPreview(null);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Format Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-violet-500" />
            Format de Sortie
          </h2>

          <div className="space-y-3">
            {FORMATS.map(f => {
              const Icon = f.icon;
              const isActive = format === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                    isActive
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-violet-600' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <p className={`font-semibold ${isActive ? 'text-violet-700' : 'text-gray-700'}`}>{f.label}</p>
                    <p className="text-xs text-gray-500">
                      {f.id === 'pdf' ? 'Document PDF formaté' :
                       f.id === 'excel' ? 'Fichier Excel .xlsx' :
                       'Ouverture dans le navigateur'}
                    </p>
                  </div>
                  {isActive && <CheckCircle className="w-5 h-5 text-violet-500 ml-auto" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Download className="w-5 h-5" />
                Exporter
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {preview && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-violet-500" />
            Aperçu — {activeType?.label}
          </h2>
          {renderPreviewTable()}
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-6">
        <h3 className="font-semibold text-violet-800 flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5" />
          Conseils d'export
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-violet-700">
          <div className="flex gap-2">
            <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p><strong>PDF</strong> — Idéal pour les rapports officiels et les impressions papier.</p>
          </div>
          <div className="flex gap-2">
            <FileSpreadsheet className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p><strong>Excel</strong> — Parfait pour l'analyse des données et les calculs personnalisés.</p>
          </div>
          <div className="flex gap-2">
            <Printer className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p><strong>Imprimer</strong> — Ouverture directe de la boîte de dialogue d'impression.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function generatePrintHTML(data, type) {
  const title = type?.label || "Rapport";
  const date = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let bodyContent = '';

  if (Array.isArray(data)) {
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    bodyContent = `
      <table style="width:100%;border-collapse:collapse;margin-top:20px;">
        <thead>
          <tr style="background:#7C3AED;color:white;">
            <th style="padding:10px;text-align:left;">#</th>
            ${columns.map(c => `<th style="padding:10px;text-align:left;">${c.replace(/_/g, ' ')}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map((row, i) => `
            <tr style="${i % 2 === 0 ? 'background:#f9f9f9;' : ''}">
              <td style="padding:8px;">${i + 1}</td>
              ${columns.map(c => `<td style="padding:8px;">${row[c] ?? '-'}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="margin-top:12px;color:#666;font-size:12px;">Total : ${data.length} entrée(s)</p>
    `;
  } else if (typeof data === 'object') {
    bodyContent = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px;">
        ${Object.entries(data).map(([k, v]) => `
          <div style="background:#f9f9f9;padding:12px;border-radius:8px;">
            <div style="font-size:11px;color:#888;text-transform:uppercase;font-weight:bold;">${k.replace(/_/g, ' ')}</div>
            <div style="font-size:18px;font-weight:bold;margin-top:4px;">${v}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; }
        h1 { color: #7C3AED; font-size: 24px; margin-bottom: 4px; }
        .subtitle { color: #666; font-size: 13px; margin-bottom: 24px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>📋 ${title}</h1>
      <p class="subtitle">Généré le ${date} — Teacher's Plan (UNA)</p>
      ${bodyContent}
    </body>
    </html>
  `;
}