const COEFFICIENTS_DEFAUT = { CM: 1.5, TD: 1.0, TP: 1.0, Projet: 1.0 };

export function calculerHeuresEquivTD(heuresReelles, typeHeure, equivalences = []) {
  const equiv = equivalences.find((e) => e.type_heure === typeHeure);
  const coefficient = equiv ? parseFloat(equiv.coefficient) : (COEFFICIENTS_DEFAUT[typeHeure] || 1.0);
  return parseFloat((heuresReelles * coefficient).toFixed(2));
}

export function calculerMontant(heuresEquivTD, tauxHoraire) {
  return parseFloat((heuresEquivTD * tauxHoraire).toFixed(0));
}

export function calculerTotalHeures(seances, equivalences = []) {
  return seances.reduce((total, s) => {
    return total + calculerHeuresEquivTD(s.duree_heures, s.type_heure, equivalences);
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