import Chargement from './Chargement.jsx';

export default function Tableau({ colonnes, donnees, chargement, vide = 'Aucune donnée' }) {
  if (chargement) return <Chargement />;

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {colonnes.map((col, i) => (
                <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">{col.titre}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {donnees.length > 0 ? donnees.map((ligne, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                {colonnes.map((col, j) => (
                  <td key={j} className="px-5 py-3 text-sm">{col.render ? col.render(ligne) : ligne[col.cle]}</td>
                ))}
              </tr>
            )) : (
              <tr><td colSpan={colonnes.length} className="text-center py-12 text-slate-400 text-sm">{vide}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}