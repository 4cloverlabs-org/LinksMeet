import sys

with open('src/pages/BookingPage.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

old_code = """      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerUid: uid,
          bookerName: name,
          bookerEmail: email,
          bookerNotes: notes,
          startTime,
          endTime,
          eventTitle: eventType.title,
          eventTypeSlug: slug
        })
      });

      if (!res.ok) {
        throw new Error('Backend failed to book');
      }
      const data = await res.json();
      
      setMeetLink(data.booking?.meet_link || '');

      setBookingStatus('success');
    } catch (err) {
      alert('Failed to complete booking. Please try again.');
      setBookingStatus('idle');
    }"""

new_code = """      let meetLink = '';
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ownerUid: uid,
            bookerName: name,
            bookerEmail: email,
            bookerNotes: notes,
            startTime,
            endTime,
            eventTitle: eventType.title,
            eventTypeSlug: slug
          })
        });

        if (!res.ok) {
          throw new Error('Backend failed to book');
        }
        const data = await res.json();
        meetLink = data.booking?.meet_link || '';
      } catch (backendErr) {
        console.warn("Backend unavailable, using direct Supabase fallback.", backendErr);
        
        // Format slot string
        const startDate = new Date(startTime);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const formattedDate = `${months[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()}`;
        const formattedTime = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const slotStr = `${formattedDate} · ${formattedTime}`;

        // 1. Insert Booking directly
        const { error: insertError } = await supabase.from('bookings').insert({
          user_id: uid,
          event_slug: slug,
          event_title: eventType.title,
          booker_name: name,
          booker_email: email,
          slot: slotStr,
          status: 'upcoming'
        });
        
        if (insertError) throw insertError;
        
        // 2. Auto-create Contact directly
        await supabase.from('contacts').insert({
          user_id: uid,
          name: name,
          email: email,
          company: notes || '',
          source: `Booking: ${eventType.title}`,
          status: 'New'
        });
      }
      
      setMeetLink(meetLink);
      setBookingStatus('success');
    } catch (err) {
      console.error(err);
      alert('Failed to complete booking. Please try again.');
      setBookingStatus('idle');
    }"""

txt = txt.replace(old_code, new_code)

# Wait, what about the start_time, end_time bug in fetch?
# Let's fix that too.
old_fetch = """            const { data: bData } = await supabase.from('bookings')
              .select('start_time, end_time')
              .eq('owner_uid', uid)
              .gte('start_time', new Date().toISOString());"""

new_fetch = """            // We fall back to fetching 'slot' if start_time is missing since bookings table didn't have start_time originally
            const { data: bData } = await supabase.from('bookings')
              .select('slot')
              .eq('user_id', uid);"""

txt = txt.replace(old_fetch, new_fetch)

# Fix how it parses booked dates inside loadEvent
old_booked = """        if (bData) {
          const fetchedBookedDates: Date[] = [];
          bData.forEach(b => {
            if (b.start_time) {
              fetchedBookedDates.push(new Date(b.start_time));
            }
          });
          setBookedDates(fetchedBookedDates);
        }"""

new_booked = """        if (bData) {
          const fetchedBookedDates: Date[] = [];
          bData.forEach(b => {
            if (b.slot) {
              // Parse slot string: "July 24, 2026 · 10:00 AM"
              const parts = b.slot.split(' · ');
              if (parts.length === 2) {
                const dateStr = parts[0];
                const timeStr = parts[1];
                const parsedDate = new Date(`${dateStr} ${timeStr}`);
                if (!isNaN(parsedDate.getTime())) {
                  fetchedBookedDates.push(parsedDate);
                }
              }
            }
          });
          setBookedDates(fetchedBookedDates);
        }"""

txt = txt.replace(old_booked, new_booked)

with open('src/pages/BookingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
