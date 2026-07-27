html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ApniBus Sales Admin Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Archivo:wght@600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #070a12;
      --surface: #0f172a;
      --surface-glass: rgba(15, 23, 42, 0.75);
      --card-bg: rgba(30, 41, 59, 0.5);
      --card-border: rgba(255, 255, 255, 0.08);
      --line: #1e293b;
      --green: #10b981;
      --green-glow: rgba(16, 185, 129, 0.25);
      --amber: #f59e0b;
      --amber-glow: rgba(245, 158, 11, 0.25);
      --red: #ef4444;
      --red-glow: rgba(239, 68, 68, 0.25);
      --blue: #3b82f6;
      --blue-glow: rgba(59, 130, 246, 0.25);
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }

    * {
      box-sizing: border-box;
    }

    body {
      background-color: var(--bg);
      background-image: 
        radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.08) 0px, transparent 50%),
        radial-gradient(at 50% 100%, rgba(245, 158, 11, 0.04) 0px, transparent 50%);
      color: var(--text);
      font-family: 'Outfit', sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }

    header {
      width: 100%;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--card-border);
      padding: 18px 40px;
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-title {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-title img {
      height: 40px;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
    }

    .brand-title h1 {
      font-family: 'Archivo', sans-serif;
      font-size: 22px;
      font-weight: 800;
      margin: 0;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.3px;
    }

    .live-tag {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid var(--green);
      color: var(--green);
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .live-dot {
      width: 7px;
      height: 7px;
      background: var(--green);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--green);
      animation: pulse 1.8s infinite;
    }

    @keyframes pulse {
      0% { opacity: 0.4; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.15); }
      100% { opacity: 0.4; transform: scale(0.9); }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .btn {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 13.5px;
      border-radius: 10px;
      padding: 10px 20px;
      cursor: pointer;
      border: none;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #000;
      box-shadow: 0 4px 14px var(--green-glow);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--card-border);
      color: #fff;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .container {
      width: 100%;
      max-width: 1450px;
      padding: 30px 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 18px;
    }

    .stat-card {
      background: var(--surface-glass);
      backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 22px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 12px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-3px);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.1);
    }

    .stat-card.total::before { background: linear-gradient(90deg, #94a3b8, #cbd5e1); }
    .stat-card.ready::before { background: linear-gradient(90deg, #10b981, #34d399); }
    .stat-card.training::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .stat-card.failed::before { background: linear-gradient(90deg, #ef4444, #f87171); }
    .stat-card.completed::before { background: linear-gradient(90deg, #3b82f6, #60a5fa); }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-card .label {
      color: var(--text-muted);
      font-size: 13px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .stat-icon {
      font-size: 20px;
      opacity: 0.85;
    }

    .stat-card .val {
      font-family: 'Archivo', sans-serif;
      font-size: 34px;
      color: #fff;
      font-weight: 800;
      line-height: 1;
    }

    .stat-meta {
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Filter & Search Bar */
    .controls-bar {
      background: var(--surface-glass);
      backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 14px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
      max-width: 400px;
    }

    .search-box input {
      width: 100%;
      padding: 10px 16px 10px 40px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      color: #fff;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
    }

    .search-box input:focus {
      border-color: var(--blue);
      box-shadow: 0 0 0 3px var(--blue-glow);
    }

    .search-box::before {
      content: '🔍';
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      opacity: 0.6;
    }

    .filter-tabs {
      display: flex;
      gap: 8px;
      overflow-x: auto;
    }

    .tab-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .tab-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    .tab-btn.active {
      background: rgba(59, 130, 246, 0.15);
      border-color: var(--blue);
      color: #60a5fa;
    }

    /* Table Container */
    .table-container {
      background: var(--surface-glass);
      backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      min-width: 1150px;
    }

    th {
      background: rgba(30, 41, 59, 0.6);
      border-bottom: 1px solid var(--card-border);
      padding: 16px 20px;
      color: var(--text-muted);
      font-family: 'Archivo', sans-serif;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    td {
      padding: 18px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 14.5px;
      vertical-align: middle;
      transition: background 0.2s ease;
    }

    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    tr:last-child td {
      border-bottom: none;
    }

    .candidate-cell {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .avatar-circle {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: #fff;
      font-weight: 800;
      font-family: 'Archivo', sans-serif;
      display: grid;
      place-items: center;
      font-size: 15px;
      box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.1);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-completed {
      background: rgba(16, 185, 129, 0.12);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }

    .status-training {
      background: rgba(245, 158, 11, 0.12);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.4);
    }

    .status-failed {
      background: rgba(239, 68, 68, 0.12);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.4);
    }

    .choice-badge {
      background: rgba(255, 255, 255, 0.05);
      color: #e2e8f0;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: inline-block;
    }

    .choice-badge.empty {
      color: var(--text-muted);
      border-style: dashed;
      background: none;
    }

    .checklist-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .checklist-item.done {
      color: #34d399;
      background: rgba(16, 185, 129, 0.1);
    }

    .checklist-item.pending {
      color: var(--text-muted);
      opacity: 0.5;
    }

    .btn-action {
      padding: 7px 14px;
      font-size: 12px;
      border-radius: 8px;
      background: rgba(16, 185, 129, 0.12);
      color: var(--green);
      border: 1px solid var(--green);
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s;
    }

    .btn-action:hover {
      background: var(--green);
      color: #000;
      box-shadow: 0 4px 12px var(--green-glow);
    }

    .score-meter {
      width: 100px;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
      margin-top: 4px;
    }

    .score-meter-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.4s ease;
    }

    .empty-state {
      padding: 60px;
      text-align: center;
      color: var(--text-muted);
      font-size: 15px;
    }

    @media (max-width: 768px) {
      header { padding: 16px 20px; flex-direction: column; gap: 14px; align-items: flex-start; }
      .container { padding: 16px; }
      .controls-bar { flex-direction: column; align-items: stretch; }
      .search-box { max-width: 100%; }
    }
  </style>
</head>
<body>

<header>
  <div class="brand-title">
    <img src="logo.png" alt="ApniBus Logo" />
    <div>
      <h1>
        ApniBus Sales Admin Dashboard
        <span class="live-tag"><span class="live-dot"></span> Live Sync</span>
      </h1>
    </div>
  </div>
  <div class="header-actions">
    <button class="btn btn-secondary" id="refreshBtn">🔄 Refresh</button>
    <a href="/api/download-csv" class="btn btn-primary" id="downloadBtn">📥 Export CSV Report</a>
  </div>
</header>

<div class="container">
  <!-- Stats Row -->
  <div class="stats-row">
    <div class="stat-card total">
      <div class="stat-header">
        <span class="label">Total BD Candidates</span>
        <span class="stat-icon">👥</span>
      </div>
      <div class="val" id="statTotal">0</div>
      <div class="stat-meta">Enrolled in Sales Academy</div>
    </div>
    <div class="stat-card completed">
      <div class="stat-header">
        <span class="label" style="color: #60a5fa;">Training Completed</span>
        <span class="stat-icon">🎯</span>
      </div>
      <div class="val" id="statCompleted" style="color: #60a5fa;">0</div>
      <div class="stat-meta">Finished 6-Phase Curriculum</div>
    </div>
    <div class="stat-card ready">
      <div class="stat-header">
        <span class="label" style="color: var(--green);">Field Ready (Certified)</span>
        <span class="stat-icon">🏆</span>
      </div>
      <div class="val" id="statReady" style="color: var(--green);">0</div>
      <div class="stat-meta">Readiness Score 80%+</div>
    </div>
    <div class="stat-card training">
      <div class="stat-header">
        <span class="label" style="color: var(--amber);">In Training</span>
        <span class="stat-icon">⏳</span>
      </div>
      <div class="val" id="statTraining" style="color: var(--amber);">0</div>
      <div class="stat-meta">Active Module Progression</div>
    </div>
    <div class="stat-card failed">
      <div class="stat-header">
        <span class="label" style="color: var(--red);">Retraining Needed</span>
        <span class="stat-icon">⚠️</span>
      </div>
      <div class="val" id="statFailed" style="color: var(--red);">0</div>
      <div class="stat-meta">Score below threshold</div>
    </div>
  </div>

  <!-- Search & Filter Controls -->
  <div class="controls-bar">
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="Search candidate by name or district..." />
    </div>
    <div class="filter-tabs" id="filterTabs">
      <button class="tab-btn active" data-filter="all">All Candidates</button>
      <button class="tab-btn" data-filter="completed">Completed</button>
      <button class="tab-btn" data-filter="ready">Field Ready</button>
      <button class="tab-btn" data-filter="training">In Training</button>
      <button class="tab-btn" data-filter="failed">Retraining Req</button>
    </div>
  </div>

  <!-- Table Container -->
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Candidate Name</th>
          <th>Demographics</th>
          <th>Readiness Score</th>
          <th>Video Quiz</th>
          <th>Q&amp;A Score</th>
          <th>Policy Choices</th>
          <th>Grooming Checklist</th>
          <th>Weak Areas</th>
          <th>Last Update</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="resultsTableBody">
        <tr>
          <td colspan="10" class="empty-state">Loading candidate analytics data...</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<script>
  const resultsTableBody = document.getElementById("resultsTableBody");
  const refreshBtn = document.getElementById("refreshBtn");
  const searchInput = document.getElementById("searchInput");

  const statTotal = document.getElementById("statTotal");
  const statReady = document.getElementById("statReady");
  const statTraining = document.getElementById("statTraining");
  const statFailed = document.getElementById("statFailed");
  const statCompleted = document.getElementById("statCompleted");

  let allData = [];
  let currentFilter = "all";

  async function loadResults() {
    try {
      const res = await fetch("/api/results");
      allData = await res.json();
      renderData();
    } catch (e) {
      resultsTableBody.innerHTML = `<tr><td colspan="10" class="empty-state" style="color: var(--red);">Error connecting to sync engine on server.</td></tr>`;
    }
  }

  function getInitials(name) {
    if (!name) return "BD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  function renderData() {
    if (!allData || allData.length === 0) {
      resultsTableBody.innerHTML = `<tr><td colspan="10" class="empty-state">No candidate registration or scores synchronized yet.</td></tr>`;
      updateStats([]);
      return;
    }

    const searchTerm = (searchInput.value || "").toLowerCase().trim();

    const filtered = allData.filter(item => {
      const nameMatch = (item.name || "").toLowerCase().includes(searchTerm) ||
                        (item.location || "").toLowerCase().includes(searchTerm);

      if (!nameMatch) return false;

      if (currentFilter === "completed") return item.trainingCompleted === true;
      if (currentFilter === "ready") return item.status === "COMPLETED";
      if (currentFilter === "training") return (!item.trainingCompleted && item.status !== "COMPLETED" && item.status !== "FAILED");
      if (currentFilter === "failed") return item.status === "FAILED";
      return true;
    });

    if (filtered.length === 0) {
      resultsTableBody.innerHTML = `<tr><td colspan="10" class="empty-state">No matching candidates found for search/filter criteria.</td></tr>`;
      updateStats(allData);
      return;
    }

    resultsTableBody.innerHTML = filtered.map(item => {
      let badgeClass = "status-training";
      let statusLabel = "In Training";

      if (item.trainingCompleted || item.status === "COMPLETED") {
        badgeClass = "status-completed";
        statusLabel = "TRAINING COMPLETE";
      } else if (item.status === "FAILED") {
        badgeClass = "status-failed";
        statusLabel = "Retraining Req";
      }

      const choices = item.choices || { attendance: "", employment: "", incentive: "" };
      const att = item.attemptedGrooming || { deepDive: false, objection: false, roleplay: false, pitchCorrection: false };
      const videoScore = item.videoCorrectCount || 0;
      const qaScore = item.qaCorrectCount || 0;
      const scoreVal = item.score || 0;

      const meterColor = scoreVal >= 80 ? '#10b981' : scoreVal > 0 ? '#f59e0b' : '#94a3b8';

      const weakTags = (item.weakAreas || [])
        .map(w => `<span style="background: rgba(239, 68, 68, 0.15); color: #f87171; padding: 2px 8px; border-radius: 6px; font-size: 11px; margin-right: 4px; font-weight: 600; border: 1px solid rgba(239, 68, 68, 0.3); display: inline-block; margin-bottom: 2px;">${w}</span>`)
        .join("");

      const formattedDate = new Date(item.updatedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

      return `
        <tr>
          <td>
            <div class="candidate-cell">
              <div class="avatar-circle">${getInitials(item.name)}</div>
              <div>
                <strong style="color: #fff; font-size: 15px; display: block;">${item.name || "N/A"}</strong>
                <span style="font-size: 12.5px; color: var(--text-muted);">📍 ${item.location || "N/A"}</span>
              </div>
            </div>
          </td>
          <td style="font-size: 13px; color: var(--text-muted);">
            ${item.age ? `Age: <b style="color:#fff;">${item.age}</b>` : "Age: N/A"}<br>
            ${item.gender ? `Gender: <b style="color:#fff;">${item.gender}</b>` : "Gender: N/A"}
          </td>
          <td>
            <strong style="font-size: 16px; color: ${meterColor}; font-family: 'Archivo', sans-serif;">${scoreVal}%</strong>
            <div class="score-meter">
              <div class="score-meter-fill" style="width: ${Math.min(scoreVal, 100)}%; background: ${meterColor};"></div>
            </div>
            <div style="margin-top: 6px;"><span class="status-badge ${badgeClass}">${statusLabel}</span></div>
          </td>
          <td>
            <strong style="font-size: 15px; font-family: 'Archivo', sans-serif; color: ${videoScore === 8 ? 'var(--green)' : videoScore > 0 ? 'var(--amber)' : 'var(--text-muted)'}">${videoScore}/8</strong>
          </td>
          <td>
            <strong style="font-size: 15px; font-family: 'Archivo', sans-serif; color: ${qaScore === 6 ? 'var(--green)' : qaScore > 0 ? 'var(--amber)' : 'var(--text-muted)'}">${qaScore}/6</strong>
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11.5px;">
              <span>Att: ${choices.attendance ? `<span class="choice-badge">${choices.attendance}</span>` : '<span class="choice-badge empty">None</span>'}</span>
              <span>Emp: ${choices.employment ? `<span class="choice-badge">${choices.employment}</span>` : '<span class="choice-badge empty">None</span>'}</span>
              <span>Inc: ${choices.incentive ? `<span class="choice-badge">${choices.incentive}</span>` : '<span class="choice-badge empty">None</span>'}</span>
            </div>
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 3px;">
              <span class="checklist-item ${att.deepDive ? 'done' : 'pending'}">${att.deepDive ? '✓' : '✗'} Deep-Dive</span>
              <span class="checklist-item ${att.objection ? 'done' : 'pending'}">${att.objection ? '✓' : '✗'} Objection</span>
              <span class="checklist-item ${att.roleplay ? 'done' : 'pending'}">${att.roleplay ? '✓' : '✗'} Roleplay</span>
              <span class="checklist-item ${att.pitchCorrection ? 'done' : 'pending'}">${att.pitchCorrection ? '✓' : '✗'} Pitch Fix</span>
            </div>
          </td>
          <td>${weakTags || '<span style="color: var(--text-muted); font-size: 12px;">None</span>'}</td>
          <td style="font-size: 12px; color: var(--text-muted);">${formattedDate}</td>
          <td>
            ${item.messages && item.messages.length > 0 
              ? `<a href="/api/download-chat?name=${encodeURIComponent(item.name)}" class="btn-action" title="Download Chat History CSV">📥 Chats</a>`
              : '<span style="color: var(--text-muted); font-size: 11px;">No chats</span>'}
          </td>
        </tr>
      `;
    }).join("");

    updateStats(allData);
  }

  function updateStats(data) {
    const total = data.length;
    const ready = data.filter(d => d.status === "COMPLETED").length;
    const training = data.filter(d => (!d.trainingCompleted && d.status !== "COMPLETED" && d.status !== "FAILED")).length;
    const failed = data.filter(d => d.status === "FAILED").length;
    const completed = data.filter(d => d.trainingCompleted === true).length;

    statTotal.textContent = total;
    statReady.textContent = ready;
    statTraining.textContent = training;
    statFailed.textContent = failed;
    statCompleted.textContent = completed;
  }

  // Filter Tabs Wiring
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderData();
    };
  });

  searchInput.oninput = renderData;
  refreshBtn.onclick = loadResults;
  window.onload = loadResults;
</script>
</body>
</html>
'''

with open('public/manager.html', 'wb') as f:
    f.write(html_content.encode('utf-8'))

print("Updated manager.html with premium UI design!")
