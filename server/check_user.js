const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTriggers() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log("Users:", data);
  // Actually let's just use raw REST if possible, but Supabase JS doesn't allow raw SQL without RPC.
  // We can query pg_trigger if it's exposed, but it's not.
}

checkTriggers();
