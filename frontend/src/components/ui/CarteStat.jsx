export default function CarteStat({ titre, valeur, icone: Icon, couleur = 'navy' }) {
  const couleurs = {
    navy: 'bg-navy/10 text-navy',
    sky: 'bg-sky/10 text-sky',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500">{titre}</p>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${couleurs[couleur]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-midnight font-display">{valeur}</p>
    </div>
  );
}