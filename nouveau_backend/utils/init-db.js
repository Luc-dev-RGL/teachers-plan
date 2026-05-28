import bcrypt from 'bcryptjs';
import { query } from './config/db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initialiserBaseDeDonnees() {
  console.log('🚀 Initialisation de la base de données...');

  try {
    // Lecture du fichier SQL
    const schemaPath = join(__dirname, 'schema.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf-8');

    // Séparation des instructions SQL
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 ${statements.length} instructions SQL à exécuter`);

    // Exécution de chaque instruction
    let count = 0;
    for (const statement of statements) {
      try {
        await query(statement);
        count++;
        if (count % 10 === 0) {
          console.log(`✅ ${count}/${statements.length} instructions exécutées`);
        }
      } catch (err) {
        // On ignore les erreurs pour les INSERT avec ON CONFLICT
        if (!err.message.includes('already exists')) {
          console.warn('⚠️  Instruction ignorée:', err.message.substring(0, 100));
        }
      }
    }

    console.log(`✅ ${count} instructions exécutées avec succès`);

    // Mise à jour des mots de passe par défaut
    console.log('🔐 Mise à jour des mots de passe par défaut...');
    const hashedPassword = await bcrypt.hash('pass1234', 10);
    
    await query(
      `UPDATE utilisateurs SET mot_de_passe = $1 WHERE email IN (
        'admin@teachersplan.com', 
        'rh@teachersplan.com', 
        'prof@teachersplan.com'
      )`,
      [hashedPassword]
    );

    console.log('✅ Mots de passe mis à jour (mot de passe par défaut: pass1234)');

    // Création d'un enseignant lié à l'utilisateur prof
    console.log('👨‍🏫 Création de l\'enseignant de test...');
    try {
      const profResult = await query(
        'SELECT id FROM utilisateurs WHERE email = $1',
        ['prof@teachersplan.com']
      );
      
      if (profResult.rows.length > 0) {
        const profId = profResult.rows[0].id;
        
        // Vérifier si l'enseignant existe déjà
        const existingEnseignant = await query(
          'SELECT id FROM enseignants WHERE utilisateur_id = $1',
          [profId]
        );
        
        if (existingEnseignant.rows.length === 0) {
          const deptResult = await query(
            'SELECT id FROM departements WHERE code = $1',
            ['INFO']
          );
          
          if (deptResult.rows.length > 0) {
            await query(
              `INSERT INTO enseignants (matricule, utilisateur_id, departement_id, telephone, categorie, grade, statut)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              ['ENS-2024-001', profId, deptResult.rows[0].id, '77 123 45 67', 'Permanent', 'Professeur', 'actif']
            );
            console.log('✅ Enseignant de test créé');
          }
        } else {
          console.log('ℹ️  Enseignant de test déjà existant');
        }
      }
    } catch (err) {
      console.warn('⚠️ Erreur lors de la création de l\'enseignant:', err.message);
    }

    console.log('\n✅ ============================================');
    console.log('✅ Base de données initialisée avec succès!');
    console.log('✅ ============================================');
    console.log('\n📊 Comptes de test créés:');
    console.log('   - Admin: admin@teachersplan.com / pass1234');
    console.log('   - RH: rh@teachersplan.com / pass1234');
    console.log('   - Prof: prof@teachersplan.com / pass1234');
    console.log('\n🚀 Vous pouvez maintenant démarrer le serveur!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

// Lancement de l'initialisation
initialiserBaseDeDonnees();
