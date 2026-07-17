const fs = require('fs');

let editor = fs.readFileSync('f:/salemail-test/src/components/EventTypeEditor.tsx', 'utf8');

// 1. Layout colors
const layoutStart = editor.indexOf('{/* Layout */}');
const layoutEnd = editor.indexOf('{/* Event type color */}');
if (layoutStart !== -1 && layoutEnd !== -1) {
  let block = editor.substring(layoutStart, layoutEnd);

  // Month
  block = block.replace(/border: allowedLayouts\.includes\('Month'\) \? '2px solid #7d3bec' : '2px solid #F5F5F5'/g, "border: allowedLayouts.includes('Month') ? `2px solid ${eventColor}` : '2px solid #F5F5F5'");
  block = block.replace(/background: '#7d3bec'/g, "background: eventColor");
  block = block.replace(/background: '#bfdbfe'/g, "background: eventColor");
  block = block.replace(/accentColor: '#7d3bec'/g, "accentColor: eventColor");

  // Weekly
  block = block.replace(/border: allowedLayouts\.includes\('Weekly'\) \? '2px solid #7d3bec' : '2px solid #F5F5F5'/g, "border: allowedLayouts.includes('Weekly') ? `2px solid ${eventColor}` : '2px solid #F5F5F5'");
  block = block.replace(/border: '2px solid #bfdbfe'/g, "border: `2px solid ${eventColor}`");
  block = block.replace(/background: '#bfdbfe'/g, "background: eventColor");

  // Column
  block = block.replace(/border: allowedLayouts\.includes\('Column'\) \? '2px solid #7d3bec' : '2px solid #F5F5F5'/g, "border: allowedLayouts.includes('Column') ? `2px solid ${eventColor}` : '2px solid #F5F5F5'");
  
  // Default view buttons
  block = block.replace(/background: defaultLayout === 'Month' \? '#eff6ff' : 'transparent', color: defaultLayout === 'Month' \? '#7d3bec' : '#64748b'/g, "background: defaultLayout === 'Month' ? `${eventColor}1a` : 'transparent', color: defaultLayout === 'Month' ? eventColor : '#64748b'");
  block = block.replace(/background: defaultLayout === 'Weekly' \? '#eff6ff' : 'transparent', color: defaultLayout === 'Weekly' \? '#7d3bec' : '#64748b'/g, "background: defaultLayout === 'Weekly' ? `${eventColor}1a` : 'transparent', color: defaultLayout === 'Weekly' ? eventColor : '#64748b'");
  block = block.replace(/background: defaultLayout === 'Column' \? '#eff6ff' : 'transparent', color: defaultLayout === 'Column' \? '#7d3bec' : '#64748b'/g, "background: defaultLayout === 'Column' ? `${eventColor}1a` : 'transparent', color: defaultLayout === 'Column' ? eventColor : '#64748b'");

  // Override button
  block = block.replace(/color:'#7d3bec'/g, "color: eventColor");

  editor = editor.substring(0, layoutStart) + block + editor.substring(layoutEnd);
}

// 2. Reset button
editor = editor.replace(/border: '1px solid #bfdbfe', background: '#ffffff', color: '#7d3bec', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 1px 2px rgba\\(0,0,0,0\\.02\\)'/g,
  "border: `1px solid ${eventColor}50`, background: '#ffffff', color: eventColor, padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'");

// 3. Banners
const style1 = `<div style={{ background: '#eff6ff', border: '1px solid #dbeafe', color: '#7d3bec', padding: '10px 20px', borderRadius: '9999px', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(125, 59, 236, 0.08)' }}>`;
const style1Replacement = `<div style={{ background: \`\${eventColor}15\`, border: \`1px solid \${eventColor}30\`, color: eventColor, padding: '10px 20px', borderRadius: '9999px', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: \`0 2px 8px \${eventColor}14\` }}>`;

const style2 = `<div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#7d3bec', padding: '10px 24px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>`;
const style2Replacement = `<div style={{ background: \`\${eventColor}15\`, border: \`1px solid \${eventColor}30\`, color: eventColor, padding: '10px 24px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>`;

editor = editor.replaceAll(style1, style1Replacement);
editor = editor.replaceAll(style2, style2Replacement);

// 4. Available hours and Times shown pill
const target1 = `<div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>\\n                    <Clock size={18} color="#7d3bec" style={{ flexShrink: 0, marginTop: '2px' }} />\\n                    <div>\\n                      <div style={{ fontWeight: 600, color: '#1e40af', fontSize: '0.85rem', marginBottom: '2px' }}>Your available hours</div>\\n                      <div style={{ color: '#1e3a8a', fontSize: '0.82rem' }}>{getAvailabilitySummary()}</div>\\n                    </div>\\n                  </div>`;
const replace1 = `<div style={{ background: \`\${eventColor}15\`, border: \`1px solid \${eventColor}30\`, borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>\\n                    <Clock size={18} color={eventColor} style={{ flexShrink: 0, marginTop: '2px' }} />\\n                    <div>\\n                      <div style={{ fontWeight: 600, color: eventColor, fontSize: '0.85rem', marginBottom: '2px' }}>Your available hours</div>\\n                      <div style={{ color: \`\${eventColor}cc\`, fontSize: '0.82rem' }}>{getAvailabilitySummary()}</div>\\n                    </div>\\n                  </div>`;

const target2 = `<div style={{ background: '#eff6ff', border: '1px solid #dbeafe', color: '#7d3bec', padding: '8px 18px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>`;
const replace2 = `<div style={{ background: \`\${eventColor}15\`, border: \`1px solid \${eventColor}30\`, color: eventColor, padding: '8px 18px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>`;

editor = editor.replace(target1, replace1);
editor = editor.replace(target2, replace2);

fs.writeFileSync('f:/salemail-test/src/components/EventTypeEditor.tsx', editor);
console.log('Fixed all colors.');
