import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { utiliserSidebar } from '../../context/SidebarContext.jsx';

export default function Layout() {
  const { ouvert } = utiliserSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A]">
      <Sidebar />
      <div
        className="sidebar-transition min-h-screen flex flex-col bg-white dark:bg-[#0F172A]"
        style={{
          marginLeft: ouvert ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed)',
        }}
      >
        <style>{`
          @media (max-width: 1023px) {
            div[style*="margin-left"] { margin-left: 0 !important; }
          }
        `}</style>
        <Header />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
        <footer className="border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B1222] px-6 py-3">
          <p className="text-xs text-gray-400 text-center">
            Teacher's Plan v2.0 — Université Nangui Abrogoua — © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}