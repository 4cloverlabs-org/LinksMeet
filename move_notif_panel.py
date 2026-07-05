import sys
import re

with open('src/pages/dashboard/DashboardLayout.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# Extract the block: {notifOpen && (\n <div className="crm-notif-panel"> ... </div>\n )}
# Since we replaced it recently, let's find the exact block.
pattern = r'(\s*\{notifOpen && \(\s*<div className="crm-notif-panel">.*?</div>\s*\)\})'
match = re.search(pattern, txt, flags=re.DOTALL)
if match:
    panel_block = match.group(1)
    # Remove it from its current location
    txt = txt.replace(panel_block, '')
    
    # We want to change the extracted block from {notifOpen && ( ... )} 
    # to just {notifOpen && ( ... )} and place it right after the backdrop.
    
    backdrop_pattern = r'(\{notifOpen && <div className="crm-notif-backdrop" onClick=\{.*?\} />\})'
    # Insert the panel block right after the backdrop
    txt = re.sub(backdrop_pattern, r'\1\n' + panel_block, txt)
    
    with open('src/pages/dashboard/DashboardLayout.tsx', 'w', encoding='utf-8') as f:
        f.write(txt)
    print("Successfully moved crm-notif-panel")
else:
    print("Could not find crm-notif-panel block")
