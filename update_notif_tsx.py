import sys
import re

with open('src/pages/dashboard/DashboardLayout.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

new_panel = """<div className="crm-notif-panel">
                    <div className="crm-notif-head">
                      <span className="ttl">Notifications</span>
                      <div className="crm-notif-head-bell" onClick={() => setNotifOpen(false)} style={{ cursor: 'pointer' }}>
                        <Bell size={20} />
                      </div>
                    </div>
                    <div className="crm-notif-content-area">
                      {[{
                        date: 'Today',
                        items: notifs.filter(n => n.time.includes('m') || n.time.includes('h'))
                      }, {
                        date: 'Yesterday',
                        items: notifs.filter(n => n.time === 'Yesterday')
                      }].filter(g => g.items.length > 0).map(group => (
                        <div key={group.date} className="crm-notif-date-group">
                          <div className="crm-notif-date-header">
                            {group.date}
                            <MoreHorizontal size={14} />
                          </div>
                          {group.items.map(n => {
                            let color = 'pink';
                            if (n.target === 'dashboard') color = 'green';
                            if (n.target === 'bookings') color = 'blue';
                            if (n.target === 'people') color = 'orange';
                            if (n.target === 'payments') color = 'purple';
                            
                            return (
                              <div key={n.id} className="crm-notif-timeline-item">
                                <div className="crm-notif-timeline-time">{n.time}</div>
                                <div className={`crm-notif-timeline-line ${color}`} />
                                <div className="crm-notif-timeline-content">
                                  <div className="desc">{n.title}</div>
                                  <div className="title">{n.desc}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>"""

# Replace the old crm-notif-panel div
# It spans from <div className="crm-notif-panel"> to the closing </div> before )}
# We can use regex to find and replace it.
pattern = r'<div className="crm-notif-panel">.*?</div>\s*<button className="crm-notif-foot".*?</button>\s*</div>'
# wait, the structure is:
# <div className="crm-notif-panel">
#   <div className="crm-notif-head">...</div>
#   <div className="crm-notif-list">...</div>
#   <button className="crm-notif-foot">...</button>
# </div>

pattern = r'<div className="crm-notif-panel">.*?View all activity\n\s*</button>\n\s*</div>'
txt = re.sub(pattern, new_panel, txt, flags=re.DOTALL)

with open('src/pages/dashboard/DashboardLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
