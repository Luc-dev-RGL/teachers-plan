import pool from '../config/db.js';

export const rechercher = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ succes: true, donnees: [] });
    }

    const term = `%${q}%`;
    const limit = 5;

    const [enseignants, matieres, classes, salles, departements, filieres, seances] = await Promise.all([
      pool.query(
        `SELECT e.id, e.matricule, u.nom, u.prenom, u.email, d.nom as departement_nom
         FROM enseignants e
         JOIN utilisateurs u ON e.utilisateur_id = u.id
         LEFT JOIN departements d ON e.departement_id = d.id
         WHERE e.matricule ILIKE $1 OR u.nom ILIKE $1 OR u.prenom ILIKE $1 OR u.email ILIKE $1
         ORDER BY u.nom LIMIT $2`, [term, limit]
      ),
      pool.query(
        `SELECT m.id, m.nom, m.code, d.nom as departement_nom
         FROM matieres m
         JOIN departements d ON m.departement_id = d.id
         WHERE m.nom ILIKE $1 OR m.code ILIKE $1
         ORDER BY m.nom LIMIT $2`, [term, limit]
      ),
      pool.query(
        `SELECT c.id, c.nom, c.code, f.nom as filiere_nom, n.nom as niveau_nom
         FROM classes c
         JOIN filieres f ON c.filiere_id = f.id
         JOIN niveaux n ON c.niveau_id = n.id
         WHERE c.nom ILIKE $1 OR c.code ILIKE $1
         ORDER BY c.nom LIMIT $2`, [term, limit]
      ),
      pool.query(
        `SELECT id, nom, code, capacite, type FROM salles
         WHERE nom ILIKE $1 OR code ILIKE $1
         ORDER BY nom LIMIT $2`, [term, limit]
      ),
      pool.query(
        `SELECT id, nom, code FROM departements
         WHERE nom ILIKE $1 OR code ILIKE $1
         ORDER BY nom LIMIT $2`, [term, limit]
      ),
      pool.query(
        `SELECT f.id, f.nom, f.code, d.nom as departement_nom
         FROM filieres f
         JOIN departements d ON f.departement_id = d.id
         WHERE f.nom ILIKE $1 OR f.code ILIKE $1
         ORDER BY f.nom LIMIT $2`, [term, limit]
      ),
      pool.query(
        `SELECT s.id, m.nom as matiere_nom, m.code as matiere_code, c.nom as classe_nom,
                sa.nom as salle_nom, s.date, u.nom as enseignant_nom, u.prenom as enseignant_prenom
         FROM seances_cours s
         JOIN enseignants e ON e.id = s.enseignant_id
         JOIN utilisateurs u ON u.id = e.utilisateur_id
         JOIN matieres m ON m.id = s.matiere_id
         JOIN classes c ON c.id = s.classe_id
         JOIN salles sa ON sa.id = s.salle_id
         WHERE m.nom ILIKE $1 OR m.code ILIKE $1 OR c.nom ILIKE $1 OR u.nom ILIKE $1 OR u.prenom ILIKE $1
         ORDER BY s.date DESC LIMIT $2`, [term, limit]
      ),
    ]);

    const donnees = [
      ...enseignants.rows.map((e) => ({
        type: 'enseignant',
        label: `${e.prenom} ${e.nom}`,
        sub: e.matricule + (e.departement_nom ? ` — ${e.departement_nom}` : ''),
        page: 'enseignants',
      })),
      ...matieres.rows.map((m) => ({
        type: 'matiere',
        label: m.nom,
        sub: `${m.code} — ${m.departement_nom}`,
        page: 'matieres',
      })),
      ...classes.rows.map((c) => ({
        type: 'classe',
        label: c.nom,
        sub: `${c.code} — ${c.filiere_nom} (${c.niveau_nom})`,
        page: 'classes',
      })),
      ...salles.rows.map((s) => ({
        type: 'salle',
        label: s.nom,
        sub: `${s.code} — Cap. ${s.capacite} — ${s.type}`,
        page: 'salles',
      })),
      ...departements.rows.map((d) => ({
        type: 'departement',
        label: d.nom,
        sub: d.code,
        page: 'departements',
      })),
      ...filieres.rows.map((f) => ({
        type: 'filiere',
        label: f.nom,
        sub: `${f.code} — ${f.departement_nom}`,
        page: 'filieres',
      })),
      ...seances.rows.map((s) => ({
        type: 'seance',
        label: `${s.matiere_nom} — ${s.classe_nom}`,
        sub: `${s.date} | ${s.salle_nom} | ${s.enseignant_prenom} ${s.enseignant_nom}`,
        page: 'seances',
      })),
    ];

    res.json({ succes: true, donnees: donnees.slice(0, 20) });
  } catch (error) {
    console.error('Erreur recherche:', error);
    res.json({ succes: true, donnees: [] });
  }
};