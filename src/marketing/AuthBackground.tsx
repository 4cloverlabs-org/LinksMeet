import { useEffect, useRef, useState } from 'react';
import './AuthBackground.css';

export default function AuthBackground() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0, x3: 0, y3: 0 });

  useEffect(() => {
    const updateCoords = () => {
      if (!widgetRef.current || !dayRef.current || !timeRef.current || !confirmRef.current) return;
      
      const getLocalCenter = (el: HTMLElement) => {
        let top = 0;
        let left = 0;
        let current: HTMLElement | null = el;
        while (current && current !== widgetRef.current) {
          top += current.offsetTop;
          left += current.offsetLeft;
          current = current.offsetParent as HTMLElement | null;
        }
        // Offset by -5 and -2 so the tip of the SVG (at 5.5, 2) hits the exact center
        return {
          x: left + el.offsetWidth / 2 - 5,
          y: top + el.offsetHeight / 2 - 2
        };
      };

      const day = getLocalCenter(dayRef.current);
      const time = getLocalCenter(timeRef.current);
      const confirm = getLocalCenter(confirmRef.current);

      setCoords({
        x1: day.x, y1: day.y,
        x2: time.x, y2: time.y,
        x3: confirm.x, y3: confirm.y
      });
    };

    // Give it a tiny delay to ensure layout is completely painted before calculating
    setTimeout(updateCoords, 100);
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, []);

  return (
    <div className="auth-story-bg">
      {/* BOOKING WIDGET (Centered) */}
      <div 
        className="story-booking-widget real-ui" 
        ref={widgetRef}
        style={{
          '--x1': `${coords.x1}px`,
          '--y1': `${coords.y1}px`,
          '--x2': `${coords.x2}px`,
          '--y2': `${coords.y2}px`,
          '--x3': `${coords.x3}px`,
          '--y3': `${coords.y3}px`,
        } as React.CSSProperties}
      >
        
        {/* Header */}
        <div className="w-header">
          <div className="w-avatar">L</div>
          <div className="w-title-group">
            <div className="w-title">Product Demo</div>
            <div className="w-subtitle">30 min, Video Call</div>
          </div>
        </div>

        <div className="w-divider"></div>

        {/* Body */}
        <div className="w-body">
          {/* Left: Calendar */}
          <div className="w-left">
            <div className="w-month">October 2026</div>
            <div className="w-days-row">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>
            <div className="w-cal-grid">
              {Array.from({ length: 35 }).map((_, i) => {
                const dayNum = i + 1 - 4;
                const isValid = dayNum > 0 && dayNum <= 31;
                const isTarget = dayNum === 14;
                return (
                  <div 
                    key={i} 
                    ref={isTarget ? dayRef : null}
                    className={`w-day ${!isValid ? 'w-empty' : ''} ${isTarget ? 'target-day' : ''}`}
                  >
                    {isValid ? dayNum : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Times */}
          <div className="w-right">
            <div className="w-time-title">Wednesday, Oct 14</div>
            <div className="w-time-list">
              <div className="w-time-btn">9:00 AM</div>
              <div className="w-time-btn">9:30 AM</div>
              <div 
                className="w-time-btn target-time"
                ref={timeRef}
              >
                10:00 AM
              </div>
              <div className="w-time-btn">11:00 AM</div>
            </div>
            <div 
              className="w-confirm-btn target-confirm"
              ref={confirmRef}
            >
              Confirm
            </div>
          </div>
        </div>

        {/* Success Overlay */}
        <div className="w-success-overlay">
          <div className="w-check">✓</div>
          <div className="w-success-text">Meeting Scheduled!</div>
        </div>

        {/* The Animated Mouse Cursor */}
        <svg className="mock-cursor" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.5 2L18.5 14H12L9.5 21L5.5 2Z" fill="#111827" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      </div>
      
      {/* Floating decorative elements to add depth */}
      <div className="story-floating-bubble b1"></div>
      <div className="story-floating-bubble b2"></div>
      <div className="story-floating-bubble b3"></div>
    </div>
  );
}
