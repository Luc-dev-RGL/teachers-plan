import { query } from '../config/db.js';

/**
 * Mapping grade → catégorie salariale
 */
const gradeToCategorie = (grade) => {
  const map = {
    'Professeur': 'A',
    'Maître de Conférences': 'A',
    'Maître Assistant': 'B',
    'Docteur': 'B',
    'Attaché': 'C',
    'Assistant': 'C',
    'Vacataire': 'D',
  };
  return map[grade] || 'D';
};

/**
 * Récupérer tous les enseignants
 */
export const obtenirTous = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT e.*, 
             u.email as utilisateur_email,
             d.nom AS departement_nom,
             COALESCE(SUM(he.heures_reelles), 0) AS heures_totales
      FROM enseignants e
      LEFT JOIN utilisateurs u ON u.id = e.utilisateur_id
      LEFT JOIN departements d ON e.departement_id = d.id
      LEFT JOIN heures_effectuees he ON he.enseignant_id = e.id
      GROUP BY e.id, u.email, d.nom
      ORDER BY e.nom ASC
    `);
    
    const donnees = rows.map(row => ({
      ...row,
      prenom: row.prenom || '',
      prenoms: row.prenom || '',
      heures: parseFloat(row.heures_totales) || 0,
    }));
    
    res.json({ 
      succes: true, 
      message: 'Liste des enseignants récupérée avec succès',
      donnees,
      total: donnees.length
    });
  } catch (erreur) {
    console.error('❌ Erreur lors de la récupération des enseignants:', erreur);
    res.status(500).json({ 
      succes: false, 
      message: 'Erreur interne du serveur lors de la récupération des enseignants' 
    });
  }
};

/**
 * Récupérer un enseignant par ID
 */
export const obtenirParId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { rows } = await query(`
      SELECT e.*, 
             u.email as utilisateur_email,
             d.nom AS departement_nom,
             COALESCE(SUM(he.heures_reelles), 0) AS heures_totales
      FROM enseignants e
      LEFT JOIN utilisateurs u ON u.id = e.utilisateur_id
      LEFT JOIN departements d ON e.departement_id = d.id
      LEFT JOIN heures_effectuees he ON he.enseignant_id = e.id
      WHERE e.id = $1
      GROUP BY e.id, u.email, d.nom
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        succes: false, 
        message: 'Enseignant non trouvé' 
      });
    }
    
    const row = rows[0];
    res.json({ 
      succes: true, 
      message: 'Enseignant récupéré avec succès',
      donnees: { 
        ...row, 
        prenoms: row.prenom || '',
        heures: parseFloat(row.heures_totales) || 0
      } 
    });
  } catch (erreur) {
    console.error('❌ Erreur lors de la récupération de l\'enseignant:', erreur);
    res.status(500).json({ 
      succes: false, 
      message: 'Erreur interne du serveur' 
    });
  }
};

/**
 * Créer un nouvel enseignant
 */
