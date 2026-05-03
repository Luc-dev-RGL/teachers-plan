import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'Aucune donnée trouvée', icone: Icon = Inbox }) {
  return (
    <div className="empty-state">
      <Icon size={48} className="mb-3 text-slate-300" />
      <p className="text-sm">{message}</p>
    </div>
  );
}