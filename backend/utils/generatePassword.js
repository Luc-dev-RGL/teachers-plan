/**
 * Génère un mot de passe temporaire aléatoire
 * Format : 2 majuscules + 4 chiffres + 2 caractères spéciaux
 */
export function genererMotDePasse() {
  const majuscules = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const chiffres = '0123456789';
  const speciaux = '!@#$%&';

  const randChar = (chars) => chars[Math.floor(Math.random() * chars.length)];

  const parts = [
    randChar(majuscules),
    randChar(majuscules),
    randChar(chiffres),
    randChar(chiffres),
    randChar(chiffres),
    randChar(chiffres),
    randChar(speciaux),
    randChar(speciaux),
  ];

  // Mélanger
  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }

  return parts.join('');
}
