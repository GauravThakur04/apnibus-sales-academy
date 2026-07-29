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

// Ensure database tables exist
export async function initDb() {
  if (!pool) {
    console.log("ℹ️ PostgreSQL credentials incomplete or placeholders detected. Using local JSON fallback.");
    return false;
  }

  try {
    // 1. Table storing ONLY name, mail, certificate_id, certificate
    const createCertificatesTableQuery = `
      CREATE TABLE IF NOT EXISTS training_certificates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mail VARCHAR(255) UNIQUE NOT NULL,
        certificate_id VARCHAR(100) UNIQUE NOT NULL,
        certificate TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_training_certificates_mail ON training_certificates(mail);
      CREATE INDEX IF NOT EXISTS idx_training_certificates_cert_id ON training_certificates(certificate_id);
    `;

    // 2. Full candidates progression table
    const createCandidatesTableQuery = `
      CREATE TABLE IF NOT EXISTS training_candidates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
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
      ALTER TABLE training_candidates DROP COLUMN IF EXISTS gender;
      ALTER TABLE training_candidates DROP COLUMN IF EXISTS age;
      CREATE INDEX IF NOT EXISTS idx_training_candidates_email ON training_candidates(email);
      CREATE INDEX IF NOT EXISTS idx_training_candidates_name ON training_candidates(name);
    `;

    await pool.query(createCertificatesTableQuery);
    await pool.query(createCandidatesTableQuery);
    console.log("✅ PostgreSQL tables 'training_certificates' and 'training_candidates' initialized successfully on Azure!");
    return true;
  } catch (err) {
    console.error("❌ Failed to initialize PostgreSQL tables:", err.message);
    return false;
  }
}

// Save specifically to training_certificates table (name, mail, certificate_id, certificate)
export async function saveCertificateRecord({ name, mail, certificateId, certificate }) {
  if (!name || !certificateId) return;

  const mailKey = mail || (name.toLowerCase().replace(/\s+/g, '_') + "@apnibus.com");

  if (pool) {
    try {
      const query = `
        INSERT INTO training_certificates (name, mail, certificate_id, certificate, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (mail) DO UPDATE SET
          name = EXCLUDED.name,
          certificate_id = EXCLUDED.certificate_id,
          certificate = EXCLUDED.certificate,
          updated_at = CURRENT_TIMESTAMP;
      `;
      await pool.query(query, [name, mailKey, certificateId, certificate || "FIELD READY"]);
      console.log(`✅ Saved record to 'training_certificates' table for: ${name} (${mailKey})`);
    } catch (err) {
      console.error("Error saving to training_certificates table:", err.message);
    }
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

// Save or Update candidate in training_candidates and training_certificates
export async function saveCandidate(candidate) {
  if (!candidate || !candidate.name) return;

  const rawEmail = candidate.email || (candidate.name.toLowerCase().replace(/\s+/g, '_') + "@apnibus.com");
  const certId = candidate.certificateId || ("CERT-AB-" + (candidate.name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'BD') + "-" + Math.random().toString(36).substring(2, 8).toUpperCase());

  // Save to training_certificates table
  await saveCertificateRecord({
    name: candidate.name,
    mail: rawEmail,
    certificateId: certId,
    certificate: candidate.certificateHtml || (candidate.trainingCompleted || candidate.status === "COMPLETED" ? "FIELD READY" : "IN TRAINING")
  });

  // If DB is NOT connected, use local file fallback
  if (!pool) {
    saveToJsonFile(candidate);
    return;
  }

  try {
    // 1. Check if candidate exists by email or name to prevent email mismatch duplicates
    const checkRes = await pool.query(
      'SELECT email FROM training_candidates WHERE LOWER(name) = LOWER($1) OR LOWER(email) = LOWER($2) LIMIT 1',
      [candidate.name, rawEmail]
    );

    const emailKey = (checkRes.rows.length > 0 && checkRes.rows[0].email) ? checkRes.rows[0].email : rawEmail;

    const query = `
      INSERT INTO training_candidates (
        name, email, location, status, score, verdict,
        training_completed, step_index, video_correct_count, qa_correct_count,
        weak_areas, choices, attempted_grooming, qa_choices, messages,
        certificate_id, certificate_issued_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
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

    const values = [
      candidate.name,
      emailKey,
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
      candidate.certificateId || certId,
      candidate.certificateIssuedAt ? new Date(candidate.certificateIssuedAt) : new Date()
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
