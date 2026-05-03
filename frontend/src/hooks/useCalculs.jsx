const FACTEURS_DEFAUT = { CM: 1.5, TD: 1.0, TP: 1.0, Projet: 1.0 };

export function calculerHeuresEquivTD(heuresReelles, typeCours, equivalences = []) {
  const equiv = equivalences.find((e) => e.type_cours === typeCours);
  const facteur = equiv ? parseFloat(equiv.facteur) : (FACTEURS_DEFAUT[typeCours] || 1.0);
  return parseFloat((heuresReelles * facteur).toFixed(2));
}

export function calculerMontant(heuresEquivTD, tauxHoraire) {
  return parseFloat((heuresEquivTD * tauxHoraire).toFixed(0));
}

export function calculerTotalHeures(seances, equivalences = []) {
  return seances.reduce((total, s) => {
    return total + calculerHeuresEquivTD(s.duree_heures, s.type_cours, equivalences);
  }, 0);
}

export function calculerTotalMontant(heuresEquivTD, tauxHoraire) {
  return parseFloat((heuresEquivTD * tauxHoraire).toFixed(0));
}

export function formaterMontant(montant) {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
}

export function formaterHeures(heures) {
  return heures.toFixed(2) + 'h';
}