import { query } from '../config/db.js';

export const exportHeuresExcel = async (req, res) => {
  try {
    const { annee_academique_id } = req.query;
    if (!annee_academique_id) return res.status(400).json({ success: false, message: 'annee_academique_id requis' });

    const { rows } = await query(
      `SELECT e.matricule, e.nom, e.prenom, e.grade,
              he.nombre_heures, eq.type_heure, eq.coefficient,
              (he.nombre_heures * eq.coefficient) as heures_equivalentes
       FROM heures_effectuees he
       JOIN enseignants e ON he.enseignant_id = e.id
       JOIN equivalences eq ON he.equivalence_id = eq.id
       WHERE he.annee_academique_id = $1 ORDER BY e.nom`, [annee_academique_id]
    );

    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Heures Effectuées');
    sheet.columns = [
      { header: 'Matricule', key: 'matricule', width: 15 },
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Grade', key: 'grade', width: 15 },
      { header: 'Type', key: 'type_heure', width: 12 },
      { header: 'Heures', key: 'nombre_heures', width: 10 },
      { header: 'Coeff.', key: 'coefficient', width: 8 },
      { header: 'Hrs Équiv.', key: 'heures_equivalentes', width: 12 },
    ];
    rows.forEach(row => sheet.addRow(row));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=heures_effectuees.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportHeuresPdf = async (req, res) => {
  try {
    const { annee_academique_id } = req.query;
    if (!annee_academique_id) return res.status(400).json({ success: false, message: 'annee_academique_id requis' });

    const { rows } = await query(
      `SELECT e.matricule, e.nom, e.prenom, e.grade,
              SUM(he.nombre_heures * eq.coefficient) as total_equivalent,
              th.montant,
              (SUM(he.nombre_heures * eq.coefficient) * th.montant) as montant_total
       FROM heures_effectuees he
       JOIN enseignants e ON he.enseignant_id = e.id
       JOIN equivalences eq ON he.equivalence_id = eq.id
       LEFT JOIN taux_horaire th ON th.grade = e.grade AND th.annee_academique_id = $1
       WHERE he.annee_academique_id = $1
       GROUP BY e.matricule, e.nom, e.prenom, e.grade, th.montant
       ORDER BY e.nom`, [annee_academique_id]
    );

    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=heures_effectuees.pdf');
    doc.pipe(res);

    doc.fontSize(18).text('Rapport des Heures Effectuées', { align: 'center' });
    doc.moveDown(1);

    const headers = ['Matricule', 'Nom', 'Prénom', 'Grade', 'Hrs Équiv.', 'Montant'];
    const colWidths = [80, 90, 90, 80, 70, 80];
    let y = doc.y;

    doc.font('Helvetica-Bold').fontSize(9);
    headers.forEach((h, i) => doc.text(h, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, { width: colWidths[i] }));
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(8);
    rows.forEach(row => {
      const vals = [row.matricule, row.nom, row.prenom, row.grade,
        String(row.total_equivalent || 0), String(row.montant_total || 0) + ' FCFA'];
      vals.forEach((v, i) => doc.text(v || '', 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), doc.y, { width: colWidths[i] }));
      doc.moveDown(0.2);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};