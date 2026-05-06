import { utiliserSidebar } from '../../context/SidebarContext.jsx';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import { Menu, Bell, LogOut, UserCircle, Moon, Sun, Search, X, Info, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const getToken = () => localStorage.getItem('tp_token') || localStorage.getItem('token');

const typeIcons = {
  info: { icon: Info, color: 'text-blue-500' },
  warning: { icon: AlertTriangle, color: 'text-amber-500' },
  success: { icon: CheckCircle2, color: 'text-emerald-500' },
  danger: { icon: AlertCircle, color: 'text-red-500' },
};

const typeLabels = {
  enseignant: { label: 'Ens.', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  matiere: { label: 'Mat.', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  classe: { label: 'Cls.', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  salle: { label: 'Sal.', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  departement: { label: 'Dép.', cls: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  filiere: { label: 'Fili.', cls: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  seance: { label: 'Séc.', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
};

export default function Header() {
  const { mobileOuvert, ouvrirMobile } = utiliserSidebar();
  const { utilisateur, deconnexion } = utiliserAuth();
  const navigate = useNavigate();

  const [menu, setMenu] = useState(false);
  const [sombre, setSombre] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('theme') === 'dark';
    return false;
  });

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [nonLues, setNonLues] = useState(0);
  const notifRef = useRef(null);

  const menuRef = useRef(null);

  const roleLabel = utilisateur?.role === 'admin'
    ? 'Administrateur'
    : utilisateur?.role === 'rh'
      ? 'Ressources Humaines'
      : 'Enseignant';

  // ─── Dark mode ───
  useEffect(() => {
    document.documentElement.classList.toggle('dark', sombre);
  }, [sombre]);

  const toggleDark = () => {
    const next = !sombre;
    setSombre(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  // ─── Click outside (menu, search, notif) ───
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ─── Focus search on open ───
  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  // ─── Ctrl+K shortcut ───
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ─── Fetch notifications ───
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const token = getToken();
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = res.data;
      if (d.success || d.succes) {
        const list = d.data || d.donnees || [];
        setNotifications(list);
        setNonLues(list.filter(n => !n.lu).length);
      }
    } catch (err) {
      console.error('Erreur notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ─── Search with debounce ───
  const handleSearch = (value) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value || value.length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/search?q=${encodeURIComponent(value)}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const d = res.data;
        if (d.success || d.succes) {
          setSearchResults(d.data || d.donnees || []);
        } else {
          setSearchResults([]);
        }
      } catch { setSearchResults([]); } finally { setSearchLoading(false); }
    }, 300);
  };

  const handleSearchSelect = (page) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/${page}`);
  };

  const handleNotifClick = (page) => {
    setNotifOpen(false);
    if (page) navigate(`/${page}`);
  };

  const handleLogout = () => {
    setMenu(false);
    deconnexion();
    toast.success('Déconnexion réussie');
  };

  return (
    <header
      className="sticky top-0 z-30 bg-gray-50 dark:bg-[#0F172A] border-b border-gray-200 dark:border-white/10"
      style={{ height: 'var(--header-height)' }}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={ouvrirMobile}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Bienvenue, <span className="text-purple-600 dark:text-purple-400 font-semibold">{utilisateur?.prenom}</span>
            </p>
            <p className="text-xs text-gray-400">{roleLabel}</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Search trigger (mobile) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2.5 rounded-xl text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <Search size={20} />
          </button>

          {/* Search bar (desktop) */}
          <div className="relative hidden md:block" ref={searchRef}>
            <div
              className="flex items-center bg-white dark:bg-white/5 rounded-xl px-3 py-2 w-64 border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={16} className="text-gray-400 mr-2 shrink-0" />
              <span className="text-sm text-gray-400 flex-1">Rechercher...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] text-gray-400 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10 font-mono">
                Ctrl+K
              </kbd>
            </div>

            {/* Search dropdown */}
            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 w-[420px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-white/10 shadow-xl z-50 overflow-hidden">
                <div className="flex items-center gap-2 px-4 border-b border-gray-200 dark:border-white/10">
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Rechercher un enseignant, matière, salle..."
                    className="flex-1 py-3 text-sm text-gray-700 dark:text-slate-200 placeholder:text-gray-400 outline-none bg-transparent"
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {searchLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-200 border-t-purple-600" />
                    </div>
                  )}
                  {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">Aucun résultat pour « {searchQuery} »</div>
                  )}
                  {!searchLoading && searchResults.map((r, i) => {
                    const t = typeLabels[r.type] || { label: r.type, cls: 'bg-gray-100 text-gray-700' };
                    return (
                      <button
                        key={`${r.type}-${r.label}-${i}`}
                        onClick={() => handleSearchSelect(r.page)}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase mt-0.5 shrink-0 ${t.cls}`}>{t.label}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.label}</p>
                          <p className="text-xs text-gray-400 truncate">{r.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                  {!searchLoading && searchQuery.length < 2 && (
                    <div className="text-center py-8 text-gray-400 text-sm">Tapez au moins 2 caractères...</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile search dropdown */}
          {searchOpen && (
            <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4" onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}>
              <div className="w-full bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 px-4 border-b border-gray-200 dark:border-white/10">
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="flex-1 py-3 text-sm text-gray-700 dark:text-slate-200 placeholder:text-gray-400 outline-none bg-transparent"
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-gray-400"><X size={14} /></button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {searchLoading && (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-200 border-t-purple-600" />
                    </div>
                  )}
                  {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-sm">Aucun résultat</div>
                  )}
                  {!searchLoading && searchResults.map((r, i) => {
                    const t = typeLabels[r.type] || { label: r.type, cls: 'bg-gray-100 text-gray-700' };
                    return (
                      <button key={`${r.type}-${r.label}-${i}`} onClick={() => handleSearchSelect(r.page)} className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-left">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase mt-0.5 shrink-0 ${t.cls}`}>{t.label}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.label}</p>
                          <p className="text-xs text-gray-400 truncate">{r.sub}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Dark mode toggle */}
          <button onClick={toggleDark} className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
            {sombre ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2.5 rounded-xl text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
              <Bell size={20} />
              {nonLues > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-purple-600 to-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                  {nonLues > 9 ? '9+' : nonLues}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1E293B] rounded-xl border border-gray-200 dark:border-white/10 shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  <button onClick={fetchNotifications} className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium transition-colors">Actualiser</button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-200 border-t-purple-600" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <Bell size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const t = typeIcons[n.type] || typeIcons.info;
                      const Icon = t.icon;
                      return (
                        <button
                          key={n.id}
                          onClick={() => handleNotifClick(n.page)}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left border-b border-gray-100 dark:border-white/5 last:border-b-0"
                        >
                          <div className="mt-0.5 shrink-0">
                            <Icon size={16} className={t.color} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{n.titre}</p>
                            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.description}</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                    <button onClick={() => { setNotifOpen(false); navigate('/dashboard'); }} className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium transition-colors">
                      Voir le tableau de bord →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenu(!menu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-slate-200">
                {utilisateur?.prenom} {utilisateur?.nom}
              </span>
            </button>

            {menu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1E293B] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-white/10">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{utilisateur?.prenom} {utilisateur?.nom}</p>
                  <p className="text-xs text-gray-400">{utilisateur?.email}</p>
                </div>
                <button
                  onClick={() => { navigate('/profil'); setMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 text-left"
                >
                  <UserCircle size={16} /> Mon profil
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 w-full text-left"
                >
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}