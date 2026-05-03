import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';

export default function useFetch(url, options = {}) {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const executer = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await api.get(url);
      setDonnees(res.data);
    } catch (err) {
      setErreur(err.response?.data?.message || err.message);
    } finally {
      setChargement(false);
    }
  }, [url]);

  useEffect(() => {
    if (url) executer();
  }, [executer, url]);

  return { donnees, chargement, erreur, recharger: executer, setDonnees };
}