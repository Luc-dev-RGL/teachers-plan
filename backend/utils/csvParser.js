import fs from 'fs';

export const lireCSV = async (cheminFichier) => {
  const contenu = await fs.promises.readFile(cheminFichier, 'utf-8');
  const lignes = contenu.split('\n').filter(l => l.trim());
  if (lignes.length < 2) return [];

  const enTetes = lignes[0].split(',').map(h => h.trim());
  return lignes.slice(1).map(ligne => {
    const valeurs = ligne.split(',').map(v => v.trim());
    const objet = {};
    enTetes.forEach((enTete, i) => {
      objet[enTete] = valeurs[i] || '';
    });
    return objet;
  });
};