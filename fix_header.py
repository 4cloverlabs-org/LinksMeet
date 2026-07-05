import sys

with open('src/pages/dashboard/EventTypesPage.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

target = '      <div className="crm-fade">\n                <div className="crm-seg"'
replacement = """      <div className="crm-fade">
        <div className="crm-card-head">
          <div>
            <h2 className="ttl">Event Types</h2>
            <p className="sub">Create scheduling links people can book.</p>
          </div>
          <button className="crm-btn crm-btn-primary" onClick={() => setEditingEvent('new')}>
            <Plus size={15} /> New Event Type
          </button>
        </div>
        <div className="crm-card">
                <div className="crm-seg\""""

txt = txt.replace(target, replacement)

# Because we added `<div className="crm-card">`, we need to add a closing `</div>` before the final `</>`
if '<div className="crm-card">' in txt and "</div>\n    </>\n  );\n}" not in txt:
    txt = txt.replace("    </>\n  );\n}", "      </div>\n    </>\n  );\n}")


with open('src/pages/dashboard/EventTypesPage.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
