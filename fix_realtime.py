import sys

with open('src/pages/dashboard/DashboardLayout.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# Add realtime subscriptions
old_code = """  // Google Integration State
  const [googleConnected, setGoogleConnected] = useState(false);"""

new_code = """  // Real-time Notifications
  useEffect(() => {
    if (!user) return;
    
    const bookingsSub = supabase.channel('realtime_bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings', filter: `user_id=eq.${user.id}` }, (payload) => {
        const newBooking = payload.new;
        setNotifs(prev => [
          {
            id: Date.now(),
            icon: CalendarCheck,
            title: 'New booking',
            desc: `${newBooking.event_title} with ${newBooking.booker_name}`,
            time: 'Just now',
            read: false,
            target: 'bookings'
          },
          ...prev
        ]);
      })
      .subscribe();

    const contactsSub = supabase.channel('realtime_contacts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contacts', filter: `user_id=eq.${user.id}` }, (payload) => {
        const newContact = payload.new;
        setNotifs(prev => [
          {
            id: Date.now() + 1,
            icon: UserPlus,
            title: 'New contact added',
            desc: `${newContact.name} joined your list`,
            time: 'Just now',
            read: false,
            target: 'people'
          },
          ...prev
        ]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSub);
      supabase.removeChannel(contactsSub);
    };
  }, [user]);

  // Google Integration State
  const [googleConnected, setGoogleConnected] = useState(false);"""

txt = txt.replace(old_code, new_code)

with open('src/pages/dashboard/DashboardLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
