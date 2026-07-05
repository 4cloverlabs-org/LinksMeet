import sys
import re

with open('src/pages/dashboard/DashboardLayout.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# 1. Import db helpers
if 'getNotifications' not in txt:
    txt = txt.replace("import { supabase } from '../../lib/supabase';", "import { supabase } from '../../lib/supabase';\nimport { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from '../../lib/db';")

# 2. Remove NOTIFS_INIT
txt = re.sub(r'type Notif = \{.*?\[.*?\];\n\n/\* ---------------- chart helpers ---------------- \*/', '/* ---------------- chart helpers ---------------- */', txt, flags=re.DOTALL)

# 3. Update the state
txt = txt.replace('const [notifs, setNotifs] = useState<Notif[]>(NOTIFS_INIT);', 'const [notifs, setNotifs] = useState<Notification[]>([]);')

# 4. Add useEffect for fetching and real-time
effect_code = '''
  useEffect(() => {
    if (!uid) return;
    
    getNotifications(uid).then(data => setNotifs(data)).catch(err => console.error("Error fetching notifs:", err));
    
    const channel = supabase.channel('notifs-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, payload => {
        setNotifs(prev => [payload.new as Notification, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, payload => {
        setNotifs(prev => prev.map(n => n.id === payload.new.id ? (payload.new as Notification) : n));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [uid]);
'''
if "channel('notifs-channel')" not in txt:
    txt = txt.replace('const [toast, setToast] = useState<string | null>(null);', 'const [toast, setToast] = useState<string | null>(null);\n' + effect_code)

# 5. Update openNotif and markAllRead
old_open_notif = '''  const unreadCount = notifs.filter(n => !n.read).length;
  const openNotif = (n: Notif) => {
    setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    setNotifOpen(false);
    setView(n.target);
  };
  const markAllRead = () => setNotifs(prev => prev.map(x => ({ ...x, read: true })));'''

new_open_notif = '''  const unreadCount = notifs.filter(n => !n.is_read).length;
  const openNotif = async (n: Notification) => {
    if (!n.is_read) {
      setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
      await markNotificationAsRead(n.id).catch(console.error);
    }
    setNotifOpen(false);
    setView(n.target as View);
  };
  const markAllRead = async () => {
    setNotifs(prev => prev.map(x => ({ ...x, is_read: true })));
    await markAllNotificationsAsRead(uid).catch(console.error);
  };'''

txt = txt.replace(old_open_notif, new_open_notif)
if old_open_notif not in txt and 'markAllNotificationsAsRead(uid)' not in txt:
    print('WARNING: openNotif replace failed')

with open('src/pages/dashboard/DashboardLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
print('DashboardLayout.tsx updated.')
