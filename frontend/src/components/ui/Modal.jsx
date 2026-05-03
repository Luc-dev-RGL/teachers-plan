import { X } from 'lucide-react';

export default function Modal({ ouvert, fermer, titre, enfants, taille = 'max-w-lg' }) {
  if (!ouvert) return null;

  return (
    <div className="modal-overlay" onClick={fermer}>
      <div className={`modal-content ${taille}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-midnight font-display">{titre}</h3>
          <button onClick={fermer} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="p-5">{enfants}</div>
      </div>
    </div>
  );
}