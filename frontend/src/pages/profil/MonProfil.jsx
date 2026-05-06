import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  User, Mail, Phone, Camera, Key, Shield, Clock,
  Save, X, Eye, EyeOff, CheckCircle, AlertTriangle,
  BookOpen, GraduationCap, Bell, LogOut,
  Trash2, Lock, Settings, Users, Calendar, Award
} from 'lucide-react';

const getToken = () => localStorage.getItem('token');

// Récupérer le rôle stocké à la connexion
const getStoredRole = () => {
  try {
    const stored = localStorage.getItem('tp_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.role) return parsed.role.toLowerCase();
    }
  } catch (e) {}
  return 'admin'; // fallback par défaut
};

const fetchApi = (url, opts = {}) => fetch(url, {
  headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
  ...opts,
});

export default function Profil() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('infos');
  const [role, setRole] = useState(getStoredRole);

  // Champs communs
  const [nom, setNom] = useState('');
  const [prenoms, setPrenoms] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');

  // Enseignant
  const [grade, setGrade] = useState('');
  const [specialite, setSpecialite] = useState('');

  // Admin/RH
  const [poste, setPoste] = useState('');
  const [departement, setDepartement] = useState('');

  // Photo
  const [photoUrl, setPhotoUrl] = useState('');

  // Mot de passe
  const [oldMdp, setOldMdp] = useState('');
  const [newMdp, setNewMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Préférences
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSeance, setNotifSeance] = useState(true);

  // Feedback
  const [message, setMessage] = useState(null);
  const [activites, setActivites] = useState([]);

  useEffect(() => {
    loadUser();
    loadActivites();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/api/auth/profil');
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const u = data?.donnees || data?.data || data;
        if (u && typeof u === 'object') {
          setUser(u);
          // Détection fiable du rôle
          const detected = u.role?.toLowerCase() || '';
          if (detected) setRole(detected);
          // Stocker le rôle pour les rechargements
          localStorage.setItem('tp_user', JSON.stringify({ role: u.role }));

          setNom(u.nom || '');
          setPrenoms(u.prenoms || '');
          setEmail(u.email || '');
          setTelephone(u.telephone || '');
          setGrade(u.grade || '');
          setSpecialite(u.specialite || '');
          setPoste(u.poste || '');
          setDepartement(u.departement || '');
          setPhotoUrl(u.photo || u.avatar || '');
          if (u.notif_email !== undefined) setNotifEmail(!!u.notif_email);
          if (u.notif_seance !== undefined) setNotifSeance(!!u.notif_seance);
        }
      }
      // Si API plantée, role reste sur getStoredRole() — correct
    } catch (e) {
      // role reste sur la valeur localStorage — correct
    } finally {
      setLoading(false);
    }
  };

  const loadActivites = async () => {
    try {
      const res = await fetchApi('/api/journal-actions?limit=10');
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const arr = data?.donnees || data?.data || [];
        if (Array.isArray(arr)) setActivites(arr);
      }
    } catch (e) {}
  };

  const showMsg = (type, texte) => {
    setMessage({ type, texte });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSaveProfil = async () => {
    if (!nom.trim()) { showMsg('error', "Le nom est obligatoire."); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showMsg('error', "Format d'email invalide."); return; }

    setSaving(true);
    try {
      let payload = { nom, prenoms, email, telephone };
      if (isEnseignant) {
        payload = { ...payload, grade, specialite };
      } else {
        payload = { ...payload, poste, departement };
      }
      const res = await fetchApi('/api/auth/profil', { method: 'PUT', body: JSON.stringify(payload) });
      if (res.ok) {
        showMsg('success', "Profil mis à jour avec succès !");
      } else {
        showMsg('error', "Erreur lors de la mise à jour.");
      }
    } catch (e) {
      showMsg('error', "Erreur de connexion.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showMsg('error', "Max 5 Mo."); return; }
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const res = await fetch('/api/auth/photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const url = data?.donnees?.photo || data?.donnees?.url || data?.url || '';
        setPhotoUrl(url);
        showMsg('success', "Photo mise à jour !");
      } else {
        showMsg('error', "Erreur lors du téléchargement.");
      }
    } catch (e) {
      showMsg('error', "Erreur de connexion.");
    }
  };

  const handleMdpChange = async () => {
    if (!oldMdp || !newMdp || !confirmMdp) { showMsg('error', "Tous les champs sont obligatoires."); return; }
    if (newMdp.length < 8) { showMsg('error', "Minimum 8 caractères."); return; }
    if (newMdp !== confirmMdp) { showMsg('error', "Les mots de passe ne correspondent pas."); return; }
    if (newMdp === oldMdp) { showMsg('error', "Le nouveau doit être différent."); return; }

    setSaving(true);
    try {
      const res = await fetchApi(`/api/auth/change-password`, { method: 'POST', body: JSON.stringify({ ancien_password: oldMdp, nouveau_password: newMdp }) });
      if (res.ok) {
        showMsg('success', "Mot de passe modifié !");
        setOldMdp(''); setNewMdp(''); setConfirmMdp('');
      } else {
        const data = await res.json().catch(() => ({}));
        showMsg('error', data?.message || data?.erreur || "Erreur.");
      }
    } catch (e) {
      showMsg('error', "Erreur de connexion.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrefs = async () => {
    setSaving(true);
    try {
      const res = await fetchApi('/api/utilisateurs/preferences', { method: 'PUT', body: JSON.stringify({ notifEmail, notifSeance }) });
      if (res.ok) {
        showMsg('success', "Préférences enregistrées !");
      } else {
        showMsg('error', "Erreur.");
      }
    } catch (e) {
      showMsg('error', "Erreur de connexion.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token');
    localStorage.removeItem('tp_user');
    window.location.href = '/connexion';
  };

  const mdpForce = (val) => {
    let s = 0;
    if (val.length >= 8) s++;
    if (val.length >= 12) s++;
    if (/[A-Z]/.test(val)) s++;
    if (/[a-z]/.test(val)) s++;
    if (/[0-9]/.test(val)) s++;
    if (/[^A-Za-z0-9]/.test(val)) s++;
    return s;
  };

  const forceMdp = mdpForce(newMdp);
  const forceLabel = forceMdp <= 2 ? 'Faible' : forceMdp <= 4 ? 'Moyen' : 'Fort';
  const forceColor = forceMdp <= 2 ? 'bg-red-500' : forceMdp <= 4 ? 'bg-amber-500' : 'bg-emerald-500';

  const getInitials = () => {
    if (photoUrl) return null;
    return (nom?.charAt(0)?.toUpperCase() || '') + (prenoms?.charAt(0)?.toUpperCase() || '');
  };

  const isEnseignant = role === 'enseignant';

  const badgeMap = {
    admin: { label: 'Administrateur', color: 'bg-red-100 text-red-700' },
    administrateur: { label: 'Administrateur', color: 'bg-red-100 text-red-700' },
    rh: { label: 'Ressources Humaines', color: 'bg-amber-100 text-amber-700' },
    enseignant: { label: 'Enseignant', color: 'bg-violet-100 text-violet-700' },
  };
  const badge = badgeMap[role] || badgeMap.admin;

  const stats = isEnseignant ? [
    { label: "Heures ce mois", value: user?.heures_mois || 0, unit: 'h', icon: Clock, color: 'from-violet-500 to-purple-600' },
    { label: "Séances faites", value: user?.seances_faites || 0, unit: '', icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
    { label: "Classes", value: user?.nb_classes || 0, unit: '', icon: GraduationCap, color: 'from-amber-500 to-orange-600' },
    { label: "Présence", value: user?.taux_presence || 0, unit: '%', icon: Calendar, color: 'from-sky-500 to-blue-600' },
  ] : [
    { label: "Enseignants", value: user?.nb_enseignants || 0, unit: '', icon: Users, color: 'from-violet-500 to-purple-600' },
    { label: "Classes actives", value: user?.nb_classes || 0, unit: '', icon: GraduationCap, color: 'from-emerald-500 to-teal-600' },
    { label: "Séances/mois", value: user?.seances_mois || 0, unit: '', icon: Calendar, color: 'from-amber-500 to-orange-600' },
    { label: "Années acad.", value: user?.nb_annees || 0, unit: '', icon: Award, color: 'from-sky-500 to-blue-600' },
  ];

  const TABS = [
    { id: 'infos', label: 'Informations', icon: User },
    { id: 'mdp', label: 'Mot de passe', icon: Key },
    { id: 'prefs', label: 'Préférences', icon: Bell },
    { id: 'activite', label: 'Activité', icon: Clock },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${isEnseignant ? 'from-violet-500 to-purple-600' : 'from-red-500 to-rose-600'} rounded-xl flex items-center justify-center`}>
            <User className="w-5 h-5 text-white" />
          </div>
          Mon Profil
        </h1>
        <p className="text-gray-500 mt-1">Gérez vos informations et préférences</p>
      </div>

      {/* Carte Profil + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte Profil */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`h-28 relative ${isEnseignant ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="relative group">
                {photoUrl ? (
                  <img src={photoUrl} alt="Photo" className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg" />
                ) : (
                  <div className={`w-24 h-24 rounded-full border-4 border-white ${isEnseignant ? 'bg-gradient-to-br from-violet-400 to-purple-500' : 'bg-gradient-to-br from-red-400 to-rose-500'} flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl font-bold text-white">{getInitials() || '?'}</span>
                  </div>
                )}
                <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-6 px-6 text-center">
            <h2 className="text-xl font-bold text-gray-900">{prenoms} {nom}</h2>
            <p className="text-sm text-gray-500 mt-1">{email || 'Non renseigné'}</p>

            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.color}`}>{badge.label}</span>
              {isEnseignant && grade && (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">{grade}</span>
              )}
              {isEnseignant && specialite && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">{specialite}</span>
              )}
              {!isEnseignant && poste && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">{poste}</span>
              )}
            </div>

            {telephone && (
              <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500">
                <Phone className="w-4 h-4" /> {telephone}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="mt-5 flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
            >
              <LogOut className="w-4 h-4" /> Se déconnecter
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg`}>
                <Icon className="w-6 h-6 text-white/40 mb-2" />
                <p className="text-white/80 text-xs">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}{stat.unit}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
          <p className="text-sm font-medium">{message.texte}</p>
          <button onClick={() => setMessage(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Onglets */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id ? 'border-violet-500 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}>
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* ===== INFORMATIONS ===== */}
          {activeTab === 'infos' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Informations du compte</h3>

              {/* Champs communs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-1" /> Nom *
                  </label>
                  <input type="text" value={nom} onChange={e => setNom(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    placeholder="Votre nom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-1" /> Prénoms
                  </label>
                  <input type="text" value={prenoms} onChange={e => setPrenoms(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    placeholder="Vos prénoms" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" /> Email
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    placeholder="votre@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" /> Téléphone
                  </label>
                  <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    placeholder="+225 07 XX XX XX" />
                </div>
              </div>

              {/* Enseignant : grade + spécialité */}
              {isEnseignant && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <GraduationCap className="w-4 h-4 inline mr-1" /> Grade
                    </label>
                    <p className="text-xs text-gray-400 mb-2">Utilisé pour le calcul des taux horaires (Permanent / Vacataire)</p>
                    <select value={grade} onChange={e => setGrade(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500">
                      <option value="">Sélectionner...</option>
                      <option value="Professeur">Professeur Titulaire</option>
                      <option value="Maître de Conférences">Maître de Conférences</option>
                      <option value="Maître Assistant">Maître Assistant</option>
                      <option value="Docteur">Docteur</option>
                      <option value="Attaché">Attaché de Recherche</option>
                      <option value="Assistant">Assistant</option>
                      <option value="Vacataire">Vacataire</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <BookOpen className="w-4 h-4 inline mr-1" /> Spécialité / UFR
                    </label>
                    <p className="text-xs text-gray-400 mb-2">Permet d'affecter les enseignements par domaine</p>
                    <input type="text" value={specialite} onChange={e => setSpecialite(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      placeholder="Ex: Informatique, Mathématiques..." />
                  </div>
                </div>
              )}

              {/* Admin/RH : poste + département */}
              {!isEnseignant && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Settings className="w-4 h-4 inline mr-1" /> Poste
                    </label>
                    <input type="text" value={poste} onChange={e => setPoste(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      placeholder="Ex: Chef de département" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Award className="w-4 h-4 inline mr-1" /> Département / Service
                    </label>
                    <input type="text" value={departement} onChange={e => setDepartement(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      placeholder="Ex: Département Informatique" />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => loadUser()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4" /> Annuler
                </button>
                <button onClick={handleSaveProfil} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-md">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {/* ===== MOT DE PASSE ===== */}
          {activeTab === 'mdp' && (
            <div className="max-w-md space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-violet-500" /> Changer le mot de passe
                </h3>
                <p className="text-sm text-gray-500 mt-1">Minimum 8 caractères avec majuscule, chiffre et caractère spécial.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ancien mot de passe</label>
                  <div className="relative">
                    <input type={showOld ? 'text' : 'password'} value={oldMdp} onChange={e => setOldMdp(e.target.value)}
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                  <div className="relative">
                    <input type={showNew ? 'text' : 'password'} value={newMdp} onChange={e => setNewMdp(e.target.value)}
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newMdp && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= forceMdp ? forceColor : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className={`text-xs mt-1 ${forceMdp <= 2 ? 'text-red-500' : forceMdp <= 4 ? 'text-amber-500' : 'text-emerald-500'}`}>Force : {forceLabel}</p>
                      <div className="mt-2 space-y-1">
                        <p className={`text-xs flex items-center gap-1 ${newMdp.length >= 8 ? 'text-emerald-500' : 'text-gray-400'}`}><CheckCircle className="w-3 h-3" /> 8 caractères minimum</p>
                        <p className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(newMdp) ? 'text-emerald-500' : 'text-gray-400'}`}><CheckCircle className="w-3 h-3" /> Une majuscule</p>
                        <p className={`text-xs flex items-center gap-1 ${/[0-9]/.test(newMdp) ? 'text-emerald-500' : 'text-gray-400'}`}><CheckCircle className="w-3 h-3" /> Un chiffre</p>
                        <p className={`text-xs flex items-center gap-1 ${/[^A-Za-z0-9]/.test(newMdp) ? 'text-emerald-500' : 'text-gray-400'}`}><CheckCircle className="w-3 h-3" /> Un caractère spécial</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} value={confirmMdp} onChange={e => setConfirmMdp(e.target.value)}
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmMdp && confirmMdp !== newMdp && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Ne correspond pas</p>
                  )}
                  {confirmMdp && confirmMdp === newMdp && newMdp && (
                    <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Correspondance ✓</p>
                  )}
                </div>
              </div>

              <button onClick={handleMdpChange} disabled={saving || !oldMdp || !newMdp || !confirmMdp}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-md">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
                Modifier
              </button>
            </div>
          )}

          {/* ===== PRÉFÉRENCES ===== */}
          {activeTab === 'prefs' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-violet-500" /> Notifications
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Notifications par email", desc: "Recevoir les alertes importantes par email", state: notifEmail, setter: setNotifEmail },
                  { label: "Rappels de séances", desc: "Rappel 30 min avant le début d'une séance", state: notifSeance, setter: setNotifSeance },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{notif.label}</p>
                      <p className="text-xs text-gray-500">{notif.desc}</p>
                    </div>
                    <button onClick={() => notif.setter(!notif.state)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${notif.state ? 'bg-violet-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notif.state ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button onClick={handleSavePrefs} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-md">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {/* ===== ACTIVITÉ ===== */}
          {activeTab === 'activite' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-violet-500" /> Journal d'activité
                </h3>
                <span className="text-xs text-gray-400">{activites.length} entrée(s)</span>
              </div>
              {Array.isArray(activites) && activites.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activites.map((act, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{act.action || act.type || act.description || 'Activité'}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{act.details || act.detail || ''}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">{act.created_at ? new Date(act.created_at).toLocaleDateString('fr-FR') : ''}</p>
                        <p className="text-xs text-gray-400">{act.created_at ? new Date(act.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Aucune activité enregistrée</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}