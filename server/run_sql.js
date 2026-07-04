const { createClient } = require('@supabase/supabase-js');
const url = 'https://fckqtqpbqstjzzyulppv.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZja3F0cXBicXN0anp6eXVscHB2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjYzNjEzNiwiZXhwIjoyMDk4MjEyMTM2fQ.lPBBChVTRr5SXEWnQKlzw0HuYkP7K-cBroEtdl2p4HM';
const supabase = createClient(url, key);
(async () => {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: `
      ALTER TABLE public.users
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS website_url TEXT,
      ADD COLUMN IF NOT EXISTS brand_description TEXT,
      ADD COLUMN IF NOT EXISTS profile_picture TEXT;
    `
  });
  console.log('Result:', data, 'Error:', error);
})();
