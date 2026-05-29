import { useState } from 'react'
import { Avatar, Badge } from './UI'

export function AppShell({ c, user, children, activeTab, onTabChange, tabs }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: c.bg, fontFamily: c.font }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, background: c.bgSecond,
        borderRight: `1px solid ${c.border}22`,
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        transition: 'transform 0.3s',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}
        className="sidebar"
      >
        <SidebarContent c={c} user={user} tabs={tabs} activeTab={activeTab} onTabChange={(t) => { onTabChange(t); setSidebarOpen(false) }} />
      </aside>

      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: '#00000088', zIndex: 40,
        }} />
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top bar */}
        <header style={{
          background: c.bgSecond, borderBottom: `1px solid ${c.border}22`,
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{
            background: c.surface, border: `1px solid ${c.border}22`,
            borderRadius: 10, width: 36, height: 36,
            color: c.text, fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>☰</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>{c.emoji}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: c.text, lineHeight: 1 }}>{c.tag}</div>
              <div style={{ fontSize: 10, color: c.textMuted, fontFamily: 'monospace' }}>{c.name}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <NotifBell c={c} />
            <Avatar name={user?.name} emoji={user?.roleEmoji} size={34} color1={c.color1} color2={c.color2} online={true} />
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '20px 16px', paddingBottom: 80, maxWidth: 900, width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      {/* Bottom mobile nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: c.bgSecond, borderTop: `1px solid ${c.border}22`,
        display: 'flex', padding: '6px 0 10px',
        zIndex: 60,
      }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
            flex: 1, background: 'none', border: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '4px 0',
          }}>
            <div style={{
              fontSize: 20,
              filter: activeTab === tab.id ? 'none' : 'grayscale(80%) opacity(0.45)',
              transform: activeTab === tab.id ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.2s',
            }}>{tab.icon}</div>
            <div style={{
              fontSize: 9, fontFamily: 'monospace',
              color: activeTab === tab.id ? c.color1 : c.textSubtle,
              transition: 'color 0.2s',
            }}>{tab.label}</div>
          </button>
        ))}
      </nav>

      <style>{`
        @media(min-width:768px){
          .sidebar { transform: translateX(0) !important; }
          main { margin-left: 240px !important; }
          header { margin-left: 240px; }
          nav { display: none; }
        }
      `}</style>
    </div>
  )
}

function SidebarContent({ c, user, tabs, activeTab, onTabChange }) {
  return (
    <>
      {/* Brand */}
      <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${c.border}18` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>{c.emoji}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: c.text }}>{c.tag}</div>
            <div style={{ fontSize: 10, color: c.textMuted, fontFamily: 'monospace' }}>{c.name}</div>
          </div>
        </div>
        {/* User card */}
        <div style={{
          background: c.surface, borderRadius: 12, padding: '10px 12px',
          display: 'flex', gap: 10, alignItems: 'center',
          border: `1px solid ${c.border}22`,
        }}>
          <Avatar name={user?.name} emoji={user?.roleEmoji} size={36} color1={c.color1} color2={c.color2} online={true} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: c.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: c.color1 }}>{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 12px', borderRadius: 12, border: 'none',
            background: activeTab === tab.id ? `${c.color1}18` : 'transparent',
            color: activeTab === tab.id ? c.color1 : c.textMuted,
            fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400,
            cursor: 'pointer', marginBottom: 2,
            transition: 'all 0.15s',
            textAlign: 'left',
            fontFamily: c.font,
          }}>
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{tab.icon}</span>
            {tab.label}
            {tab.badge && (
              <span style={{
                marginLeft: 'auto', background: c.color1, color: '#fff',
                borderRadius: '50%', width: 18, height: 18,
                fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'monospace',
              }}>{tab.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 10px', borderTop: `1px solid ${c.border}18` }}>
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 12, border: 'none',
          background: 'transparent', color: '#ef4444', fontSize: 13,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>⎋ Déconnexion</button>
      </div>
    </>
  )
}

function NotifBell({ c }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        background: c.surface, border: `1px solid ${c.border}22`,
        borderRadius: 10, width: 36, height: 36, fontSize: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        🔔
        <span style={{
          position: 'absolute', top: 4, right: 4,
          width: 8, height: 8, borderRadius: '50%',
          background: '#ef4444', border: `2px solid ${c.bgSecond}`,
        }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 44, right: 0,
          background: c.bgSecond, border: `1px solid ${c.border}33`,
          borderRadius: 14, padding: 14, width: 280, zIndex: 100,
          boxShadow: `0 12px 40px #00000099`,
        }}>
          <div style={{ fontSize: 12, color: c.color1, marginBottom: 10, fontFamily: 'monospace' }}>NOTIFICATIONS</div>
          {['Nouveau membre a rejoint', 'Message de Kofi Ama', 'Événement demain à 14h'].map((n, i) => (
            <div key={i} style={{
              padding: '8px 0', borderBottom: i < 2 ? `1px solid ${c.border}18` : 'none',
              fontSize: 13, color: c.text, display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <span>🔵</span> {n}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
