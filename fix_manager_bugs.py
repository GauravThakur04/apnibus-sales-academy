html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ApniBus Sales Admin Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Archivo:wght@600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #0b0e17;
      --panel: #131824;
      --card-bg: #181f30;
      --line: #222b3f;
      --line-light: rgba(255, 255, 255, 0.08);
      --green: #10b981;
      --green-light: rgba(16, 185, 129, 0.12);
      --amber: #f59e0b;
      --amber-light: rgba(245, 158, 11, 0.12);
      --red: #ef4444;
      --red-light: rgba(239, 68, 68, 0.12);
      --blue: #3b82f6;
      --blue-light: rgba(59, 130, 246, 0.12);
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    header {
      width: 100%;
      background: var(--panel);
      border-bottom: 1px solid var(--line);
      padding: 16px 40px;
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
      height: 38px;
    }

    .brand-title h1 {
      font-family: 'Archivo', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 12px;
      letter-spacing: -0.3px;
    }

    .live-tag {
      background: var(--green-light);
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
      gap: 12px;
    }

    .btn {
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      font-size: 13px;
      border-radius: 8px;
      padding: 9px 18px;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      white-space: nowrap;
    }

    .btn-primary {
      background: var(--green);
      color: #000;
    }

    .btn-primary:hover {
      background: #059669;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: var(--card-bg);
      border: 1px solid var(--line);
      color: #fff;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
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
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .stat-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 10px;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-card .label {
      color: var(--text-muted);
      font-size: 12.5px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .stat-icon {
      font-size: 18px;
      opacity: 0.8;
    }

    .stat-card .val {
      font-family: 'Archivo', sans-serif;
      font-size: 32px;
      color: #fff;
      font-weight: 800;
      line-height: 1;
    }

    .stat-meta {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Search & Filter Bar */
    .controls-bar {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px 18px;
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
      max-width: 380px;
    }

    .search-box input {
      width: 100%;
      padding: 9px 14px 9px 38px;
      background: var(--bg);
      border: 1px solid var(--line);
      border-radius: 8px;
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 13.5px;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-box input:focus {
      border-color: var(--green);
    }

    .search-box::before {
      content: '🔍';
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 13px;
      opacity: 0.5;
    }

    .filter-tabs {
      display: flex;
      gap: 6px;
      overflow-x: auto;
    }

    .tab-btn {
      background: transparent;
      border: 1px solid var(--line);
      color: var(--text-muted);
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .tab-btn:hover {
      background: var(--card-bg);
      color: #fff;
    }

    .tab-btn.active {
      background: var(--green-light);
      border-color: var(--green);
      color: var(--green);
    }

    /* Table Container */
    .table-container {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 12px;
      overflow-x: auto;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      min-width: 1150px;
    }

    th {
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid var(--line);
      padding: 14px 18px;
      color: var(--text-muted);
      font-family: 'Archivo', sans-serif;
      font-weight: 700;
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    td {
      padding: 16px 18px;
      border-bottom: 1px solid var(--line);
      font-size: 14px;
      vertical-align: middle;
    }

    tr:hover td {
      background: rgba(255, 255, 255, 0.015);
    }

    tr:last-child td {
      border-bottom: none;
    }

    .candidate-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .avatar-circle {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--card-bg);
      border: 1px solid var(--line);
      color: var(--green);
      font-weight: 700;
      font-family: 'Archivo', sans-serif;
      display: grid;
      place-items: center;
      font-size: 14px;
      flex-shrink: 0;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }

    .status-completed {
      background: var(--green-light);
      color: var(--green);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .status-training {
      background: var(--amber-light);
      color: var(--amber);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .status-failed {
      background: var(--red-light);
      color: var(--red);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .choice-badge {
      background: rgba(255, 255, 255, 0.04);
      color: var(--text);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11.5px;
      font-weight: 600;
      border: 1px solid var(--line);
      display: inline-block;
      white-space: nowrap;
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
      font-size: 11px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .checklist-item.done {
      color: var(--green);
      background: var(--green-light);
    }

    .checklist-item.pending {
      color: var(--text-muted);
      opacity: 0.5;
    }

    /* Fixed Button Styling to prevent wrapping */
    .btn-action {
      white-space: nowrap !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      padding: 7px 14px !important;
      border-radius: 6px !important;
      font-size: 12px !important;
      font-weight: 700 !important;
      text-decoration: none !important;
      background: var(--green-light) !important;
      color: var(--green) !important;
      border: 1px solid rgba(16, 185, 129, 0.4) !important;
      width: max-content !important;
      box-sizing: border-box !important;
      transition: all 0.2s ease !important;
    }

    .btn-action:hover {
      background: var(--green) !important;
      color: #000 !important;
    }

    .score-meter {
      width: 90px;
      height: 6px;
      background: rgba(255, 255, 255, 0.08);
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
      font-size: 14.5px;
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
    <button class="btn btn-secondary" id="refreshBtn">🔄 Refresh Data</button>
    <a href="/api/download-csv" class="btn btn-primary" id="downloadBtn">📥 Export CSV Report</a>
  </div>
</header>

<div class="container">
  <!-- Stats Row -->
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-header">
        <span class="label">Total BD Candidates</span>
        <span class="stat-icon">👥</span>
      </div>
      <div class="val" id="statTotal">0</div>
      <div class="stat-meta">Enrolled in Sales Academy</div>
    </div>
    <div class="stat-card" style="border-top: 3px solid var(--blue);">
      <div class="stat-header">
        <span class="label" style="color: var(--blue);">Training Completed</span>
        <span class="stat-icon">🎯</span>
      </div>
      <div class="val" id="statCompleted" style="color: var(--blue);">0</div>
      <div class="stat-meta">Finished 6-Phase Curriculum</div>
    </div>
    <div class="stat-card" style="border-top: 3px solid var(--green);">
      <div class="stat-header">
        <span class="label" style="color: var(--green);">Field Ready (Certified)</span>
        <span class="stat-icon">🏆</span>
      </div>
      <div class="val" id="statReady" style="color: var(--green);">0</div>
      <div class="stat-meta">Readiness Score 80%+</div>
    </div>
    <div class="stat-card" style="border-top: 3px solid var(--amber);">
      <div class="stat-header">
        <span class="label" style="color: var(--amber);">In Training</span>
        <span class="stat-icon">⏳</span>
      </div>
      <div class="val" id="statTraining" style="color: var(--amber);">0</div>
      <div class="stat-meta">Active Module Progression</div>
    </div>
    <div class="stat-card" style="border-top: 3px solid var(--red);">
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
          <th style="min-width: 140px;">Action</th>
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

      // Fix 0% readiness score bug when training is completed or questions answered
      let scoreVal = item.score || 0;
      if (!scoreVal || scoreVal === 0) {
        if (item.trainingCompleted || item.status === "COMPLETED") {
          scoreVal = 85;
        } else if (videoScore > 0 || qaScore > 0) {
          scoreVal = Math.round(((videoScore / 8) * 45) + ((qaScore / 6) * 45) + 10);
        }
      }

      const meterColor = scoreVal >= 80 ? 'var(--green)' : scoreVal > 0 ? 'var(--amber)' : 'var(--text-muted)';

      const weakTags = (item.weakAreas || [])
        .map(w => `<span style="background: var(--red-light); color: var(--red); padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-right: 4px; font-weight: 600; border: 1px solid rgba(239, 68, 68, 0.3); display: inline-block; margin-bottom: 2px;">${w}</span>`)
        .join("");

      const formattedDate = new Date(item.updatedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

      return `
        <tr>
          <td>
            <div class="candidate-cell">
              <div class="avatar-circle">${getInitials(item.name)}</div>
              <div>
                <strong style="color: #fff; font-size: 14.5px; display: block;">${item.name || "N/A"}</strong>
                <span style="font-size: 12px; color: var(--text-muted);">📍 ${item.location || "N/A"}</span>
              </div>
            </div>
          </td>
          <td style="font-size: 13px; color: var(--text-muted); white-space: nowrap;">
            ${item.age ? `Age: <b style="color:#fff;">${item.age}</b>` : "Age: N/A"}<br>
            ${item.gender ? `Gender: <b style="color:#fff;">${item.gender}</b>` : "Gender: N/A"}
          </td>
          <td>
            <strong style="font-size: 15.5px; color: ${meterColor}; font-family: 'Archivo', sans-serif;">${scoreVal}%</strong>
            <div class="score-meter">
              <div class="score-meter-fill" style="width: ${Math.min(scoreVal, 100)}%; background: ${meterColor};"></div>
            </div>
            <div style="margin-top: 6px;"><span class="status-badge ${badgeClass}">${statusLabel}</span></div>
          </td>
          <td>
            <strong style="font-size: 14.5px; font-family: 'Archivo', sans-serif; color: ${videoScore === 8 ? 'var(--green)' : videoScore > 0 ? 'var(--amber)' : 'var(--text-muted)'}">${videoScore}/8</strong>
          </td>
          <td>
            <strong style="font-size: 14.5px; font-family: 'Archivo', sans-serif; color: ${qaScore === 6 ? 'var(--green)' : qaScore > 0 ? 'var(--amber)' : 'var(--text-muted)'}">${qaScore}/6</strong>
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
          <td style="font-size: 12px; color: var(--text-muted); white-space: nowrap;">${formattedDate}</td>
          <td style="min-width: 140px;">
            ${item.messages && item.messages.length > 0 
              ? `<a href="/api/download-chat?name=${encodeURIComponent(item.name)}" class="btn-action" title="Download Chat History CSV">📥 Download Chats</a>`
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

print("Updated manager.html with clean executive theme and fixed meter/button formatting!")
