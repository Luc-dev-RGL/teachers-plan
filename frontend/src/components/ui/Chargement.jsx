export default function Chargement({ message = 'Chargement...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-navy border-t-transparent mb-4" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}