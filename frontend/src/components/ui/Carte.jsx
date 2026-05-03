export default function Carte({ titre, valeur, icone: Icon, couleur, enfants }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${couleur} flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="font-display font-bold text-2xl text-midnight">{valeur}</p>
      <p className="text-xs text-slate-500 mt-1">{titre}</p>
      {enfants}
    </div>
  );
}