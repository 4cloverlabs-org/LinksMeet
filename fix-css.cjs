const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'pages', 'CrmDashboard.css');

// Read raw bytes
const buffer = fs.readFileSync(cssPath);

// Convert to string assuming it's mostly ascii, but removing NULL bytes 
// which were introduced by PowerShell's UTF-16LE append.
let text = '';
for (let i = 0; i < buffer.length; i++) {
  if (buffer[i] !== 0) {
    text += String.fromCharCode(buffer[i]);
  }
}

const marker = '/* ---------- Booking Page Embedded Widget ---------- */';
const idx = text.indexOf(marker);
if (idx !== -1) {
  text = text.substring(0, idx);
}

text += `
/* ---------- Booking Page Embedded Widget ---------- */
.bk-widget-page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #fafafb;
  min-height: 100vh;
}
.bk-widget-page.is-embedded {
  padding: 0;
  background: transparent;
  min-height: 0;
  height: 100%;
}
.bk-widget-card {
  background: #fff;
  display: flex;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  max-width: 1000px;
  min-height: 600px;
  width: 100%;
  box-shadow: 0 12px 40px rgba(0,0,0,0.06);
}
.bk-widget-page.is-embedded .bk-widget-card {
  border-radius: 0;
  border: none;
  box-shadow: none;
  min-height: 0;
  height: 100%;
}
.bk-widget-left {
  flex: 0 0 320px;
  padding: 40px;
  border-right: 1px solid #e5e7eb;
  background: #fff;
}
.bk-widget-right {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
}
@media (max-width: 768px) {
  .bk-widget-card {
    flex-direction: column;
    min-height: auto;
  }
  .bk-widget-left {
    flex: none;
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding: 30px;
  }
  .bk-widget-right {
    padding: 30px;
  }
}
`;

fs.writeFileSync(cssPath, text, 'utf8');
console.log("CSS Fixed!");
