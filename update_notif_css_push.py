import sys
import re

with open('src/pages/CrmDashboard.css', 'r', encoding='utf-8') as f:
    txt = f.read()

new_css = """
/* Timeline Notifications UI (Layout Shift) */
.crm-notif-panel-wrapper {
  width: 0;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-shrink: 0;
  height: 100%;
}
.crm-notif-panel-wrapper.open {
  width: 420px;
  margin-left: 16px;
}
.crm-notif-panel {
  width: 420px;
  height: 100%;
  background: #FFFBF8;
  border-radius: 24px;
  overflow-y: auto;
  box-shadow: -4px 0 24px rgba(0,0,0,0.04);
  display: flex; flex-direction: column;
}
"""

# Replace the previous .crm-notif-backdrop and .crm-notif-panel rules
txt = re.sub(r'\.crm-notif-backdrop \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'\.crm-notif-panel \{.*?\n\}', '', txt, flags=re.DOTALL)
txt = re.sub(r'@keyframes slideInRight \{.*?\n\}', '', txt, flags=re.DOTALL)

with open('src/pages/CrmDashboard.css', 'w', encoding='utf-8') as f:
    f.write(txt + "\n" + new_css)
