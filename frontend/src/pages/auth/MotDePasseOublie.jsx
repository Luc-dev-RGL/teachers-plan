import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      await api.post('/auth/mot-de-passe-oublie', { email });
      setEnvoye(true);
    } catch (err) {
      setErreur(err.response?.data?.message || "Une erreur s'est produite");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-snow">
      <div className="w-full max-w-md">
        <Link
          to="/connexion"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-navy mb-6"
        >
          <ArrowLeft size={16} /> Retour à la connexion
        </Link>

        <div className="card p-8">
          {envoye ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-midnight font-display mb-2">E-mail envoyé</h2>
              <p className="text-sm text-slate-500">
                Si un compte existe avec cet e-mail, vous recevrez un lien de réinitialisation.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-midnight font-display">Mot de passe oublié</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Entrez votre e-mail pour recevoir un lien de réinitialisation
                </p>
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
                <button
                  type="submit"
                  disabled={chargement}
                  className="btn-primary w-full h-11 flex items-center justify-center gap-2"
                >
                  {chargement ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Mail size={16} /> Envoyer le lien
                    </>
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