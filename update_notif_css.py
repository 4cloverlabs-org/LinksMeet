import sys
import re

css_additions = """
/* Timeline Notifications UI */
.crm-notif-backdrop { position: fixed; inset: 0; z-index: 9998; background: rgba(0,0,0,0.1); animation: crmFade 0.25s ease; }

.crm-notif-panel {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 9999;
  width: 420px; max-width: 90vw;
  background: #FFFBF8; /* Soft warm background like image */
  border-radius: 32px 0 0 32px;
  overflow-y: auto;
  box-shadow: -12px 0 40px rgba(0,0,0,0.06);
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  display: flex; flex-direction: column;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.crm-notif-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 40px 40px 30px;
}
.crm-notif-head .ttl { font-size: 1.25rem; font-weight: 700; color: #322B4A; display: flex; align-items: center; gap: 8px; }

.crm-notif-head-bell {
  width: 44px; height: 44px; background: #FFFFFF; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  color: #322B4A; position: relative;
}
.crm-notif-head-bell::after {
  content: ''; position: absolute; top: 12px; right: 12px; width: 6px; height: 6px;
  background: #E85D75; border-radius: 50%;
}

.crm-notif-content-area {
  padding: 0 40px 40px;
}

.crm-notif-date-group {
  margin-bottom: 32px;
}

.crm-notif-date-header {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 0.85rem; color: #9A94A6; font-weight: 500;
  margin-bottom: 24px;
}

.crm-notif-timeline-item {
  display: flex; align-items: center; gap: 20px;
  margin-bottom: 24px;
}
.crm-notif-timeline-item:last-child { margin-bottom: 0; }

.crm-notif-timeline-time {
  width: 50px; flex-shrink: 0;
  font-size: 0.95rem; font-weight: 700; color: #322B4A;
}

.crm-notif-timeline-line {
  width: 3px; height: 36px; border-radius: 999px;
  flex-shrink: 0;
}
.crm-notif-timeline-line.blue { background: #38bdf8; }
.crm-notif-timeline-line.orange { background: #f97316; }
.crm-notif-timeline-line.purple { background: #8b5cf6; }
.crm-notif-timeline-line.green { background: #22c55e; }
.crm-notif-timeline-line.pink { background: #ec4899; }

.crm-notif-timeline-content {
  display: flex; flex-direction: column; gap: 4px;
}
.crm-notif-timeline-content .desc {
  font-size: 0.8rem; color: #9A94A6; font-weight: 500;
}
.crm-notif-timeline-content .title {
  font-size: 0.9rem; font-weight: 600; color: #322B4A;
}
"""

with open('src/pages/CrmDashboard.css', 'r', encoding='utf-8') as f:
    txt = f.read()

# Remove old notif panel styles
txt = re.sub(r'\.crm-notif-panel \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-head \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-head \.ttl \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-head \.ttl em \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-head button \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-head button:hover \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-list \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-item \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-item:hover \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-item\.unread \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-item \.ic \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-item \.txt \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-item \.tb \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-item \.tm \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-unread-dot \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-foot \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-foot:hover \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-backdrop \{.*?\n\}', '', txt, flags=re.DOTALL)

with open('src/pages/CrmDashboard.css', 'w', encoding='utf-8') as f:
    f.write(txt + "\n" + css_additions)
