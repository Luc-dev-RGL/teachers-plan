import bcrypt from 'bcryptjs';

const motDePasse = 'password123';
const hash = await bcrypt.hash(motDePasse, 10);
console.log('Nouveau hash:', hash);

// Vérifie immédiatement
const valide = await bcrypt.compare(motDePasse, hash);
console.log('Vérification:', valide);