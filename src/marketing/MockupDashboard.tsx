import { 
  Search, Bell, 
  LayoutDashboard, CalendarDays, Calendar, Users, 
  Workflow, Megaphone, GitFork, 
  AppWindow, CreditCard,
  User as UserIcon, Plus, Eye, Trophy,
  ChevronDown
} from 'lucide-react';

export default function MockupDashboard() {
  return (
    <div className="cc-auth-mockup" style={{ width: '100%', height: '360px', display: 'flex', overflow: 'hidden', background: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Sidebar */}
      <div style={{ width: '130px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '12px 8px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px', marginBottom: '16px' }}>
          <img src="/LinksMeet-without-bg.png" alt="Logo" style={{ width: '16px' }} />
          <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}>LinksMeet</span>
        </div>

        <div style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div>
            <div style={{ fontSize: '0.45rem', fontWeight: 700, color: '#94a3b8', padding: '0 8px', marginBottom: '4px', letterSpacing: '0.05em' }}>WORKSPACE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', color: '#64748b', fontSize: '0.6rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#e2e8f0', borderRadius: '2px' }}></div>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>24311a05...</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.45rem', fontWeight: 700, color: '#94a3b8', padding: '0 8px', marginBottom: '4px', letterSpacing: '0.05em' }}>SCHEDULING</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', background: '#7d3bec', color: 'white', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 500 }}>
                <LayoutDashboard size={10} /> Dashboard
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', color: '#64748b', fontSize: '0.6rem' }}><Calendar size={10} /> Event Types</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', color: '#64748b', fontSize: '0.6rem' }}><CalendarDays size={10} /> Bookings</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', color: '#64748b', fontSize: '0.6rem' }}><UserIcon size={10} /> Leads</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', color: '#64748b', fontSize: '0.6rem' }}><Users size={10} /> Teams</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.45rem', fontWeight: 700, color: '#94a3b8', padding: '0 8px', marginBottom: '4px', letterSpacing: '0.05em' }}>AUTOMATE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', color: '#64748b', fontSize: '0.6rem' }}><Workflow size={10} /> Workflows</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', color: '#64748b', fontSize: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Megaphone size={10} /> Campaigns</div>
                <span style={{ background: '#16a34a', color: 'white', fontSize: '0.4rem', padding: '1px 3px', borderRadius: '2px', fontWeight: 600 }}>NEW</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', color: '#64748b', fontSize: '0.6rem' }}><GitFork size={10} /> Routing</div>
            </div>
          </div>

        </div>
        
        {/* Bottom Profile */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '16px', height: '16px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 700 }}>a</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.55rem', fontWeight: 600, color: '#0f172a' }}>24311a...</div>
            <div style={{ fontSize: '0.45rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>avata...</div>
          </div>
          <ChevronDown size={10} color="#94a3b8" />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ height: '36px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', width: '200px', border: '1px solid #e2e8f0' }}>
            <Search size={10} color="#94a3b8" />
            <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Search across dashboard...</span>
          </div>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={10} color="#64748b" />
          </div>
        </div>

        <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Top Cards */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { title: 'Total leads', val: '3', icon: <Users size={12} color="#64748b" /> },
              { title: 'Needs follow-up', val: '3', icon: <CalendarDays size={12} color="#64748b" /> },
              { title: 'Converted', val: '0', icon: <Trophy size={12} color="#64748b" /> },
              { title: 'New this week', val: '1', icon: <UserIcon size={12} color="#64748b" />, trend: '+1%' }
            ].map((c, i) => (
              <div key={i} style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#0f172a' }}>{c.title}</div>
                  <div style={{ padding: '2px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #f1f5f9' }}>{c.icon}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{c.val}</div>
                  {c.trend && <div style={{ fontSize: '0.55rem', background: '#dcfce7', color: '#16a34a', padding: '2px 4px', borderRadius: '2px', fontWeight: 600 }}>↗ {c.trend}</div>}
                </div>
                <div style={{ fontSize: '0.5rem', color: '#94a3b8' }}>Update : Today</div>
              </div>
            ))}
          </div>

          {/* Middle Row */}
          <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
            
            {/* Follow-ups */}
            <div style={{ flex: 1.5, background: 'white', borderRadius: '8px', padding: '10px 12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#0f172a' }}>Follow-ups</div>
                <div style={{ fontSize: '0.55rem', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 500, color: '#334155' }}>View all</div>
              </div>
              <div style={{ fontSize: '0.5rem', color: '#94a3b8', marginBottom: '8px' }}>Leads that need attention</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { n: 'navtej', desc: 'Booking: test' },
                  { n: 'suhas', desc: 'Booking' },
                  { n: 'sohith', desc: 'Booking' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: i < 2 ? '1px solid #f8fafc' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#a855f7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 600 }}>{item.n[0].toUpperCase()}</div>
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#1e293b' }}>{item.n}</div>
                        <div style={{ fontSize: '0.5rem', color: '#94a3b8' }}>{item.desc}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span style={{ fontSize: '0.5rem', background: '#f3e8ff', color: '#7d3bec', padding: '2px 4px', borderRadius: '2px', fontWeight: 600 }}>New</span>
                      <span style={{ fontSize: '0.5rem', border: '1px solid #e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>Mark converted</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leads by status */}
            <div style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>Leads by status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#d8b4fe" strokeWidth="16" />
                  </svg>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>3</div>
                    <div style={{ fontSize: '0.5rem', color: '#64748b' }}>leads</div>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6rem', fontWeight: 500, color: '#0f172a' }}>
                    <div style={{ width: '6px', height: '6px', background: '#d8b4fe', borderRadius: '2px' }}></div> New
                  </div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 600 }}>3</div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Table */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#0f172a' }}>Recent leads</div>
              <div style={{ fontSize: '0.55rem', border: '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px', fontWeight: 500, color: '#334155' }}>View all</div>
            </div>
            <table style={{ width: '100%', fontSize: '0.55rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#94a3b8', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ paddingBottom: '4px', fontWeight: 600 }}>NAME</th>
                  <th style={{ paddingBottom: '4px', fontWeight: 600 }}>SOURCE</th>
                  <th style={{ paddingBottom: '4px', fontWeight: 600 }}>EMAIL</th>
                  <th style={{ paddingBottom: '4px', fontWeight: 600 }}>PHONE</th>
                  <th style={{ paddingBottom: '4px', fontWeight: 600 }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: 'navtej', src: 'Booking: test', em: 'ravulanavtej@gmail.com' },
                  { n: 'suhas', src: 'Booking', em: 'sohithkontham5@gmail.com' }
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i === 1 ? 'none' : '1px solid #f8fafc' }}>
                    <td style={{ padding: '6px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#a855f7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', fontWeight: 600 }}>{row.n[0].toUpperCase()}</div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.n}</span>
                      </div>
                    </td>
                    <td style={{ padding: '6px 0', color: '#64748b' }}>{row.src}</td>
                    <td style={{ padding: '6px 0', color: '#64748b' }}>{row.em}</td>
                    <td style={{ padding: '6px 0', color: '#94a3b8' }}>--</td>
                    <td style={{ padding: '6px 0' }}>
                      <span style={{ fontSize: '0.5rem', background: '#f3e8ff', color: '#7d3bec', padding: '2px 4px', borderRadius: '2px', fontWeight: 600 }}>New</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
