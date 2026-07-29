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
    // Table storing Candidate name, mail, Readiness Score, Video Quiz, Q&A Score, Grooming Checklist, Weak Areas, Messages, Last Update, certificate_id, certificate
    const createCertificatesTableQuery = `
      CREATE TABLE IF NOT EXISTS training_certificates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mail VARCHAR(255) UNIQUE NOT NULL,
        readiness_score INT DEFAULT 0,
        video_quiz VARCHAR(50) DEFAULT '0/8',
        qa_score VARCHAR(50) DEFAULT '0/6',
        grooming_checklist JSONB DEFAULT '{}'::jsonb,
        weak_areas JSONB DEFAULT '[]'::jsonb,
        messages JSONB DEFAULT '[]'::jsonb,
        certificate_id VARCHAR(100),
        certificate TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        last_update TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE training_certificates DROP CONSTRAINT IF EXISTS training_certificates_certificate_id_key;
      ALTER TABLE training_certificates ADD COLUMN IF NOT EXISTS readiness_score INT DEFAULT 0;
      ALTER TABLE training_certificates ADD COLUMN IF NOT EXISTS video_quiz VARCHAR(50) DEFAULT '0/8';
      ALTER TABLE training_certificates ADD COLUMN IF NOT EXISTS qa_score VARCHAR(50) DEFAULT '0/6';
      ALTER TABLE training_certificates ADD COLUMN IF NOT EXISTS grooming_checklist JSONB DEFAULT '{}'::jsonb;
      ALTER TABLE training_certificates ADD COLUMN IF NOT EXISTS weak_areas JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE training_certificates ADD COLUMN IF NOT EXISTS messages JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE training_certificates ADD COLUMN IF NOT EXISTS last_update TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
      CREATE INDEX IF NOT EXISTS idx_training_certificates_mail ON training_certificates(mail);
      CREATE INDEX IF NOT EXISTS idx_training_certificates_cert_id ON training_certificates(certificate_id);
    `;

    // Secondary progression table
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
    console.log("✅ PostgreSQL table 'training_certificates' initialized successfully on Azure!");
    return true;
  } catch (err) {
    console.error("❌ Failed to initialize PostgreSQL table:", err.message);
    return false;
  }
}

// Save specifically to training_certificates table
export async function saveCertificateRecord(candidate) {
  if (!candidate || !candidate.name) return;

  const mailKey = candidate.mail || candidate.email || (candidate.name.toLowerCase().replace(/\s+/g, '_') + "@apnibus.com");
  const certId = candidate.certificateId || ("CERT-AB-" + (candidate.name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'BD') + "-" + Math.random().toString(36).substring(2, 8).toUpperCase());

  const vQuizStr = typeof candidate.video_quiz === 'string' ? candidate.video_quiz : `${candidate.videoCorrectCount || 0}/8`;
  const qScoreStr = typeof candidate.qa_score === 'string' ? candidate.qa_score : `${candidate.qaCorrectCount || 0}/6`;
  const scoreVal = Number(candidate.readiness_score) || Number(candidate.score) || 0;

  const groomingData = candidate.attemptedGrooming || candidate.grooming_checklist || { deepDive: false, objection: false, roleplay: false, pitchCorrection: false };
  const weakData = candidate.weakAreas || candidate.weak_areas || [];
  const msgsData = candidate.messages || [];

  if (pool) {
    try {
      const query = `
        INSERT INTO training_certificates (
          name, mail, readiness_score, video_quiz, qa_score,
          grooming_checklist, weak_areas, messages, certificate_id, certificate, last_update
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP
        )
        ON CONFLICT (mail) DO UPDATE SET
          name = EXCLUDED.name,
          readiness_score = GREATEST(training_certificates.readiness_score, EXCLUDED.readiness_score),
          video_quiz = CASE WHEN EXCLUDED.video_quiz = '0/8' AND training_certificates.video_quiz IS NOT NULL AND training_certificates.video_quiz != '0/8' THEN training_certificates.video_quiz ELSE EXCLUDED.video_quiz END,
          qa_score = CASE WHEN EXCLUDED.qa_score = '0/6' AND training_certificates.qa_score IS NOT NULL AND training_certificates.qa_score != '0/6' THEN training_certificates.qa_score ELSE EXCLUDED.qa_score END,
          grooming_checklist = CASE WHEN (EXCLUDED.grooming_checklist = '{}'::jsonb OR EXCLUDED.grooming_checklist = '{"deepDive": false, "objection": false, "roleplay": false, "pitchCorrection": false}'::jsonb) AND training_certificates.grooming_checklist IS NOT NULL THEN training_certificates.grooming_checklist ELSE EXCLUDED.grooming_checklist END,
          weak_areas = CASE WHEN jsonb_array_length(EXCLUDED.weak_areas) = 0 THEN training_certificates.weak_areas ELSE EXCLUDED.weak_areas END,
          messages = CASE WHEN jsonb_array_length(EXCLUDED.messages) = 0 THEN training_certificates.messages ELSE EXCLUDED.messages END,
          certificate_id = COALESCE(training_certificates.certificate_id, EXCLUDED.certificate_id),
          certificate = EXCLUDED.certificate,
          last_update = CURRENT_TIMESTAMP;
      `;
      await pool.query(query, [
        candidate.name,
        mailKey,
        scoreVal,
        vQuizStr,
        qScoreStr,
        JSON.stringify(groomingData),
        JSON.stringify(weakData),
        JSON.stringify(msgsData),
        certId,
        candidate.certificate || candidate.certificateHtml || (scoreVal >= 80 ? "FIELD READY 🎉" : "IN TRAINING")
      ]);
      console.log(`✅ Saved record to 'training_certificates' table for: ${candidate.name} (${mailKey})`);
    } catch (err) {
      console.error("Error saving to training_certificates table:", err.message);
    }
  }
}

