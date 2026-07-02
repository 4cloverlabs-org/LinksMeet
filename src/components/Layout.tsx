import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('linksmeet_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('linksmeet_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid hsl(var(--border-color))', backgroundColor: 'rgba(hsl(var(--bg-secondary)), 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '70px' }}>
          <button 
            onClick={toggleTheme} 
            style={{
              background: 'none',
              border: '1px solid hsl(var(--border-color))',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'hsl(var(--text-primary))',
              transition: 'all var(--transition-fast)'
            }}
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      {!isAdmin && (
        <footer style={{ borderTop: '1px solid hsl(var(--border-color))', padding: '30px 0', backgroundColor: 'hsl(var(--bg-secondary))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              &copy; {new Date().getFullYear()} LinksMeet Inc. Built for premium meetings.
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Book a Slot</Link>
              <Link to="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard Settings</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
