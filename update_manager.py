with open('public/manager.html', 'rb') as f:
    html = f.read().decode('utf-8', errors='replace')

# 1. Update Title and Header
html = html.replace(
    '<title>ApniBus Manager Analytics Dashboard</title>',
    '<title>ApniBus Sales Admin Dashboard</title>'
)

html = html.replace(
    '<span>Manager Analytics &amp; Reporting Dashboard</span>',
    '<span>ApniBus Sales Admin Dashboard</span>'
)

# 2. Update status badge logic inside renderTable()
target_badge = '''        let badgeClass = "status-training";
        let statusLabel = "In Training";

        if (item.status === "COMPLETED") {
          badgeClass = "status-completed";
          statusLabel = "Field Ready";
        } else if (item.status === "FAILED") {
          badgeClass = "status-failed";
          statusLabel = "Retraining Req";
        }'''

replacement_badge = '''        let badgeClass = "status-training";
        let statusLabel = "In Training";

        if (item.trainingCompleted || item.status === "COMPLETED") {
          badgeClass = "status-completed";
          statusLabel = "TRAINING COMPLETE";
        } else if (item.status === "FAILED") {
          badgeClass = "status-failed";
          statusLabel = "Retraining Req";
        }'''

if target_badge in html:
    html = html.replace(target_badge, replacement_badge)
    print("Replaced status badge logic in manager.html!")

# 3. Remove duplicate TRAINING COMPLETE badge block if status is TRAINING COMPLETE
target_status_cell = '''              <strong style="font-size: 16px; color: ${item.score >= 80 ? 'var(--green)' : item.score > 0 ? 'var(--amber)' : '#fff'}">${item.score}%</strong>
              <div style="margin-top: 4px;"><span class="status-badge ${badgeClass}">${statusLabel}</span></div>
              ${item.trainingCompleted ? '<div style="margin-top: 4px;"><span class="status-badge status-completed">TRAINING COMPLETE</span></div>' : ''}'''

replacement_status_cell = '''              <strong style="font-size: 16px; color: ${item.score >= 80 ? 'var(--green)' : item.score > 0 ? 'var(--amber)' : '#fff'}">${item.score}%</strong>
              <div style="margin-top: 4px;"><span class="status-badge ${badgeClass}">${statusLabel}</span></div>'''

if target_status_cell in html:
    html = html.replace(target_status_cell, replacement_status_cell)
    print("Cleaned up status cell in manager.html!")

with open('public/manager.html', 'wb') as f:
    f.write(html.encode('utf-8'))

print("Updated manager.html!")
