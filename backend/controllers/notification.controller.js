import pool from '../config/db.js';

// Récupérer toutes les notifications (admin/rh voient tout, enseignant voit les siennes)
export const getAll = async (req, res, next) => {
  try {
    let query;
    let params = [];

    if (req.user.role === 'enseignant') {
      query = `
        SELECT n.*, e.nom as expediteur_nom, e.prenom as expediteur_prenom
        FROM notifications n
        LEFT JOIN enseignants e ON n.expediteur_id = e.id
        WHERE n.destinataire_id = $1
        ORDER BY n.date_creation DESC
      `;
      params = [req.user.id];
    } else {
      query = `
        SELECT n.*, e.nom as expediteur_nom, e.prenom as expediteur_prenom,
               dest.nom as destinataire_nom, dest.prenom as destinataire_prenom
        FROM notifications n
        LEFT JOIN enseignants e ON n.expediteur_id = e.id
        LEFT JOIN enseignants dest ON n.destinataire_id = dest.id
        ORDER BY n.date_creation DESC
      `;
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

// Récupérer une notification par ID
export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT n.*, e.nom as expediteur_nom, e.prenom as expediteur_prenom
      FROM notifications n
      LEFT JOIN enseignants e ON n.expediteur_id = e.id
      WHERE n.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification non trouvée' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// Créer une notification
export const create = async (req, res, next) => {
  try {
    const { destinataire_id, titre, message, type, expediteur_id } = req.body;

    const result = await pool.query(`
      INSERT INTO notifications (expediteur_id, destinataire_id, titre, message, type, lu)
      VALUES ($1, $2, $3, $4, $5, false)
      RETURNING *
    `, [expediteur_id || req.user.id, destinataire_id, titre, message, type || 'info']);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// Marquer une notification comme lue
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      UPDATE notifications
      SET lu = true, date_lecture = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification non trouvée' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// Supprimer une notification (admin uniquement)
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification non trouvée' });
    }
    res.json({ success: true, message: 'Notification supprimée avec succès' });
  } catch (err) {
    next(err);
  }
};

// Compter les notifications non lues pour l'utilisateur connecté
export const getNonLues = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as total FROM notifications WHERE destinataire_id = $1 AND lu = false',
      [req.user.id]
    );
    res.json({ success: true, data: { total: parseInt(result.rows[0].total) } });
  } catch (err) {
    next(err);
  }
};