import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { utiliserAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import { Clock, Eye, EyeOff } from 'lucide-react';

export default function Connexion() {
  const navigate = useNavigate();
  const { connexion } = utiliserAuth();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [montrerMdp, setMontrerMdp] = useState(false);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      const res = await api.post('/auth/login', { email, password: motDePasse });
      console.log('✅ Réponse reçue:', res.data);

      const { token, utilisateur } = res.data.data;
      connexion(token, utilisateur);
      navigate('/');
    } catch (err) {
      console.error('❌ Erreur:', err.response?.status, err.response?.data, err.message);
      setErreur(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-midnight flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-sky blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-navy blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-midnight flex items-center justify-center mx-auto mb-8">
            <Clock size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white font-display mb-4">Teacher's Plan</h1>
          <p className="text-slate-400 text-lg max-w-md">
            Gérez les heures d'enseignement, planifiez les séances et suivez les paiements en toute simplicité.
          </p>
        </div>
        <div className="absolute bottom-8 left-0 right-0 text-center text-slate-600 text-xs">
          © {new Date().getFullYear()} Teacher's Plan — Tous droits réservés
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-snow">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-midnight flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-midnight font-display">Teacher's Plan</h1>
          </div>

          <div className="card p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-midnight font-display">Connexion</h2>
              <p className="text-sm text-slate-500 mt-1">Entrez vos identifiants pour accéder au système</p>
            </div>

            {erreur && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {erreur}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Adresse e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-field">Mot de passe</label>
                <div className="relative">
                  <input
                    type={montrerMdp ? 'text' : 'password'}
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMontrerMdp(!montrerMdp)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {montrerMdp ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={chargement}
                className="btn-primary w-full h-11 flex items-center justify-center"
              >
                {chargement ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/mot-de-passe-oublie" className="text-sm text-navy hover:underline">
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Teacher's Plan v1.0 — Gestion des heures d'enseignement
          </p>
        </div>
      </div>
    </div>
  );
}