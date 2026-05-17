import { query } from '../config/db.js';

export const rechercher = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, data: [] });

    const term = `%${q}%`;
    const limit = 5;

    const [enseignants, matieres, classes, salles, departements, filieres, seances] = await Promise.all([
      query(`SELECT e.id, e.matricule, e.nom, e.prenom, e.email, d.nom as departement_nom
        FROM enseignants e LEFT JOIN departements d ON e.departement_id = d.id
        WHERE e.matricule ILIKE $1 OR e.nom ILIKE $1 OR e.prenom ILIKE $1 OR e.email ILIKE $1
        ORDER BY e.nom LIMIT $2`, [term, limit]),
      query(`SELECT m.id, m.nom, m.code, f.nom as filiere_nom
        FROM matieres m LEFT JOIN filieres f ON m.filiere_id = f.id
        WHERE m.nom ILIKE $1 OR m.code ILIKE $1 ORDER BY m.nom LIMIT $2`, [term, limit]),
      query(`SELECT c.id, c.nom, c.code, f.nom as filiere_nom, n.nom as niveau_nom
        FROM classes c
        LEFT JOIN niveaux n ON c.niveau_id = n.id LEFT JOIN filieres f ON n.filiere_id = f.id
        WHERE c.nom ILIKE $1 OR c.code ILIKE $1 ORDER BY c.nom LIMIT $2`, [term, limit]),
      query(`SELECT id, nom, code, capacite, type FROM salles
        WHERE nom ILIKE $1 OR code ILIKE $1 ORDER BY nom LIMIT $2`, [term, limit]),
      query(`SELECT id, nom, code FROM departements
        WHERE nom ILIKE $1 OR code ILIKE $1 ORDER BY nom LIMIT $2`, [term, limit]),
      query(`SELECT f.id, f.nom, f.code, d.nom as departement_nom
        FROM filieres f LEFT JOIN departements d ON f.departement_id = d.id
        WHERE f.nom ILIKE $1 OR f.code ILIKE $1 ORDER BY f.nom LIMIT $2`, [term, limit]),
      query(`SELECT s.id, m.nom as matiere_nom, c.nom as classe_nom,
          sa.nom as salle_nom, s.date, s.heure_debut, e.nom as enseignant_nom, e.prenom as enseignant_prenom
        FROM seances_cours s
        LEFT JOIN enseignants e ON e.id = s.enseignant_id
        LEFT JOIN matieres m ON m.id = s.matiere_id
        LEFT JOIN classes c ON c.id = s.classe_id
        LEFT JOIN salles sa ON sa.id = s.salle_id
        WHERE m.nom ILIKE $1 OR c.nom ILIKE $1 OR e.nom ILIKE $1 OR e.prenom ILIKE $1
        ORDER BY s.date DESC, s.heure_debut DESC LIMIT $2`, [term, limit]),
    ]);

    const donnees = [
      ...enseignants.rows.map(e => ({ type: 'enseignant', label: `${e.prenom} ${e.nom}`, sub: e.matricule + (e.departement_nom ? ` — ${e.departement_nom}` : ''), page: 'enseignants' })),
      ...matieres.rows.map(m => ({ type: 'matiere', label: m.nom, sub: `${m.code}${m.filiere_nom ? ` — ${m.filiere_nom}` : ''}`, page: 'matieres' })),
      ...classes.rows.map(c => ({ type: 'classe', label: c.nom, sub: `${c.code}${c.filiere_nom ? ` — ${c.filiere_nom}` : ''}${c.niveau_nom ? ` (${c.niveau_nom})` : ''}`, page: 'classes' })),
      ...salles.rows.map(s => ({ type: 'salle', label: s.nom, sub: `${s.code} — Cap. ${s.capacite} — ${s.type}`, page: 'salles' })),
      ...departements.rows.map(d => ({ type: 'departement', label: d.nom, sub: d.code, page: 'departements' })),
      ...filieres.rows.map(f => ({ type: 'filiere', label: f.nom, sub: `${f.code}${f.departement_nom ? ` — ${f.departement_nom}` : ''}`, page: 'filieres' })),
      ...seances.rows.map(s => ({ type: 'seance', label: `${s.matiere_nom} — ${s.classe_nom}`, sub: `${s.date ? new Date(s.date).toLocaleDateString('fr-FR') : ''} | ${s.heure_debut || ''} | ${s.salle_nom || ''} | ${s.enseignant_prenom} ${s.enseignant_nom}`, page: 'seances' })),
    ];

    res.json({ success: true, data: donnees.slice(0, 20) });
  } catch (error) {
    console.error('Erreur recherche:', error);
    res.json({ success: true, data: [] });
  }
};