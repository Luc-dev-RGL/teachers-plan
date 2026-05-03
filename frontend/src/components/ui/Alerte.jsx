import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const types = {
  erreur: { classe: 'bg-red-50 border-red-200 text-red-700', icone: AlertCircle },
  succes: { classe: 'bg-green-50 border-green-200 text-green-700', icone: CheckCircle },
  info: { classe: 'bg-blue-50 border-blue-200 text-blue-700', icone: Info },
};

export default function Alerte({ type = 'info', message, fermer }) {
  const config = types[type] || types.info;
  const Icon = config.icone;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${config.classe}`}>
      <Icon size={18} />
      <p className="flex-1 text-sm">{message}</p>
      {fermer && (
        <button onClick={fermer} className="p-1 hover:opacity-70">
          <X size={16} />
        </button>
      )}
    </div>
  );
}