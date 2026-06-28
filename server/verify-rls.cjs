// RLS verification probe.
//
// Uses the PUBLIC anon key (the same one that ships in the browser bundle) to test
// whether each table is readable by an unauthenticated client. It prints ONLY the
// HTTP status and whether any rows were visible — never the row contents — so it is
// safe to run and share.
//
// Run BEFORE applying supabase/rls_policies.sql to see the leak, and AFTER to confirm
// it is closed. A locked table should report "LOCKED" (no rows for an anonymous user).
//
//   node server/verify-rls.cjs
//
const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  const out = {};
  try {
    const raw = fs.readFileSync(file, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch { /* ignore missing file */ }
  return out;
}

// Prefer root .env (has the anon key); fall back to server/.env for the URL.
const root = loadEnv(path.join(__dirname, '..', '.env'));
const local = loadEnv(path.join(__dirname, '.env'));
const url = root.VITE_SUPABASE_URL || local.VITE_SUPABASE_URL;
const anonKey = root.VITE_SUPABASE_ANON_KEY || local.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

// Sensitive tables should be LOCKED for anon. event_types is intentionally public-read.
const tables = [
  { name: 'users', expect: 'LOCKED' },
  { name: 'contacts', expect: 'LOCKED' },
  { name: 'bookings', expect: 'LOCKED' },
  { name: 'event_types', expect: 'public-read OK' },
];

(async () => {
  console.log(`Probing ${url} with the public anon key...\n`);
  let leaks = 0;
  for (const t of tables) {
    try {
      const res = await fetch(`${url}/rest/v1/${t.name}?select=id&limit=1`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      });
      let rows = 0;
      try { rows = (await res.json())?.length || 0; } catch { /* non-array body */ }
      const readable = res.ok && rows > 0;
      const verdict = readable ? 'READABLE BY ANON' : 'LOCKED';
      const bad = readable && t.expect === 'LOCKED';
      if (bad) leaks++;
      console.log(
        `${bad ? '❌' : '✅'} ${t.name.padEnd(12)} http=${res.status} rowsVisible=${rows}  -> ${verdict}` +
        (t.expect !== 'LOCKED' ? `  (expected: ${t.expect})` : '')
      );
    } catch (e) {
      console.log(`⚠️  ${t.name.padEnd(12)} probe failed: ${e.message}`);
    }
  }
  console.log('');
  if (leaks > 0) {
    console.log(`🔴 ${leaks} sensitive table(s) are PUBLICLY READABLE. Run supabase/rls_policies.sql now.`);
    process.exit(2);
  }
  console.log('🟢 No sensitive table is readable by the anon key. RLS looks correctly applied.');
})();
