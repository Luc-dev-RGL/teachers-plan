import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'teachers_plan',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('❌ Erreur inattendue du pool PostgreSQL:', err);
  process.exit(-1);
});

/**
 * Exécute une requête SQL avec paramètres
 * @param {string} text - Requête SQL
 * @param {array} params - Paramètres de la requête
 * @returns {Promise} Résultat de la requête
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Requête exécutée en', duration, 'ms');
    }
    return res;
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution de la requête:', error.message);
    throw error;
  }
};

/**
 * Récupère un client pour les transactions
 * @returns {Promise} Client de base de données
 */
export const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const release = client.release.bind(client);
  
  client.release = () => {
    release();
  };
  
  client.query = (...args) => originalQuery(...args);
  
  return client;
};

export default pool;
