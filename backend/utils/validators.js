export const validerEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validerMotDePasse = (motDePasse) => {
  return motDePasse && motDePasse.length >= 8;
};

export const validerTelephone = (tel) => {
  if (!tel) return true;
  return /^[\d\s+()-]{8,20}$/.test(tel);
};

export const validerDate = (date) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
};

export const validerHeure = (heure) => {
  return /^\d{2}:\d{2}$/.test(heure);
};

export const nettoyerDonnees = (donnees) => {
  const nettoyees = {};
  for (const [cle, valeur] of Object.entries(donnees)) {
    if (typeof valeur === 'string') {
      nettoyees[cle] = valeur.trim();
    } else {
      nettoyees[cle] = valeur;
    }
  }
  return nettoyees;
};