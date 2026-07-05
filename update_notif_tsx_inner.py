import sys
import re

with open('src/pages/dashboard/DashboardLayout.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# 1. Change crm-main back to flexDirection: column
txt = txt.replace(
    '<div className="crm-main" style={{ display: \'flex\', flexDirection: \'row\', height: \'100vh\', overflow: \'hidden\', padding: \'16px 16px 16px 0\', background: \'#F6F6F6\' }}>',
    '<div className="crm-main" style={{ display: \'flex\', flexDirection: \'column\', height: \'100vh\', overflow: \'hidden\', padding: \'16px 16px 16px 0\', background: \'#F6F6F6\' }}>'
)

# 2. Change the white container to flexDirection: row
# Original: <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', transition: 'width 0.3s ease' }}>
txt = txt.replace(
    '<div style={{ flex: 1, display: \'flex\', flexDirection: \'column\', background: \'#FFFFFF\', borderRadius: \'24px\', overflow: \'hidden\', boxShadow: \'0 4px 20px rgba(0,0,0,0.02)\', transition: \'width 0.3s ease\' }}>',
    '<div style={{ flex: 1, display: \'flex\', flexDirection: \'row\', background: \'#FFFFFF\', borderRadius: \'24px\', overflow: \'hidden\', boxShadow: \'0 4px 20px rgba(0,0,0,0.02)\' }}>\n          <div style={{ flex: 1, display: \'flex\', flexDirection: \'column\', minWidth: 0, transition: \'width 0.3s ease\' }}>'
)

# 3. We added an opening `<div>` above. We need to add a closing `</div>` right after `Outlet`'s wrapper `<div className="crm-content">...</div>`.
# Let's find the Outlet wrapper's closing tag.
# It ends with:
#         </div>
#         </div>
#       </div>
#       )}
#
#         <div className={`crm-notif-panel-wrapper ${notifOpen ? 'open' : ''}`}>

# Wait! The closing tags right now are:
#         </div>  <-- closes crm-content
#         </div>  <-- closes white container
#       </div>    <-- closes crm-main
#       )}        <-- closes !editingEvent block
#
#         <div className={`crm-notif-panel-wrapper ...`}>
# We need to extract the `.crm-notif-panel-wrapper` block and move it inside the white container.
# And we need to add a `</div>` to close the new wrapper.

# Let's extract the panel block first:
panel_pattern = r'(        <div className={`crm-notif-panel-wrapper \$\{notifOpen \? \'open\' : \'\'\}`}>.*?</div>\n        </div>\n)'
match = re.search(panel_pattern, txt, flags=re.DOTALL)
if match:
    panel_block = match.group(1)
    txt = txt.replace(panel_block, '')
    
    # Now find the closing tags of crm-content, white container, crm-main.
    # We will replace:
    #         </div>
    #         </div>
    #       </div>
    #       )}
    # With:
    #         </div>
    #         </div>
    #         {panel_block}
    #         </div>
    #       </div>
    #       )}
    
    replace_pattern = r'(        </div>\n        </div>\n      </div>\n      \)\})'
    
    # Actually wait. The original code is:
    #         </div> (closes crm-content)
    #         </div> (closes white container)
    #       </div> (closes crm-main)
    #       )} (closes editingEvent block)
    
    # We want:
    #         </div> (closes crm-content)
    #         </div> (closes NEW wrapper)
    #         {panel_block}
    #         </div> (closes white container)
    #       </div> (closes crm-main)
    #       )}
    
    replacement = f"""        </div>
        </div>
{panel_block}        </div>
      </div>
      )}}"""

    txt = re.sub(replace_pattern, replacement, txt)
    
    with open('src/pages/dashboard/DashboardLayout.tsx', 'w', encoding='utf-8') as f:
        f.write(txt)
    print("Success")
else:
    print("Could not find panel block")
