import { useState } from 'react'
import { Card, Avatar, Badge, Button, Input, SectionTitle, StatBox } from '../../components/shared/UI'

export default function FamilyProfile({ c, user, onLogout }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || 'Yaw Kofi',
    bio: 'Développeur et entrepreneur basé à Paris. Fier membre de la famille Kofi. 🌍',
    location: 'Paris, France',
    phone: '+33 6 00 00 00 00',
  })

  const INFO_ROWS = [
    ['👤', 'Rôle dans la famille', user?.role || 'Fils'],
    ['📍', 'Localisation', form.location],
    ['📞', 'Téléphone', form.phone],
    ['🌐', 'Cercle', `${c.tag} — ${c.name}`],
    ['📅', 'Membre depuis', 'Janvier 2025'],
  ]

  const SETTINGS = [
    { icon: '🔔', label: 'Notifications', desc: 'Gérer vos alertes' },
    { icon: '🔒', label: 'Confidentialité', desc: 'Qui peut vous voir' },
    { icon: '🔗', label: 'Lier des membres', desc: 'Connecter votre famille' },
    { icon: '🌐', label: 'Langue', desc: 'Français' },
    { icon: '📱', label: 'Appareils connectés', desc: '2 appareils' },
    { icon: '❓', label: 'Aide & Support', desc: 'FAQ et contact' },
  ]

  return (
    <div className="fade-in">
      {/* Profile header */}
      <Card c={c} style={{ marginBottom: 16, textAlign: 'center', background: `linear-gradient(180deg, ${c.color1}12, ${c.surface})` }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <div style={{
            width: 84, height: 84, borderRadius: '50%', margin: '0 auto',
            background: `linear-gradient(135deg, ${c.color1}44, ${c.color2}66)`,
            border: `3px solid ${c.color1}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42,
          }}>{user?.roleEmoji || '🧑🏿'}</div>
          <div style={{
            position: 'absolute', bottom: 2, right: 2,
            width: 20, height: 20, borderRadius: '50%',
            background: '#22c55e', border: `3px solid ${c.surface}`,
          }} />
        </div>

        <div style={{ fontSize: 22, fontWeight: 900, color: c.text, marginBottom: 4 }}>{form.name}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          <Badge label={user?.role || 'Fils'} color1={c.color1} />
          <Badge label="2ème génération" color1={c.color2} />
        </div>
        <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 14, lineHeight: 1.5, maxWidth: 280, margin: '0 auto 14px' }}>{form.bio}</div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
          <StatBox label="Membres" value="10" icon="👨‍👩‍👧" c={c} />
          <StatBox label="Groupes" value="4" icon="💬" c={c} />
          <StatBox label="Générations" value="3" icon="🌳" c={c} />
        </div>

        <Button c={c} small onClick={() => setEditing(!editing)}>
          {editing ? '✓ Sauvegarder' : '✏️ Modifier le profil'}
        </Button>
      </Card>

      {/* Edit form */}
      {editing && (
        <Card c={c} style={{ marginBottom: 16, border: `1px solid ${c.color1}44`, animation: 'slideUp 0.3s ease' }}>
          <div style={{ fontSize: 12, color: c.color1, fontFamily: 'monospace', marginBottom: 12 }}>MODIFIER MON PROFIL</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Nom complet" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} c={c} />
            <Input label="Localisation" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} c={c} />
            <Input label="Téléphone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} c={c} />
            <div>
              <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 6, fontFamily: 'monospace', letterSpacing: 0.5, textTransform: 'uppercase' }}>Bio</div>
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3}
                style={{ width: '100%', background: c.bg, border: `1px solid ${c.border}33`, borderRadius: 12, padding: '10px 14px', color: c.text, fontSize: 13, resize: 'none', outline: 'none', fontFamily: c.font }} />
            </div>
          </div>
        </Card>
      )}

      {/* Role selector */}
      <Card c={c} style={{ marginBottom: 16 }}>
        <SectionTitle c={c}>Mon rôle dans la famille</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {c.roles.map(role => (
            <div key={role.id} onClick={() => {}}
              style={{
                background: role.id === (user?.roleId || 'fils') ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.bg,
                border: `1px solid ${role.id === (user?.roleId || 'fils') ? 'transparent' : c.border + '33'}`,
                borderRadius: 20, padding: '7px 14px', fontSize: 13,
                color: role.id === (user?.roleId || 'fils') ? '#fff' : c.text,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
              {role.emoji} {role.label}
            </div>
          ))}
        </div>
      </Card>

      {/* Info */}
      <Card c={c} style={{ marginBottom: 16 }}>
        <SectionTitle c={c}>Informations</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {INFO_ROWS.map(([icon, label, value], i) => (
            <div key={label} style={{
              display: 'flex', gap: 12, alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < INFO_ROWS.length - 1 ? `1px solid ${c.border}12` : 'none',
            }}>
              <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: c.textMuted, fontFamily: 'monospace' }}>{label}</div>
                <div style={{ fontSize: 13, color: c.text, marginTop: 1 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Settings */}
      <Card c={c} style={{ marginBottom: 16 }}>
        <SectionTitle c={c}>Paramètres</SectionTitle>
        {SETTINGS.map((s, i) => (
          <div key={s.label} style={{
            display: 'flex', gap: 12, alignItems: 'center',
            padding: '12px 0', cursor: 'pointer',
            borderBottom: i < SETTINGS.length - 1 ? `1px solid ${c.border}12` : 'none',
          }}>
            <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{s.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: c.text }}>{s.label}</div>
              <div style={{ fontSize: 11, color: c.textMuted }}>{s.desc}</div>
            </div>
            <span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>
          </div>
        ))}
      </Card>

      {/* Logout */}
      <button onClick={onLogout} style={{
        width: '100%', background: '#1a0505', border: '1px solid #ef444433',
        borderRadius: 14, padding: '14px', color: '#ef4444',
        fontSize: 14, cursor: 'pointer', fontFamily: c.font,
        marginBottom: 20,
      }}>
        ⎋ Se déconnecter
      </button>
    </div>
  )
}
