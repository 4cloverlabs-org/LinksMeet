import sys

with open('src/pages/CrmDashboard.css', 'r', encoding='utf-8') as f:
    txt = f.read()

# Update .crm-kpi
old_kpi = """.crm-kpi {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; padding: 20px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}"""

new_kpi = """.crm-kpi {
  background: #fff; border: 1px solid #ebebeb;
  border-radius: 16px; padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}"""
txt = txt.replace(old_kpi, new_kpi)

# Update .crm-card
old_card = """.crm-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; display: flex; flex-direction: column; overflow: hidden;
}"""

new_card = """.crm-card {
  background: #fff; border: 1px solid #ebebeb;
  border-radius: 16px; display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}"""
txt = txt.replace(old_card, new_card)

# Update table headers to have a light grey background like the image
old_th = """.crm-table th {
  padding: 14px 18px; font-weight: 500; color: var(--muted);
  border-bottom: 1px solid var(--border); text-align: left;
}"""

new_th = """.crm-table th {
  padding: 14px 18px; font-weight: 500; color: var(--muted);
  background: #f9f9fb; border-bottom: 1px solid var(--border); text-align: left;
}
.crm-table th:first-child { border-top-left-radius: 10px; border-bottom-left-radius: 10px; }
.crm-table th:last-child { border-top-right-radius: 10px; border-bottom-right-radius: 10px; }"""
txt = txt.replace(old_th, new_th)

with open('src/pages/CrmDashboard.css', 'w', encoding='utf-8') as f:
    f.write(txt)
