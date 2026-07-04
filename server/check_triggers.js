const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTriggers() {
  const { data, error } = await supabase.rpc('run_sql', { query: `
    SELECT tgname, proname 
    FROM pg_trigger 
    JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid 
    WHERE tgrelid = 'public.users'::regclass;
  ` });
  
  if (error) {
    console.log("RPC Error:", error);
  } else {
    console.log("Triggers:", data);
  }
}

checkTriggers();