// Get all candidates (fetches from training_certificates primary table & deduplicates by candidate name)
export async function getAllCandidates() {
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM training_certificates ORDER BY last_update DESC');
      let candidates = res.rows.map(rowToCandidate);

      if (candidates.length === 0) {
        const altRes = await pool.query('SELECT * FROM training_candidates ORDER BY updated_at DESC');
        candidates = altRes.rows.map(rowToCandidate);
      }

      // Deduplicate by lowercased candidate name so duplicates are collapsed and highest scores are shown
      const candidateMap = new Map();
      for (const cand of candidates) {
        const key = (cand.name || "").toLowerCase().trim();
        if (!key) continue;
        if (!candidateMap.has(key)) {
          candidateMap.set(key, cand);
        } else {
          const existing = candidateMap.get(key);
          const candProgress = cand.score + (cand.videoCorrectCount * 5) + (cand.qaCorrectCount * 5);
          const existingProgress = existing.score + (existing.videoCorrectCount * 5) + (existing.qaCorrectCount * 5);
          if (candProgress > existingProgress) {
            candidateMap.set(key, cand);
          }
        }
      }
      return Array.from(candidateMap.values());
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

// Save or Update candidate in training_certificates and training_candidates
export async function saveCandidate(candidate) {
  if (!candidate || !candidate.name) return;

  const rawEmail = candidate.email || candidate.mail || (candidate.name.toLowerCase().replace(/\s+/g, '_') + "@apnibus.com");

  // Save to training_certificates table (Primary metric table)
  await saveCertificateRecord({
    ...candidate,
    mail: rawEmail
  });

  // If DB is NOT connected, use local file fallback
  if (!pool) {
    saveToJsonFile(candidate);
    return;
  }

  try {
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
      candidate.status || (candidate.score >= 80 || candidate.trainingCompleted ? 'COMPLETED' : 'IN_TRAINING'),
      candidate.score || candidate.readiness_score || 0,
      candidate.verdict || 'NOT YET CERTIFIED',
      Boolean(candidate.trainingCompleted || candidate.status === 'COMPLETED'),
      candidate.stepIndex || 0,
      candidate.videoCorrectCount || 0,
      candidate.qaCorrectCount || 0,
      JSON.stringify(candidate.weakAreas || []),
      JSON.stringify(candidate.choices || {}),
      JSON.stringify(candidate.attemptedGrooming || {}),
      JSON.stringify(candidate.qaChoices || {}),
      JSON.stringify(candidate.messages || []),
      candidate.certificateId || null,
      candidate.certificateIssuedAt ? new Date(candidate.certificateIssuedAt) : new Date()
    ];

    await pool.query(query, values);
  } catch (err) {
    console.error("Error saving candidate to PostgreSQL:", err.message);
  }
}

function safeParseJson(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
}

// Convert DB row format back to candidate app format
function rowToCandidate(row) {
  const vQuizRaw = row.video_quiz || `${row.video_correct_count || 0}/8`;
  const qScoreRaw = row.qa_score || `${row.qa_correct_count || 0}/6`;
  const vCount = parseInt(vQuizRaw.split('/')[0], 10) || Number(row.video_correct_count) || 0;
  const qCount = parseInt(qScoreRaw.split('/')[0], 10) || Number(row.qa_correct_count) || 0;

  return {
    name: row.name,
    email: row.mail || row.email,
    location: row.location || 'Field',
    status: row.status || (Number(row.readiness_score || row.score) >= 80 ? 'COMPLETED' : 'IN_TRAINING'),
    score: Number(row.readiness_score !== undefined ? row.readiness_score : row.score) || 0,
    verdict: row.verdict || (Number(row.readiness_score || row.score) >= 80 ? 'FIELD READY 🎉' : 'IN TRAINING'),
    trainingCompleted: Boolean(row.training_completed || row.status === 'COMPLETED' || Number(row.readiness_score || row.score) >= 80),
    stepIndex: Number(row.step_index) || 0,
    videoCorrectCount: vCount,
    qaCorrectCount: qCount,
    weakAreas: safeParseJson(row.weak_areas, []),
    choices: safeParseJson(row.choices, {}),
    attemptedGrooming: safeParseJson(row.grooming_checklist || row.attempted_grooming, {}),
    qaChoices: safeParseJson(row.qa_choices, {}),
    messages: safeParseJson(row.messages, []),
    certificateId: row.certificate_id,
    certificateIssuedAt: row.last_update || row.created_at || row.updated_at,
    updatedAt: row.last_update || row.updated_at || new Date().toISOString()
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
