import sys

with open('src/pages/dashboard/DashboardLayout.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# Replace .crm-main open tag to add padding
old_main = """      ) : (
      <div className="crm-main" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>"""
new_main = """      ) : (
      <div className="crm-main" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', padding: '16px 16px 16px 0', background: '#F6F6F6' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>"""
txt = txt.replace(old_main, new_main)

# Add closing tag for the wrapper
old_end = """        </div>
      </div>
      )}
      </div>
    </div>
  );"""
new_end = """        </div>
        </div>
      </div>
      )}
      </div>
    </div>
  );"""
txt = txt.replace(old_end, new_end)

with open('src/pages/dashboard/DashboardLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
