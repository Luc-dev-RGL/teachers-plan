export default function Input({ label, erreur, requi, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-midnight mb-1">{label}{requi && ' *'}</label>}
      <input
        {...props}
        className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all ${
          erreur ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
        }`}
      />
      {erreur && <p className="text-xs text-red-500 mt-1">{erreur}</p>}
    </div>
  );
}