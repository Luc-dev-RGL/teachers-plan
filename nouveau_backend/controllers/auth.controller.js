import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { jwtConfig, bcryptOptions } from '../config/auth.js';

/**
 * Connexion d'un utilisateur
 */
export const connecter = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    // Validation des champs obligatoires
    if (!email || !mot_de_passe) {
      return res.status(400).json({ 
        succes: false, 
        message: 'Email et mot de passe sont obligatoires' 
      });
    }

    // Recherche de l'utilisateur
    const { rows } = await query(
      `SELECT u.id, u.email, u.mot_de_passe, u.role, u.actif, u.nom, u.prenom, u.avatar,
              e.id as enseignant_id, e.matricule, e.grade, e.telephone, e.statut as enseignant_statut,
              d.nom as departement_nom
       FROM utilisateurs u
       LEFT JOIN enseignants e ON e.utilisateur_id = u.id
       LEFT JOIN departements d ON e.departement_id = d.id
       WHERE u.email = $1`, 
      [email.toLowerCase().trim()]
    );

    const utilisateur = rows[0];

    // Vérification de l'existence
    if (!utilisateur) {
      return res.status(401).json({ 
        succes: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérification du mot de passe
    const passwordMatch = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!passwordMatch) {
      return res.status(401).json({ 
        succes: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérification du statut actif
    if (!utilisateur.actif) {
      return res.status(403).json({ 
        succes: false, 
        message: 'Compte désactivé. Veuillez contacter l\'administrateur.' 
      });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { 
        id: utilisateur.id, 
        email: utilisateur.email, 
        role: utilisateur.role,
        enseignant_id: utilisateur.enseignant_id 
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    console.log(`✅ Connexion réussie pour: ${utilisateur.email}`);

    // Réponse avec les données utilisateur
    res.json({
      succes: true,
      message: 'Connexion réussie',
      donnees: {
        token,
        utilisateur: {
          id: utilisateur.id,
          email: utilisateur.email,
          role: utilisateur.role,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          avatar: utilisateur.avatar,
          enseignant_id: utilisateur.enseignant_id,
          matricule: utilisateur.matricule,
          grade: utilisateur.grade,
          telephone: utilisateur.telephone,
          departement_nom: utilisateur.departement_nom,
          enseignant_statut: utilisateur.enseignant_statut,
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    res.status(500).json({ 
      succes: false, 
      message: 'Erreur interne du serveur lors de la connexion' 
    });
  }
};

/**
 * Inscription d'un nouvel utilisateur (réservé aux admin/rh)
 */
export const inscrire = async (req, res) => {
  try {
    const { email, mot_de_passe, nom, prenom, role = 'enseignant' } = req.body;

    // Validation des champs obligatoires
    if (!email || !mot_de_passe || !nom || !prenom) {
      return res.status(400).json({ 
        succes: false, 
        message: 'Tous les champs sont obligatoires (email, mot de passe, nom, prénom)' 
      });
    }

    // Validation du rôle
    const rolesValides = ['admin', 'rh', 'enseignant'];
    if (!rolesValides.includes(role)) {
      return res.status(400).json({ 
        succes: false, 
        message: 'Rôle invalide. Rôles acceptés: admin, rh, enseignant' 
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
        message: 'Cet email est déjà utilisé par un autre utilisateur' 
      });
    }

    // Hachage du mot de passe
    const hash = await bcrypt.hash(mot_de_passe, bcryptOptions.rounds);

    // Création de l'utilisateur
    const { rows } = await query(
      `INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, role, actif)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING id, email, nom, prenom, role, actif, cree_le`,
      [email.toLowerCase().trim(), hash, nom.trim(), prenom.trim(), role]
    );

    const nouvelUtilisateur = rows[0];

    console.log(`✅ Utilisateur créé: ${nouvelUtilisateur.email}`);

    res.status(201).json({
      succes: true,
      message: 'Utilisateur créé avec succès',
      donnees: nouvelUtilisateur
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        succes: false, 
        message: 'Cet email existe déjà dans la base de données' 
      });
    }
    
    res.status(500).json({ 
      succes: false, 
      message: 'Erreur interne du serveur lors de l\'inscription' 
    });
  }
};

/**
 * Récupération des informations de l'utilisateur connecté
 */
export const obtenirProfil = async (req, res) => {
  try {
    const userId = req.utilisateur.id;

    const { rows } = await query(
      `SELECT u.id, u.email, u.role, u.actif, u.nom, u.prenom, u.avatar, u.cree_le,
              e.id as enseignant_id, e.matricule, e.grade, e.telephone, e.statut as enseignant_statut,
              d.id as departement_id, d.nom as departement_nom
       FROM utilisateurs u
       LEFT JOIN enseignants e ON e.utilisateur_id = u.id
       LEFT JOIN departements d ON e.departement_id = d.id
       WHERE u.id = $1`, 
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        succes: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    res.json({
      succes: true,
      donnees: rows[0]
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du profil:', error);
    res.status(500).json({ 
      succes: false, 
      message: 'Erreur interne du serveur' 
    });
  }
};

/**
 * Modification du mot de passe
 */
export const modifierMotDePasse = async (req, res) => {
  try {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;
    const userId = req.utilisateur.id;

    // Validation
    if (!ancien_mot_de_passe || !nouveau_mot_de_passe) {
      return res.status(400).json({ 
        succes: false, 
        message: 'L\'ancien et le nouveau mot de passe sont requis' 
      });
    }

    // Vérification de la longueur du nouveau mot de passe
    if (nouveau_mot_de_passe.length < 6) {
      return res.status(400).json({ 
        succes: false, 
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' 
      });
    }

    // Récupération du mot de passe actuel
    const { rows } = await query(
      'SELECT mot_de_passe FROM utilisateurs WHERE id = $1', 
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        succes: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Vérification de l'ancien mot de passe
    const match = await bcrypt.compare(ancien_mot_de_passe, rows[0].mot_de_passe);
    if (!match) {
      return res.status(400).json({ 
        succes: false, 
        message: 'Ancien mot de passe incorrect' 
      });
    }

    // Hachage du nouveau mot de passe
    const nouveauHash = await bcrypt.hash(nouveau_mot_de_passe, bcryptOptions.rounds);

    // Mise à jour
    await query(
      'UPDATE utilisateurs SET mot_de_passe = $1, modifie_le = CURRENT_TIMESTAMP WHERE id = $2', 
      [nouveauHash, userId]
    );

    console.log(`✅ Mot de passe modifié pour l'utilisateur: ${userId}`);

    res.json({
      succes: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la modification du mot de passe:', error);
    res.status(500).json({ 
      succes: false, 
      message: 'Erreur interne du serveur' 
    });
  }
};

/**
 * Déconnexion (côté serveur - juste un message de confirmation)
 */
export const deconnecter = async (req, res) => {
  console.log(`✅ Déconnexion de l'utilisateur: ${req.utilisateur?.email || 'inconnu'}`);
  res.json({
    succes: true,
    message: 'Déconnexion réussie'
  });
};
