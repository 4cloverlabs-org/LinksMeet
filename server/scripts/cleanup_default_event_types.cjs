/**
 * One-off migration: remove the extra auto-seeded default event types that
 * were created for every user on signup, keeping only "30 Min Meeting".
 *
 * Safety:
 *  - Only deletes rows that STILL EXACTLY MATCH the original seeded signature
 *    (slug + title + dur + description). If a user edited any of those fields,
 *    the row is preserved.
 *  - Bookings store a denormalized event_title/event_slug copy with no FK to
 *    event_types, so deleting an event type does NOT remove booking history.
 *
 * Usage:
 *   node scripts/cleanup_default_event_types.cjs          # DRY RUN (reports only)
 *   node scripts/cleanup_default_event_types.cjs --apply  # actually deletes
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

// The four defaults to remove — must match the original seed EXACTLY.
const TARGETS = [
  { title: '15 Min Meeting', slug: '15min', dur: '15m', description: 'A quick intro or sync call.' },
  { title: 'Product Demo', slug: 'demo', dur: '45m', description: 'Guided walkthrough of LinksMeet.' },
  { title: 'Strategy Session', slug: 'strategy', dur: '60m', description: 'Deep-dive planning with the team.' },
  { title: 'Group Webinar', slug: 'webinar', dur: '90m', description: 'Multi-attendee live session.' },
];

const APPLY = process.argv.includes('--apply');

(async () => {
  console.log(APPLY ? '=== APPLY MODE (will delete) ===' : '=== DRY RUN (no changes) ===');

  let totalMatched = 0;
  const idsToDelete = [];

  for (const t of TARGETS) {
    const { data, error } = await supabase
      .from('event_types')
      .select('id, user_id, title, slug, dur, description')
      .eq('slug', t.slug)
      .eq('title', t.title)
      .eq('dur', t.dur)
      .eq('description', t.description);

    if (error) {
      console.error(`Query failed for "${t.title}":`, error.message);
      process.exit(1);
    }

    console.log(`\n"${t.title}" (slug=${t.slug}): ${data.length} unmodified default row(s) across all users`);
    totalMatched += data.length;
    data.forEach((r) => idsToDelete.push(r.id));
  }

  console.log(`\nTotal rows matching the seeded defaults: ${totalMatched}`);

  if (!APPLY) {
    console.log('\nDry run complete. Re-run with --apply to delete these rows.');
    return;
  }

  if (idsToDelete.length === 0) {
    console.log('Nothing to delete.');
    return;
  }

  // Delete in chunks to stay within request limits.
  let deleted = 0;
  const CHUNK = 200;
  for (let i = 0; i < idsToDelete.length; i += CHUNK) {
    const chunk = idsToDelete.slice(i, i + CHUNK);
    const { error } = await supabase.from('event_types').delete().in('id', chunk);
    if (error) {
      console.error('Delete failed:', error.message);
      process.exit(1);
    }
    deleted += chunk.length;
  }
  console.log(`\nDeleted ${deleted} row(s).`);
})();
