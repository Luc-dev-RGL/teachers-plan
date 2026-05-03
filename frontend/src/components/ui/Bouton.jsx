import { Loader2 } from 'lucide-react';

const variantes = {
  primaire: 'btn-primary',
  secondaire: 'btn-secondary',
  danger: 'btn-danger',
};

const tailles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Bouton({
  children,
  variante = 'primaire',
  taille = 'md',
  chargement: enChargement,
  desactive = false,
  onClick,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      disabled={desactive || enChargement}
      onClick={onClick}
      className={`${variantes[variante]} ${tailles[taille]} inline-flex items-center gap-2 ${className}`}
    >
      {enChargement && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}