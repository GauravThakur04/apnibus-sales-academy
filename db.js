import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RESULTS_FILE = path.join(__dirname, "data", "results.json");

const { Pool } = pg;

// Read DB Credentials from env (BD_READ_DB_* or standard PG*)
const dbHost = process.env.BD_READ_DB_HOST || process.env.PGHOST;
const dbPort = parseInt(process.env.BD_READ_DB_PORT || process.env.PGPORT || "5432", 10);
const dbName = process.env.BD_READ_DB_NAME || process.env.PGDATABASE || "postgres";
const dbUser = process.env.BD_READ_DB_USER || process.env.PGUSER;
const dbPass = process.env.BD_READ_DB_PASS || process.env.PGPASSWORD;

const isDbConfigured = Boolean(dbHost && dbUser && dbUser !== "--" && dbPass && dbPass !== "---");

let pool = null;

if (isDbConfigured) {
  pool = new Pool({
    host: dbHost,
    port: dbPort,
    database: dbName,
    user: dbUser,
    password: dbPass,
    ssl: { rejectUnauthorized: false }, // Required for Azure PostgreSQL Flexible Server
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('⚠️ Unexpected PostgreSQL pool error:', err);
  });
}

// Ensure database table exists
export async function initDb() {
  if (!pool) {
    console.log("ℹ️ PostgreSQL credentials incomplete or placeholders detected. Using local JSON fallback.");
    return false;
  }

  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS training_candidates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        gender VARCHAR(50) DEFAULT NULL,
        age VARCHAR(20) DEFAULT NULL,
        location VARCHAR(255) DEFAULT 'Field',
        status VARCHAR(50) DEFAULT 'IN_TRAINING',
        score INT DEFAULT 0,
        verdict VARCHAR(100) DEFAULT 'NOT YET CERTIFIED',
        training_completed BOOLEAN DEFAULT FALSE,
        step_index INT DEFAULT 0,
        video_correct_count INT DEFAULT 0,
        qa_correct_count INT DEFAULT 0,
        weak_areas JSONB DEFAULT '[]'::jsonb,
        choices JSONB DEFAULT '{}'::jsonb,
        attempted_grooming JSONB DEFAULT '{"deepDive": false, "objection": false, "roleplay": false, "pitchCorrection": false}'::jsonb,
        qa_choices JSONB DEFAULT '{}'::jsonb,
        messages JSONB DEFAULT '[]'::jsonb,
        certificate_id VARCHAR(100),
        certificate_issued_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE training_candidates ALTER COLUMN gender DROP DEFAULT;
      ALTER TABLE training_candidates ALTER COLUMN age DROP DEFAULT;
      ALTER TABLE training_candidates ALTER COLUMN gender SET DEFAULT NULL;
      ALTER TABLE training_candidates ALTER COLUMN age SET DEFAULT NULL;
      CREATE INDEX IF NOT EXISTS idx_training_candidates_email ON training_candidates(email);
      CREATE INDEX IF NOT EXISTS idx_training_candidates_name ON training_candidates(name);
    `;
    await pool.query(createTableQuery);
    console.log("✅ PostgreSQL table 'training_candidates' initialized successfully on Azure!");
    return true;
  } catch (err) {
    console.error("❌ Failed to initialize PostgreSQL table:", err.message);
    return false;
  }
}

// Get all candidates
export async function getAllCandidates() {
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM training_candidates ORDER BY updated_at DESC');
      return res.rows.map(rowToCandidate);
    } catch (err) {
      console.error("Error reading from PostgreSQL:", err.message);
    }
  }
  // Fallback to results.json
  if (fs.existsSync(RESULTS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    } catch (e) {
      return [];
    }
  }
  return [];
}

// Save or Update candidate
export async function saveCandidate(candidate) {
  if (!candidate || !candidate.name) return;

  // Always save to JSON file as fallback
  saveToJsonFile(candidate);

  if (!pool) return;

  try {
    const query = `
      INSERT INTO training_candidates (
        name, email, gender, age, location, status, score, verdict,
        training_completed, step_index, video_correct_count, qa_correct_count,
        weak_areas, choices, attempted_grooming, qa_choices, messages,
        certificate_id, certificate_issued_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        gender = EXCLUDED.gender,
        age = EXCLUDED.age,
        location = EXCLUDED.location,
        status = EXCLUDED.status,
        score = EXCLUDED.score,
        verdict = EXCLUDED.verdict,
        training_completed = EXCLUDED.training_completed,
        step_index = EXCLUDED.step_index,
        video_correct_count = EXCLUDED.video_correct_count,
        qa_correct_count = EXCLUDED.qa_correct_count,
        weak_areas = EXCLUDED.weak_areas,
        choices = EXCLUDED.choices,
        attempted_grooming = EXCLUDED.attempted_grooming,
        qa_choices = EXCLUDED.qa_choices,
        messages = EXCLUDED.messages,
        certificate_id = COALESCE(EXCLUDED.certificate_id, training_candidates.certificate_id),
        certificate_issued_at = COALESCE(EXCLUDED.certificate_issued_at, training_candidates.certificate_issued_at),
        updated_at = CURRENT_TIMESTAMP;
    `;

    const emailKey = candidate.email || candidate.name.toLowerCase().replace(/\s+/g, '_') + "@apnibus.com";

    const values = [
      candidate.name,
      emailKey,
      candidate.gender || null,
      candidate.age || null,
      candidate.location || 'Field',
      candidate.status || 'IN_TRAINING',
      candidate.score || 0,
      candidate.verdict || 'NOT YET CERTIFIED',
      Boolean(candidate.trainingCompleted),
      candidate.stepIndex || 0,
      candidate.videoCorrectCount || 0,
      candidate.qaCorrectCount || 0,
      JSON.stringify(candidate.weakAreas || []),
      JSON.stringify(candidate.choices || {}),
      JSON.stringify(candidate.attemptedGrooming || {}),
      JSON.stringify(candidate.qaChoices || {}),
      JSON.stringify(candidate.messages || []),
      candidate.certificateId || null,
      candidate.certificateIssuedAt ? new Date(candidate.certificateIssuedAt) : null
    ];

    await pool.query(query, values);
  } catch (err) {
    console.error("Error saving candidate to PostgreSQL:", err.message);
  }
}

// Convert DB row format back to candidate app format
function rowToCandidate(row) {
  return {
    name: row.name,
    email: row.email,
    gender: row.gender,
    age: row.age,
    location: row.location,
    status: row.status,
    score: row.score,
    verdict: row.verdict,
    trainingCompleted: row.training_completed,
    stepIndex: row.step_index,
    videoCorrectCount: row.video_correct_count,
    qaCorrectCount: row.qa_correct_count,
    weakAreas: row.weak_areas || [],
    choices: row.choices || {},
    attemptedGrooming: row.attempted_grooming || {},
    qaChoices: row.qa_choices || {},
    messages: row.messages || [],
    certificateId: row.certificate_id,
    certificateIssuedAt: row.certificate_issued_at,
    updatedAt: row.updated_at
  };
}

function saveToJsonFile(candidate) {
  try {
    if (!fs.existsSync(path.dirname(RESULTS_FILE))) {
      fs.mkdirSync(path.dirname(RESULTS_FILE), { recursive: true });
    }
    let data = [];
    if (fs.existsSync(RESULTS_FILE)) {
      data = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    }
    const idx = data.findIndex(u => u.name === candidate.name || (candidate.email && u.email === candidate.email));
    if (idx >= 0) {
      data[idx] = { ...data[idx], ...candidate, updatedAt: new Date().toISOString() };
    } else {
      data.push({ ...candidate, updatedAt: new Date().toISOString() });
    }
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error writing local JSON file:", e.message);
  }
}

export { isDbConfigured };
