const fs = require('fs');

const getLocaleStr = `
const getLocale = (lang) => {
  switch (lang) {
    case 'French': return 'fr-FR';
    case 'Spanish': return 'es-ES';
    case 'German': return 'de-DE';
    default: return 'en-US';
  }
};
`;

const tHelper = `
const t = (key, lang) => {
  const dict = {
    'Your name *': { French: 'Votre nom *', Spanish: 'Tu nombre *', German: 'Dein Name *' },
    'Email address *': { French: 'Adresse e-mail *', Spanish: 'Correo electrónico *', German: 'E-Mail-Adresse *' },
    'Additional notes': { French: 'Notes supplémentaires', Spanish: 'Notas adicionales', German: 'Zusätzliche Notizen' },
    'Please share anything that will help prepare for our meeting.': { French: 'Veuillez partager tout ce qui pourrait aider à préparer notre réunion.', Spanish: 'Por favor, comparta cualquier cosa que ayude a prepararse para nuestra reunión.', German: 'Bitte teilen Sie alles mit, was zur Vorbereitung auf unser Meeting hilft.' },
    'Add guests': { French: 'Ajouter des invités', Spanish: 'Añadir invitados', German: 'Gäste hinzufügen' },
    'Back': { French: 'Retour', Spanish: 'Volver', German: 'Zurück' },
    'Confirm': { French: 'Confirmer', Spanish: 'Confirmar', German: 'Bestätigen' },
    'm': { French: 'm', Spanish: 'm', German: ' Min.' },
    'Google Meet': { French: 'Google Meet', Spanish: 'Google Meet', German: 'Google Meet' },
    'Phone Call': { French: 'Appel téléphonique', Spanish: 'Llamada telefónica', German: 'Telefonanruf' },
    'In-Person Meeting': { French: 'Réunion en personne', Spanish: 'Reunión en persona', German: 'Persönliches Meeting' },
    'Asia/Calcutta': { French: 'Asie/Calcutta', Spanish: 'Asia/Calcuta', German: 'Asien/Kalkutta' },
    'Asia/Kolkata': { French: 'Asie/Kolkata', Spanish: 'Asia/Kolkata', German: 'Asien/Kalkutta' }
  };
  return dict[key]?.[lang] || key;
};
`;

let booking = fs.readFileSync('f:/salemail-test/src/pages/BookingPage.tsx', 'utf8');

if (!booking.includes('const getLocale =')) {
  booking = booking.replace('export default function BookingPage() {', getLocaleStr + '\n' + tHelper + '\nexport default function BookingPage() {');
}

// Variables placement at top of component:
// Replace the old variables if they exist
booking = booking.replace(/const interfaceLang = eventType\?\.interfaceLang \|\| eventType\?\.interface_lang \|\| 'English';/g, '');
booking = booking.replace(/const eventColor = eventType\?\.eventColor \|\| eventType\?\.event_color \|\| '#7d3bec';/g, '');
booking = booking.replace(/const eventColor = '#7d3bec';/g, '');

// Insert right after setEventType
booking = booking.replace(/const \[eventType, setEventType\] = useState<EventType \| null>\(null\);/, 
  "const [eventType, setEventType] = useState<EventType | null>(null);\n  const interfaceLang = eventType?.interfaceLang || eventType?.interface_lang || 'English';\n  const eventColor = eventType?.eventColor || eventType?.event_color || '#7d3bec';");

// Basic strings
booking = booking.replace(/label: 'Your name'/g, "label: t('Your name *', interfaceLang).replace(' *', '')");
booking = booking.replace(/label: 'Email address'/g, "label: t('Email address *', interfaceLang).replace(' *', '')");
booking = booking.replace(/label: 'Additional notes'/g, "label: t('Additional notes', interfaceLang)");
booking = booking.replace(/placeholder=\{"Please share anything that will help prepare for our meeting."\}/g, "placeholder={t('Please share anything that will help prepare for our meeting.', interfaceLang)}");
booking = booking.replace(/placeholder=\{q.id === 'notes' \? "Please share anything that will help prepare for our meeting." : ""\}/g, "placeholder={q.id === 'notes' ? t('Please share anything that will help prepare for our meeting.', interfaceLang) : ''}");

booking = booking.replace(/>Add guests</g, ">{t('Add guests', interfaceLang)}<");
booking = booking.replace(/>\s*Back\s*<\/button>/g, ">{t('Back', interfaceLang)}</button>");
booking = booking.replace(/>\s*Confirm\s*<\/button>/g, ">{t('Confirm', interfaceLang)}</button>");
booking = booking.replace(/: 'Confirm'\}/g, ": t('Confirm', interfaceLang)}");

// Date/time formatting
booking = booking.replace(/const formattedDate = `\$\{months\[startDate\.getMonth\(\)\]\} \$\{startDate\.getDate\(\)\}, \$\{startDate\.getFullYear\(\)\}`;/g, "const formattedDate = startDate.toLocaleDateString(getLocale(interfaceLang), { month: 'long', day: 'numeric', year: 'numeric' });");
booking = booking.replace(/const formattedTime = startDate\.toLocaleTimeString\(\[\], \{ hour: 'numeric', minute: '2-digit' \}\);/g, "const formattedTime = startDate.toLocaleTimeString(getLocale(interfaceLang), { hour: 'numeric', minute: '2-digit' });");
booking = booking.replace(/const currentMonthName = new Date\(currentYear, currentMonth\)\.toLocaleString\('default', \{ month: 'long' \}\);/g, "const currentMonthName = new Date(currentYear, currentMonth).toLocaleString(getLocale(interfaceLang), { month: 'long' });");
booking = booking.replace(
  /\{new Date\(currentYear, currentMonth, selectedDate\)\.toLocaleString\('default', \{ weekday: 'long' \}\)\}, \{currentMonthName\} \{selectedDate\}, \{currentYear\}/g, 
  "{new Date(currentYear, currentMonth, selectedDate).toLocaleDateString(getLocale(interfaceLang), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}"
);

// Location and duration
booking = booking.replace(/>\{eventType\?.location \|\| 'Google Meet'\}</g, ">{t(eventType?.location || 'Google Meet', interfaceLang)}<");
booking = booking.replace(/> \{eventType\?.location \|\| 'Google Meet'\}/g, "> {t(eventType?.location || 'Google Meet', interfaceLang)}");
booking = booking.replace(/\{eventType\?.dur \|\| '15m'\}/g, "{parseInt(eventType?.dur || '15')}{t('m', interfaceLang)}");

// Timezone
booking = booking.replace(/>\s*\{timezone\}\s*</g, ">\n{t(timezone, interfaceLang)}\n<");

fs.writeFileSync('f:/salemail-test/src/pages/BookingPage.tsx', booking);
console.log('Fixed BookingPage completely.');
