import sys

with open('src/pages/dashboard/OverviewPage.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

old_code = """                  ].map(k => {
                    const Icon = k.icon;
                    return (
                      <div className="crm-kpi" key={k.lab}>
                        <div className="crm-kpi-top">
                          <span className="crm-kpi-ic" style={{ background: ACCENT_SOFT, color: ACCENT }}><Icon size={19} /></span>
                          {k.up && k.val > 0 && <span className="crm-kpi-delta up"><ArrowUpRight size={12} />+{k.val}</span>}
                        </div>
                        <div className="crm-kpi-val">{contactsLoading ? '—' : k.val}</div>
                        <div className="crm-kpi-lab">{k.lab}</div>
                      </div>
                    );
                  })"""

new_code = """                  ].map(k => {
                    const Icon = k.icon;
                    return (
                      <div className="crm-kpi" key={k.lab}>
                        <div className="crm-kpi-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div className="crm-kpi-lab" style={{ fontSize: '1.05rem', color: '#111', fontWeight: 500, margin: 0 }}>{k.lab}</div>
                          <span className="crm-kpi-ic" style={{ border: '1px solid var(--border)', background: '#fff', color: '#333', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} /></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginTop: '16px' }}>
                          <div className="crm-kpi-val" style={{ margin: 0, fontSize: '2rem', lineHeight: 1 }}>{contactsLoading ? '—' : k.val}</div>
                          {k.up && k.val > 0 && <span className="crm-kpi-delta up" style={{ marginBottom: 4 }}><ArrowUpRight size={12} />+{k.val}%</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '12px' }}>Update : Today</div>
                      </div>
                    );
                  })"""

txt = txt.replace(old_code, new_code)

with open('src/pages/dashboard/OverviewPage.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
