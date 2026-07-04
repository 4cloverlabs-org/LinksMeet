const { createClient } = require('@supabase/supabase-js');
const url = 'https://fckqtqpbqstjzzyulppv.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
