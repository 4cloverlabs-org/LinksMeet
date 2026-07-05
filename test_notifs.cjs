require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // If no user is logged in via this script, we'll just insert using a hardcoded UID or get one from the db
    const { data: users } = await supabase.auth.admin.listUsers();
    console.log(users);
  }
  
  // Let's just fetch notifications to see if table exists
  const { data, error } = await supabase.from('notifications').select('*').limit(1);
  if (error) {
    console.error("Error fetching notifications:", error.message);
  } else {
    console.log("Success! Table exists. Data:", data);
  }
}

run();
