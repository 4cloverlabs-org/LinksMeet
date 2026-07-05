import sys

css = """
/* Global Search Dropdown */
.crm-search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 400px;
  max-width: 90vw;
  background: #FFFFFF;
  border: 2px solid #F5F5F5;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.06);
  z-index: 999;
  overflow: hidden;
  animation: crmFade 0.15s ease;
}
.crm-search-section {
  border-bottom: 2px solid #F5F5F5;
}
.crm-search-section:last-child {
  border-bottom: none;
}
.crm-search-section h4 {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--muted);
  padding: 12px 16px 6px;
  margin: 0;
  letter-spacing: 0.05em;
}
.crm-search-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.crm-search-item:hover {
  background: #F6F6F6;
}
.crm-search-item-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 2px;
}
.crm-search-item-sub {
  font-size: 0.8rem;
  color: var(--muted);
}
.crm-search-empty {
  padding: 20px;
  text-align: center;
  color: var(--muted);
  font-size: 0.9rem;
}
"""

with open('src/pages/CrmDashboard.css', 'a', encoding='utf-8') as f:
    f.write(css)
