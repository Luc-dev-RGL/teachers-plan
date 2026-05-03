export default function Toggle({ actif, changer }) {
  return (
    <button
      type="button"
      onClick={() => changer(!actif)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${actif ? 'bg-navy' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${actif ? 'translate-x-5' : ''}`} />
    </button>
  );
}