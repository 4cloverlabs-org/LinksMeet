import sys

with open('src/pages/CrmDashboard.css', 'r', encoding='utf-8') as f:
    txt = f.read()

old_css = """.crm-nav-item {
  display: flex; align-items: center; gap: 11px;
  width: 100%; text-align: left;
  padding: 9px 11px; margin-bottom: 2px;
  border: none; background: none; cursor: pointer;
  border-radius: 9px; font-size: 0.86rem; font-weight: 500;
  color: var(--text); transition: all 0.15s ease;
}
.crm-nav-item:hover { background: #f6f6fa; color: var(--ink); }
.crm-nav-item.active {
  background: var(--ac-soft); color: var(--ac); font-weight: 500;
}"""

new_css = """.crm-nav-item {
  display: flex; align-items: center; gap: 14px;
  width: 100%; text-align: left;
  padding: 12px 14px; margin-bottom: 4px;
  border: none; background: none; cursor: pointer;
  border-radius: 12px; font-size: 0.95rem; font-weight: 500;
  color: var(--text); transition: all 0.15s ease;
}
.crm-nav-item:hover { background: #E9E9F0; color: var(--ink); }
.crm-nav-item.active {
  background: var(--ac); color: #fff; font-weight: 500;
}"""

txt = txt.replace(old_css, new_css)

with open('src/pages/CrmDashboard.css', 'w', encoding='utf-8') as f:
    f.write(txt)
