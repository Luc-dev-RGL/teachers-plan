import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js';
import { ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function ReinitialiserMdp() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [montrer, setMontrer] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (motDePasse !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas');
      return;
    }
    if (motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setErreur('');
    setChargement(true);
    try {
      await api.post('/auth/reinitialiser-mot-de-passe', {
        token,
        mot_de_passe: motDePasse,
      });
      setSucces(true);
      setTimeout(() => navigate('/connexion'), 3000);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Token invalide ou expiré');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-snow">
      <div className="w-full max-w-md">
        <Link to="/connexion" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-navy mb-6">
          <ArrowLeft size={16} /> Retour à la connexion
        </Link>

        <div className="card p-8">
          {succes ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-midnight font-display mb-2">Mot de passe mis à jour</h2>
              <p className="text-sm text-slate-500">Vous allez être redirigé vers la connexion...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-midnight font-display">Nouveau mot de passe</h2>
                <p className="text-sm text-slate-500 mt-1">Choisissez votre nouveau mot de passe</p>
              </div>

              {erreur && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{erreur}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-field">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={montrer ? 'text' : 'password'}
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      required
                      className="input-field pr-10"
                    />
                    <button type="button" onClick={() => setMontrer(!montrer)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {montrer ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label-field">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
                <button type="submit" disabled={chargement} className="btn-primary w-full h-11 flex items-center justify-center">
                  {chargement ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    'Réinitialiser'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}