import sys

with open('src/pages/BookingPage.tsx', 'r', encoding='utf-8') as f:
    txt = f.read()

# Replace monthIdx and setMonthIdx
old_buttons = """              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{MONTHS[monthIdx]}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setMonthIdx(Math.max(0, monthIdx - 1))}
                  style={{ width: '30px', height: '30px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}
                >&lt;</button>
                <button
                  type="button"
                  onClick={() => setMonthIdx(Math.min(MONTHS.length - 1, monthIdx + 1))}
                  style={{ width: '30px', height: '30px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}
                >&gt;</button>
              </div>"""

new_buttons = """              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{currentMonthName} {currentYear}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                    else { setCurrentMonth(m => m - 1); }
                  }}
                  style={{ width: '30px', height: '30px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}
                >&lt;</button>
                <button
                  type="button"
                  onClick={() => {
                    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                    else { setCurrentMonth(m => m + 1); }
                  }}
                  style={{ width: '30px', height: '30px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}
                >&gt;</button>
              </div>"""

txt = txt.replace(old_buttons, new_buttons)

with open('src/pages/BookingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(txt)
