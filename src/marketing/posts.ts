// Blog content — genuine, substantive articles (no placeholder text).
export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'quote'; text: string };

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  role: string;
  date: string;       // human-readable
  iso: string;        // YYYY-MM-DD for <time>
  readTime: string;
  image: string;      // URL to blog art
  body: Block[];
}

export const POSTS: Post[] = [
  {
    slug: 'keep-deal-context',
    title: 'How to stop losing deal context between conversations',
    excerpt:
      'Most deals don’t die from bad products — they die from forgotten details. Here’s a practical system for keeping every conversation connected.',
    category: 'Sales process',
    author: 'The LinksMeet Team',
    role: 'Product & Sales',
    date: 'June 3, 2026',
    iso: '2026-06-03',
    readTime: '6 min read',
    image: '/blog/context.png',
    body: [
      { type: 'p', text: 'Ask any salesperson why a promising deal stalled and you’ll rarely hear “the product wasn’t good enough.” More often it’s something quieter: the follow-up that never went out, the objection nobody wrote down, the decision-maker who was mentioned once and then forgotten. Context leaks out of a sales process one small detail at a time.' },
      { type: 'p', text: 'The fix isn’t working harder or sending more reminders to yourself. It’s building a system where context is captured at the moment it appears and resurfaces exactly when you need it.' },
      { type: 'h2', text: 'Capture context where the work happens' },
      { type: 'p', text: 'The biggest reason notes don’t get written is friction. If logging a call means switching tabs, finding the contact, and filling out a form, it won’t happen consistently. Capture has to live inside the flow of the conversation — a single note field on the contact, a quick activity log, a keyboard shortcut.' },
      { type: 'p', text: 'A good rule: if it took longer to record the interaction than to have it, your system is too heavy.' },
      { type: 'h2', text: 'Write down the things you’ll forget, not the things you’ll remember' },
      { type: 'p', text: 'You don’t need a transcript. You need the handful of facts that change how the next conversation goes:' },
      { type: 'ul', items: [
        'Who is actually involved in the decision, and what each person cares about',
        'The specific objection or hesitation raised — in their words',
        'What you committed to, and by when',
        'The next step, with a date attached',
      ] },
      { type: 'quote', text: 'A deal record should let a teammate pick up the conversation cold and sound like they were there the whole time.' },
      { type: 'h2', text: 'Make the next step impossible to miss' },
      { type: 'p', text: 'Context is only useful if it shows up at the right moment. Every open deal should have exactly one defined next step with an owner and a date. When that date arrives, it should appear at the top of someone’s day — not buried in a list of two hundred contacts.' },
      { type: 'p', text: 'This is the difference between a CRM that’s a filing cabinet and one that’s a working tool: the filing cabinet stores what happened; the working tool tells you what to do next.' },
      { type: 'h2', text: 'Review weekly, prune ruthlessly' },
      { type: 'p', text: 'Set a recurring 20-minute review. Anything without a next step gets one or gets closed. Deals that have slipped twice get a candid conversation. The point isn’t a tidy database for its own sake — it’s that a clean pipeline is one you can actually trust when you forecast.' },
      { type: 'p', text: 'Do this consistently and “losing context” stops being a recurring failure. It becomes the rare exception you notice immediately — because the system expects every deal to have a thread you can follow.' },
    ],
  },
  {
    slug: 'pipeline-that-gets-updated',
    title: 'A sales pipeline your team will actually keep up to date',
    excerpt:
      'A pipeline is only worth as much as its accuracy. The trick to keeping it current isn’t discipline — it’s design.',
    category: 'Pipeline',
    author: 'The LinksMeet Team',
    role: 'Product & Sales',
    date: 'May 21, 2026',
    iso: '2026-05-21',
    readTime: '5 min read',
    image: '/blog/pipeline.png',
    body: [
      { type: 'p', text: 'Every sales leader has lived through the same quiet failure: a pipeline that looks impressive in a meeting and turns out to be fiction. Deals sit in “Proposal” for three months. “Closing this week” has meant this week for a quarter. The data is there — it’s just not true.' },
      { type: 'p', text: 'The instinct is to blame discipline and demand more updates. That rarely works. Accurate pipelines come from good design, not nagging.' },
      { type: 'h2', text: 'Define stages by what’s true, not what you hope' },
      { type: 'p', text: 'Stages should describe verifiable reality, not optimism. “Qualified” shouldn’t mean “I had a good call.” It should mean a specific, checkable condition is met — budget confirmed, a real evaluation underway, a decision date on the calendar.' },
      { type: 'ul', items: [
        'Each stage has one clear entry criterion anyone can verify',
        'Moving a deal forward requires that criterion to be genuinely met',
        'There’s an obvious place for deals that are stuck, so they don’t hide',
      ] },
      { type: 'h2', text: 'Make updating faster than not updating' },
      { type: 'p', text: 'If dragging a deal to the next stage takes one click, it happens. If it requires filling three mandatory fields first, the rep will batch it for “later” — and later is where pipeline accuracy goes to die. Keep required fields to the minimum that actually drives decisions.' },
      { type: 'quote', text: 'The best time to update a deal is the moment something changes. The second best time is never — a stale record is worse than an empty one.' },
      { type: 'h2', text: 'Surface staleness automatically' },
      { type: 'p', text: 'People can’t police what they can’t see. A deal with no activity in two weeks should look different from one moving fast. Aging indicators, a “needs attention” view, and a clear next step turn pipeline hygiene from a chore into something the tool nudges for you.' },
      { type: 'h2', text: 'Forecast from the pipeline, and the pipeline gets honest' },
      { type: 'p', text: 'When your forecast is built directly from pipeline stages, accuracy stops being abstract. Reps see that inflating a deal inflates their own number — and that there’s no upside in pretending. The pipeline becomes a shared source of truth because everyone relies on it.' },
    ],
  },
  {
    slug: 'booking-links-vs-email',
    title: 'Booking links vs. email back-and-forth: the real cost',
    excerpt:
      'Scheduling a single call over email can take five messages and two days. Here’s what that actually costs a sales team — and how to get it back.',
    category: 'Productivity',
    author: 'The LinksMeet Team',
    role: 'Product & Sales',
    date: 'May 9, 2026',
    iso: '2026-05-09',
    readTime: '4 min read',
    image: '/blog/booking.png',
    body: [
      { type: 'p', text: 'It feels trivial: “Does Tuesday work? How about 2pm? Actually, can we do Wednesday?” But multiply that thread across every prospect, every week, and the back-and-forth quietly becomes one of the biggest time sinks in a sales team’s day.' },
      { type: 'h2', text: 'Where the time really goes' },
      { type: 'p', text: 'The cost isn’t just the minutes spent typing. It’s the context-switching, the waiting, and the momentum lost while a hot lead cools off between replies.' },
      { type: 'ul', items: [
        'Every scheduling thread averages four to six messages',
        'Each reply forces a context switch away from higher-value work',
        'A two-day scheduling delay is two days a motivated buyer can change their mind',
        'Time-zone math introduces errors that cost no-shows and goodwill',
      ] },
      { type: 'h2', text: 'A booking link removes the negotiation entirely' },
      { type: 'p', text: 'When a prospect can see your real availability and pick a slot, the entire negotiation disappears. They book in fifteen seconds, the event lands on both calendars, and a meeting link is generated automatically. No thread, no time-zone confusion, no “just following up to find a time.”' },
      { type: 'quote', text: 'The fastest message in a sales process is the one you never had to send.' },
      { type: 'h2', text: 'Keep the link connected to the deal' },
      { type: 'p', text: 'A booking link in isolation is convenient. A booking link wired into your CRM is powerful: the meeting attaches to the right contact, the call gets logged, and the next step is set the moment someone books. The scheduling tool stops being a separate app and becomes part of how deals move forward.' },
      { type: 'p', text: 'Reclaiming those minutes isn’t about working faster. It’s about deleting work that never needed to exist.' },
    ],
  },
  {
    slug: 'what-to-track-in-your-crm',
    title: 'What to track in your CRM — and what to ignore',
    excerpt:
      'More fields don’t make a better CRM. They make a slower one. Here’s how to decide what’s worth recording.',
    category: 'Best practices',
    author: 'The LinksMeet Team',
    role: 'Product & Sales',
    date: 'April 24, 2026',
    iso: '2026-04-24',
    readTime: '5 min read',
    image: '/blog/crm.png',
    body: [
      { type: 'p', text: 'There’s a temptation, when setting up a CRM, to track everything. Industry, company size, lead source, last touch, favorite color — if there’s a field for it, someone will want it filled in. But every field you add is a small tax on every interaction, and most of those fields are never looked at again.' },
      { type: 'h2', text: 'The test: will this change a decision?' },
      { type: 'p', text: 'Before adding a field, ask one question — will the value of this field ever change what someone does? If you can’t name the decision it informs, it’s noise. Data you collect but never act on is pure overhead.' },
      { type: 'h2', text: 'What’s almost always worth tracking' },
      { type: 'ul', items: [
        'Who the contact is and how to reach them',
        'What stage the deal is in and why',
        'The next step and its date',
        'The last meaningful interaction',
        'The reason a deal was won or lost',
      ] },
      { type: 'h2', text: 'What’s usually noise' },
      { type: 'ul', items: [
        'Fields that duplicate what’s already obvious from the activity log',
        'Granular categorizations nobody filters or reports on',
        'Required fields that exist “just in case” and slow down every update',
      ] },
      { type: 'quote', text: 'A CRM with ten trusted fields beats one with fifty fields nobody believes.' },
      { type: 'h2', text: 'Win/loss reasons are the exception worth enforcing' },
      { type: 'p', text: 'If there’s one field worth making mandatory, it’s why a deal closed — won or lost. It’s the single most valuable input for improving your process, and it’s only useful if it’s captured consistently while the memory is fresh.' },
      { type: 'p', text: 'Keep the system lean and people will trust it. Trust is what turns a CRM from a reporting obligation into a tool the team actually wants to use.' },
    ],
  },
];

export const getPost = (slug: string) => POSTS.find(p => p.slug === slug);
