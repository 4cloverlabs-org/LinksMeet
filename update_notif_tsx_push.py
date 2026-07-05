import sys
import re

with open('src/pages/dashboard/DashboardLayout.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# 1. Remove crm-notif-backdrop
txt = re.sub(r'\{notifOpen && <div className="crm-notif-backdrop" onClick=\{.*?\} />\}\n', '', txt, flags=re.DOTALL)

# 2. Extract crm-notif-panel block
panel_pattern = r'(\{notifOpen && \(\s*<div className="crm-notif-panel">.*?</div>\s*\)\})'
match = re.search(panel_pattern, txt, flags=re.DOTALL)
if match:
    panel_block = match.group(1)
    # Remove from current location
    txt = txt.replace(panel_block, '')
    
    # We want to change `{notifOpen && (\n <div className="crm-notif-panel"> ... </div>\n)}`
    # to `<div className={`crm-notif-panel-wrapper ${notifOpen ? 'open' : ''}`}>\n <div className="crm-notif-panel"> ... </div>\n</div>`
    
    # Strip the `{notifOpen && (` and `)}` wrapper
    inner_panel = re.sub(r'^\{notifOpen && \(\s*', '', panel_block)
    inner_panel = re.sub(r'\s*\)\}$', '', inner_panel)
    
    new_panel_block = f"""
        <div className={{`crm-notif-panel-wrapper ${{notifOpen ? 'open' : ''}}`}}>
          {inner_panel}
        </div>
"""
    
    # 3. Change crm-main flexDirection
    txt = txt.replace(
        '<div className="crm-main" style={{ display: \'flex\', flexDirection: \'column\', height: \'100vh\', overflow: \'hidden\', padding: \'16px 16px 16px 0\', background: \'#F6F6F6\' }}>',
        '<div className="crm-main" style={{ display: \'flex\', flexDirection: \'row\', height: \'100vh\', overflow: \'hidden\', padding: \'16px 16px 16px 0\', background: \'#F6F6F6\' }}>'
    )
    
    # The inner div is right after crm-main:
    # <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
    txt = txt.replace(
        "boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>",
        "boxShadow: '0 4px 20px rgba(0,0,0,0.02)', transition: 'width 0.3s ease' }}>"
    )
    
    # 4. Insert the new_panel_block at the end of crm-main.
    # The end of crm-main is `</div>\n      </div>\n    </div>\n  );\n}`
    # The `</div>` before the `</div>\n    </div>\n  );\n}` belongs to the inner div.
    # We can match `</div>\n      </div>\n    </div>\n  );\n}` and insert before the second to last `</div>`.
    # Wait, the structure is:
    #       </div>
    #     </div>
    #   );
    # }
    
    # Let's use a regex to insert right before `      </div>\n    </div>\n  );\n}`
    insert_pattern = r'(      </div>\n    </div>\n  \);\n})'
    txt = re.sub(insert_pattern, new_panel_block + r'\1', txt)

    with open('src/pages/dashboard/DashboardLayout.tsx', 'w', encoding='utf-8') as f:
        f.write(txt)
    print("Success")
else:
    print("Could not find panel")
