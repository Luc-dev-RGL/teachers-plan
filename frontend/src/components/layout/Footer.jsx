export default function Footer() {
  return (
    <footer className="h-10 border-t border-slate-200 bg-white flex items-center justify-center text-xs text-slate-400 shrink-0">
      Teacher's Plan &copy; {new Date().getFullYear()} — Planifiez. Suivez. Payez.
    </footer>
  );
}