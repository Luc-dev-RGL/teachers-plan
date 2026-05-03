export const calculerHeuresEquivTD = (heuresReelles, coefficient) => {
  return parseFloat((heuresReelles * coefficient).toFixed(2));
};

export const calculerMontant = (heuresEquivTD, tauxHoraire) => {
  return parseFloat((heuresEquivTD * (tauxHoraire || 0)).toFixed(2));
};

export const calculerTotalHeures = (seances) => {
  return seances.reduce((total, s) => {
    return total + parseFloat(s.nombre_heures || 0);
  }, 0);
};

export const formaterMontant = (montant) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant) + ' FCFA';
};

export const formaterHeures = (heures) => {
  return parseFloat(heures).toFixed(2).replace('.', ',') + ' h';
};