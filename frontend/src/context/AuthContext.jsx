import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [token, setToken] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const tokenStocke = localStorage.getItem('token');
    const utilisateurStocke = localStorage.getItem('utilisateur');

    if (tokenStocke && utilisateurStocke) {
      try {
        setToken(tokenStocke);
        setUtilisateur(JSON.parse(utilisateurStocke));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('utilisateur');
      }
    }
    setChargement(false);
  }, []);

  const connexion = (nouveauToken, nouvelUtilisateur) => {
    localStorage.setItem('token', nouveauToken);
    localStorage.setItem('utilisateur', JSON.stringify(nouvelUtilisateur));
    setToken(nouveauToken);
    setUtilisateur(nouvelUtilisateur);
  };

  const deconnexion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    setToken(null);
    setUtilisateur(null);
  };

  const mettreAJour = (donnees) => {
    const nouveau = { ...utilisateur, ...donnees };
    localStorage.setItem('utilisateur', JSON.stringify(nouveau));
    setUtilisateur(nouveau);
  };

  return (
    <AuthContext.Provider value={{ utilisateur, token, chargement, connexion, deconnexion, mettreAJour, axios }}>
      {children}
    </AuthContext.Provider>
  );
}

export function utiliserAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('utiliserAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}

export default AuthContext;