import sys
import re

with open('src/pages/dashboard/DashboardLayout.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# 1. Add time formatting functions at the top of the component
format_funcs = '''
  const formatTimeAgo = (dateStr: string) => {
    const diff = (new Date().getTime() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return Math.floor(diff / 86400) + 'd';
  };

  const getNotifGroup = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return 'Earlier';
  };
'''

if 'formatTimeAgo' not in txt:
    txt = txt.replace('const unreadCount = notifs.filter(n => !n.is_read).length;', format_funcs + '\n  const unreadCount = notifs.filter(n => !n.is_read).length;')

# 2. Update the rendering logic inside crm-notif-content-area
new_render = '''<div className="crm-notif-content-area">
                      {['Today', 'Yesterday', 'Earlier'].map(dateGroup => {
                        const items = notifs.filter(n => getNotifGroup(n.created_at) === dateGroup);
                        if (items.length === 0) return null;
                        
                        return (
                          <div key={dateGroup} className="crm-notif-date-group">
                            <div className="crm-notif-date-header">
                              {dateGroup}
                              <MoreHorizontal size={14} />
                            </div>
                            {items.map(n => {
                              let color = 'pink';
                              if (n.target === 'dashboard') color = 'green';
                              if (n.target === 'bookings') color = 'blue';
                              if (n.target === 'people') color = 'orange';
                              if (n.target === 'payments') color = 'purple';
                              
                              return (
                                <div key={n.id} className="crm-notif-timeline-item">
                                  <div className="crm-notif-timeline-time">{formatTimeAgo(n.created_at)}</div>
                                  <div className={`crm-notif-timeline-line ${color}`} />
                                  <div className="crm-notif-timeline-content" style={{ opacity: n.is_read ? 0.6 : 1, cursor: 'pointer' }} onClick={() => openNotif(n as any)}>
                                    <div className="title" style={{ fontSize: '0.85rem', color: '#9A94A6', fontWeight: 600 }}>{n.title}</div>
                                    <div className="desc" style={{ fontSize: '0.95rem', color: '#322B4A', fontWeight: 700 }}>{n.description}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>'''

txt = re.sub(r'<div className="crm-notif-content-area">.*?</div>\n                  </div>\n        </div>', new_render + '\n                  </div>\n        </div>', txt, flags=re.DOTALL)

with open('src/pages/dashboard/DashboardLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
print('DashboardLayout.tsx updated.')