export const creer = async (req, res) => {
  try {
    const { 
      nom, 
      prenoms, 
      email, 
      telephone, 
      grade, 
      departement_id, 
      statut,
      mot_de_passe 
    } = req.body;

    // Validation des champs obligatoires
    if (!nom || !prenoms || !email) {
      return res.status(400).json({ 
        succes: false, 
        message: 'Nom, prénoms et email sont obligatoires' 
      });
    }

    // Le mot de passe est obligatoire pour la création
    if (!mot_de_passe) {
      return res.status(400).json({ 
        succes: false, 
        message: 'Le mot de passe est obligatoire pour créer un enseignant' 
      });
    }

    // Vérification de l'existence de l'email
    const emailCheck = await query(
      'SELECT id FROM utilisateurs WHERE email = $1', 
      [email.toLowerCase().trim()]
    );
    
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ 
        succes: false, 
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Génération du matricule
    const matricule = `ENS-${Date.now().toString(36).toUpperCase()}`;
    const categorie = gradeToCategorie(grade);

    // Import de bcrypt pour hacher le mot de passe
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(mot_de_passe, 10);

    // Transaction: création de l'utilisateur puis de l'enseignant
    const client = await import('../config/db.js').then(m => m.getClient());
    
    try {
      await client.query('BEGIN');

      // Création de l'utilisateur
      const userResult = await client.query(
        `INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, role, actif)
         VALUES ($1, $2, $3, $4, 'enseignant', TRUE)
         RETURNING id`,
        [email.toLowerCase().trim(), hashedPassword, nom.trim(), prenoms.trim()]
      );

      const utilisateurId = userResult.rows[0].id;

      // Création de l'enseignant
      const ensResult = await client.query(`
        INSERT INTO enseignants (matricule, utilisateur_id, departement_id, telephone, grade, categorie, statut)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [matricule, utilisateurId, departement_id || null, telephone || null, grade || 'Assistant', categorie, statut || 'actif']);

      await client.query('COMMIT');

      const nouvelEnseignant = ensResult.rows[0];

      console.log(`✅ Enseignant créé: ${nouvelEnseignant.matricule}`);

      res.status(201).json({
        succes: true,
        message: 'Enseignant créé avec succès',
        donnees: { 
          ...nouvelEnseignant, 
          prenoms: nouvelEnseignant.prenom,
          email: email.toLowerCase().trim()
        }
      });
    } catch (erreurTransaction) {
      await client.query('ROLLBACK');
      throw erreurTransaction;
    } finally {
      client.release();
    }
  } catch (erreur) {
    console.error('❌ Erreur lors de la création de l\'enseignant:', erreur);
    
    if (erreur.code === '23505') {
      return res.status(409).json({ 
        succes: false, 
        message: 'Email ou matricule déjà existant' 
      });
    }
    
    res.status(500).json({ 
      succes: false, 
      message: 'Erreur interne du serveur lors de la création' 
    });
  }
};

/**
 * Modifier un enseignant
 */
export const modifier = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nom, 
      prenoms, 
      email, 
      telephone, 
      grade, 
      departement_id, 
      statut 
    } = req.body;

    const categorie = grade ? gradeToCategorie(grade) : null;

    // Récupération de l'enseignant actuel
    const currentCheck = await query(
      'SELECT utilisateur_id FROM enseignants WHERE id = $1',
      [id]
    );

    if (currentCheck.rows.length === 0) {
      return res.status(404).json({ 
        succes: false, 
        message: 'Enseignant non trouvé' 
      });
    }

    const utilisateurId = currentCheck.rows[0].utilisateur_id;

    // Mise à jour de l'enseignant
    const { rows } = await query(`
      UPDATE enseignants
      SET nom = COALESCE($1, nom),
          prenom = COALESCE($2, prenom),
          telephone = COALESCE($3, telephone),
          grade = COALESCE($4, grade),
          categorie = COALESCE($5, categorie),
          departement_id = COALESCE($6, departement_id),
          statut = COALESCE($7, statut),
          modifie_le = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [nom, prenoms, telephone, grade, categorie, departement_id, statut, id]);

    // Mise à jour de l'utilisateur si email fourni
    if (email) {
      await query(
        'UPDATE utilisateurs SET email = $1, nom = $2, prenom = $3, modifie_le = CURRENT_TIMESTAMP WHERE id = $4',
        [email.toLowerCase().trim(), nom, prenoms, utilisateurId]
      );
    }

    if (rows.length === 0) {
      return res.status(404).json({ 
        succes: false, 
        message: 'Enseignant non trouvé' 
      });
    }

    const enseignantModifie = rows[0];

    console.log(`✅ Enseignant modifié: ${enseignantModifie.matricule}`);

    res.json({
      succes: true,
      message: 'Enseignant modifié avec succès',
      donnees: { 
        ...enseignantModifie, 
        prenoms: enseignantModifie.prenom,
        email: email ? email.toLowerCase().trim() : undefined
      }
    });
  } catch (erreur) {
    console.error('❌ Erreur lors de la modification de l\'enseignant:', erreur);
    
    if (erreur.code === '23505') {
      return res.status(409).json({ 
        succes: false, 
        message: 'Email ou matricule déjà existant' 
      });
    }
    
    res.status(500).json({ 
      succes: false, 
      message: 'Erreur interne du serveur lors de la modification' 
    });
  }
};

/**
 * Supprimer un enseignant
 */
export const supprimer = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérification de l'existence
    const checkResult = await query(
      'SELECT matricule FROM enseignants WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        succes: false, 
        message: 'Enseignant non trouvé' 
      });
    }

    const matricule = checkResult.rows[0].matricule;

    // Suppression (CASCADE supprimera aussi l'utilisateur lié)
    await query('DELETE FROM enseignants WHERE id = $1', [id]);

    console.log(`✅ Enseignant supprimé: ${matricule}`);

    res.json({
      succes: true,
      message: 'Enseignant supprimé avec succès'
    });
  } catch (erreur) {
    console.error('❌ Erreur lors de la suppression de l\'enseignant:', erreur);
    
    if (erreur.code === '23503') {
      return res.status(409).json({ 
        succes: false, 
        message: 'Suppression impossible: cet enseignant est associé à des séances ou heures enregistrées' 
      });
    }
    
    res.status(500).json({ 
      succes: false, 
      message: 'Erreur interne du serveur lors de la suppression' 
    });
  }
};
