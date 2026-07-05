import sys

with open('src/pages/dashboard/DashboardLayout.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# 1. Add state
txt = txt.replace(
    "const [search, setSearch] = useState('');",
    "const [search, setSearch] = useState('');\n  const [isSearchFocused, setIsSearchFocused] = useState(false);"
)

# 2. Add globalSearchResults logic
global_search_logic = """
  const globalSearchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return { contacts: [], bookings: [], workflows: [], apps: [] };
    return {
      contacts: contacts.filter((c: any) => 
        (c.name && c.name.toLowerCase().includes(q)) || 
        (c.company && c.company.toLowerCase().includes(q)) || 
        (c.email && c.email.toLowerCase().includes(q))
      ).slice(0, 3),
      bookings: bookings.filter((b: any) => 
        (b.title && b.title.toLowerCase().includes(q)) || 
        (b.attendeeName && b.attendeeName.toLowerCase().includes(q)) || 
        (b.attendeeEmail && b.attendeeEmail.toLowerCase().includes(q))
      ).slice(0, 3),
      workflows: myWorkflows.filter((w: any) => 
        (w.name && w.name.toLowerCase().includes(q)) || 
        (w.description && w.description.toLowerCase().includes(q))
      ).slice(0, 3),
      apps: installedApps.filter((a: any) => 
        (a.nm && a.nm.toLowerCase().includes(q)) || 
        (a.cat && a.cat.toLowerCase().includes(q))
      ).slice(0, 3)
    };
  }, [search, contacts, bookings, myWorkflows, installedApps]);
"""

txt = txt.replace(
    "const filteredContacts = useMemo(() => {",
    global_search_logic + "\n  const filteredContacts = useMemo(() => {"
)

# 3. Replace search UI
old_search_ui = """            <div className="crm-search">
              <Search size={15} color="#9b9bab" />
              <input placeholder="Search contacts, deals, companies…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>"""

new_search_ui = """            <div className="crm-search" style={{ position: 'relative' }}>
              <Search size={15} color="#9b9bab" />
              <input 
                placeholder="Search across dashboard…" 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              {isSearchFocused && search.trim() !== '' && (
                <div className="crm-search-dropdown">
                  {globalSearchResults.contacts.length > 0 && (
                    <div className="crm-search-section">
                      <h4>Contacts</h4>
                      {globalSearchResults.contacts.map((c: any) => (
                        <div key={c.id} className="crm-search-item" onClick={() => { setView('people'); setSearch(''); }}>
                          <div className="crm-search-item-title">{c.name}</div>
                          <div className="crm-search-item-sub">{c.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {globalSearchResults.bookings.length > 0 && (
                    <div className="crm-search-section">
                      <h4>Bookings</h4>
                      {globalSearchResults.bookings.map((b: any) => (
                        <div key={b.id} className="crm-search-item" onClick={() => { setView('bookings'); setSearch(''); }}>
                          <div className="crm-search-item-title">{b.title}</div>
                          <div className="crm-search-item-sub">{b.attendeeName}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {globalSearchResults.workflows.length > 0 && (
                    <div className="crm-search-section">
                      <h4>Workflows</h4>
                      {globalSearchResults.workflows.map((w: any) => (
                        <div key={w.id} className="crm-search-item" onClick={() => { setView('workflows'); setSearch(''); }}>
                          <div className="crm-search-item-title">{w.name}</div>
                          <div className="crm-search-item-sub">{w.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {globalSearchResults.apps.length > 0 && (
                    <div className="crm-search-section">
                      <h4>Apps</h4>
                      {globalSearchResults.apps.map((a: any) => (
                        <div key={a.id} className="crm-search-item" onClick={() => { setView('apps'); setSearch(''); }}>
                          <div className="crm-search-item-title">{a.nm}</div>
                          <div className="crm-search-item-sub">{a.cat}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {globalSearchResults.contacts.length === 0 && globalSearchResults.bookings.length === 0 && globalSearchResults.workflows.length === 0 && globalSearchResults.apps.length === 0 && (
                    <div className="crm-search-empty">No results found for "{search}"</div>
                  )}
                </div>
              )}
            </div>"""

txt = txt.replace(old_search_ui, new_search_ui)

with open('src/pages/dashboard/DashboardLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
