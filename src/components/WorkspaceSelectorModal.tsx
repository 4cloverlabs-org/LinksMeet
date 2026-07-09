import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { Briefcase, User as UserIcon, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function WorkspaceSelectorModal() {
  const { workspaces, setActiveWorkspaceId, setNeedsWorkspaceSelection } = useAuth();

  const handleSelect = (id: string) => {
    setActiveWorkspaceId(id);
    setNeedsWorkspaceSelection(false);
    window.location.reload(); // Ensure everything boots up cleanly with the new workspace
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setNeedsWorkspaceSelection(false);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: '#FFFFFF', padding: '32px', borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        width: '100%', maxWidth: '440px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            background: '#EEF2FF', width: '56px', height: '56px', borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: '#4F46E5'
          }}>
            <Briefcase size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
            Choose your Workspace
          </h2>
          <p style={{ color: '#6B7280', fontSize: '15px', margin: 0 }}>
            Select the team or personal workspace you want to enter.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', padding: '4px' }}>
          {workspaces.map(w => (
            <button
              key={w.id}
              onClick={() => handleSelect(w.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px', background: '#FFFFFF', border: '1px solid #E5E7EB',
                borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4F46E5';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(79, 70, 229, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                background: w.role === 'Owner' ? '#F0FDF4' : '#F3F4F6',
                color: w.role === 'Owner' ? '#16A34A' : '#4B5563',
                padding: '10px', borderRadius: '10px'
              }}>
                {w.role === 'Owner' ? <UserIcon size={20} /> : <Briefcase size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>{w.name}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                  {w.role === 'Owner' ? 'Personal Account' : `Team Member (${w.role})`}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
