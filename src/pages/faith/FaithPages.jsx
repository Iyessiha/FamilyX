import { useState } from 'react'
import { Card, Avatar, Badge, Button, SectionTitle, StatBox, Input } from '../../components/shared/UI'
import { StoriesBar } from '../../components/shared/Stories'

// ── FAITH HOME ────────────────────────────────────────────────────────────────
const FAITH_FEED = [
  { id: 1, author: 'Imam Diallo', emoji: '🧕', role: 'Imam', time: 'Il y a 1h', content: 'La prière du vendredi est fixée à 13h30. Que la paix soit sur vous tous 🤲', likes: 34, type: 'annonce' },
  { id: 2, author: 'Sœur Fatima', emoji: '🌿', role: 'Responsable', time: 'Il y a 3h', content: '📖 Verset du jour : "Et Il est avec vous, où que vous soyez." — Sourate Al-Hadid', likes: 28, type: 'verset' },
  { id: 3, author: 'Frère Moussa', emoji: '🙏', role: 'Diacre', time: 'Hier', content: 'Rappel : collecte pour les familles dans le besoin ce dimanche. Soyons généreux 💚', likes: 19, type: 'rappel' },
]

export function FaithHome({ c, user }) {
  const [liked, setLiked] = useState({})

  return (
    <div className="fade-in">
      {/* Stories */}
      <StoriesBar c={c} user={user} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <StatBox label="Membres" value="86" icon="🕌" c={c} />
        <StatBox label="Groupes" value="7" icon="📿" c={c} />
        <StatBox label="Événements" value="3" icon="📅" c={c} />
      </div>

      {/* Daily prayer times */}
      <Card c={c} style={{ marginBottom: 20, background: `linear-gradient(135deg, ${c.color1}12, ${c.bg})`, border: `1px solid ${c.color1}44` }}>
        <div style={{ fontSize: 12, color: c.color1, fontFamily: 'monospace', marginBottom: 10 }}>🕌 HORAIRES DE PRIÈRE DU JOUR</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[['Fajr', '05:12'], ['Dhuhr', '13:24'], ['Asr', '17:05'], ['Maghrib', '20:48'], ['Isha', '22:20']].map(([name, time]) => (
            <div key={name} style={{
              flex: 1, minWidth: 60, background: c.surface, borderRadius: 10, padding: '8px 6px', textAlign: 'center',
              border: `1px solid ${c.border}22`,
            }}>
              <div style={{ fontSize: 10, color: c.textMuted, marginBottom: 2 }}>{name}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.color1 }}>{time}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Verset du jour */}
      <Card c={c} style={{ marginBottom: 20, textAlign: 'center', border: `1px solid ${c.border}33` }}>
        <div style={{ fontSize: 11, color: c.color1, fontFamily: 'monospace', marginBottom: 10 }}>📖 VERSET DU JOUR</div>
        <div style={{ fontSize: 20, color: c.text, marginBottom: 8, lineHeight: 1.6, fontFamily: "'Playfair Display', serif" }}>
          "Certes, avec la difficulté vient la facilité."
        </div>
        <div style={{ fontSize: 12, color: c.textMuted }}>— Sourate Al-Inshirah, 94:6</div>
      </Card>

      <SectionTitle c={c}>Publications de la communauté</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {FAITH_FEED.map(post => (
          <Card key={post.id} c={c}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: `linear-gradient(135deg, ${c.color1}33, ${c.color2}55)`,
                border: `2px solid ${c.color1}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>{post.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{post.author}</div>
                <div style={{ fontSize: 11, color: c.color1 }}>{post.role} · {post.time}</div>
              </div>
              <Badge label={post.type} color1={c.color1} small />
            </div>
            <div style={{ background: c.bg, borderRadius: 10, padding: '12px 14px', fontSize: 14, color: c.text, lineHeight: 1.7, marginBottom: 10, border: `1px solid ${c.border}18` }}>
              {post.content}
            </div>
            <div style={{ display: 'flex', gap: 12, borderTop: `1px solid ${c.border}18`, paddingTop: 8 }}>
              <button onClick={() => setLiked(p => ({ ...p, [post.id]: !p[post.id] }))} style={{ background: 'none', border: 'none', color: liked[post.id] ? c.color1 : c.textMuted, fontSize: 13, cursor: 'pointer', display: 'flex', gap: 5, alignItems: 'center', fontFamily: 'inherit' }}>
                {liked[post.id] ? '💚' : '🤍'} {post.likes + (liked[post.id] ? 1 : 0)}
              </button>
              <button style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>💬 Commenter</button>
              <button style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: 13, cursor: 'pointer', marginLeft: 'auto', fontFamily: 'inherit' }}>↗ Partager</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── FAITH MEMBERS ─────────────────────────────────────────────────────────────
const FAITH_MEMBERS = [
  { id: 1, name: 'Imam Diallo', emoji: '🧕', role: 'Imam', location: 'Paris 18e', online: true, joined: 'Fondateur' },
  { id: 2, name: 'Sœur Fatima', emoji: '🌿', role: 'Responsable', location: 'Paris 19e', online: true, joined: 'Jan 2023' },
  { id: 3, name: 'Frère Moussa', emoji: '🙏', role: 'Diacre', location: 'Saint-Denis', online: false, joined: 'Mar 2023' },
  { id: 4, name: 'Frère Youssef', emoji: '📖', role: 'Ancien', location: 'Bobigny', online: true, joined: 'Fév 2023' },
  { id: 5, name: 'Sœur Aminata', emoji: '⭐', role: 'Choriste', location: 'Clichy', online: false, joined: 'Avr 2023' },
  { id: 6, name: 'Frère Ibrahim', emoji: '🌿', role: 'Fidèle', location: 'Aubervilliers', online: true, joined: 'Mai 2023' },
]

export function FaithMembers({ c }) {
  const [search, setSearch] = useState('')
  const filtered = FAITH_MEMBERS.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un membre…"
          style={{ flex: 1, background: c.surface, border: `1px solid ${c.border}33`, borderRadius: 12, padding: '10px 16px', color: c.text, fontSize: 13, outline: 'none' }} />
        <Button c={c} small>+ Inviter</Button>
      </div>

      <SectionTitle c={c}>Membres de la communauté ({filtered.length})</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(m => (
          <Card key={m.id} c={c}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Avatar name={m.name} emoji={m.emoji} size={48} color1={c.color1} color2={c.color2} online={m.online} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{m.name}</div>
                <div style={{ fontSize: 12, color: c.color1 }}>{m.role}</div>
                <div style={{ fontSize: 11, color: c.textMuted }}>📍 {m.location} · Depuis {m.joined}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Button c={c} small>💬</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── FAITH EVENTS ──────────────────────────────────────────────────────────────
const FAITH_EVENTS = [
  { id: 1, title: 'Prière du vendredi', date: '14 Juin 2025 — 13h30', location: 'Mosquée Al-Nour', emoji: '🕌', type: 'hebdo', going: 45 },
  { id: 2, title: 'Cours de Coran — Débutants', date: '15 Juin 2025 — 10h00', location: 'Salle communautaire', emoji: '📖', type: 'cours', going: 12 },
  { id: 3, title: 'Collecte solidarité', date: '16 Juin 2025', location: 'Devant la mosquée', emoji: '💚', type: 'action', going: 30 },
  { id: 4, title: 'Conférence islamique', date: '22 Juin 2025 — 15h00', location: 'Salle des fêtes', emoji: '🎙️', type: 'conference', going: 80 },
]

export function FaithEvents({ c }) {
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionTitle c={c}>Événements à venir</SectionTitle>
        <Button c={c} small>+ Créer</Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FAITH_EVENTS.map(ev => (
          <Card key={ev.id} c={c}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                background: `linear-gradient(135deg, ${c.color1}18, ${c.color2}33)`,
                border: `1px solid ${c.border}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
              }}>{ev.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 4 }}>{ev.title}</div>
                <div style={{ fontSize: 12, color: c.color1, marginBottom: 2 }}>📅 {ev.date}</div>
                <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 8 }}>📍 {ev.location}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Badge label={`${ev.going} participants`} color1={c.color1} small />
                  <Button c={c} small>Je participe</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── FAITH PROFILE ─────────────────────────────────────────────────────────────
export function FaithProfile({ c, user, onLogout }) {
  const [editing, setEditing] = useState(false)

  return (
    <div className="fade-in">
      <Card c={c} style={{ marginBottom: 16, textAlign: 'center', background: `linear-gradient(180deg, ${c.color1}10, ${c.surface})` }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
          background: `linear-gradient(135deg, ${c.color1}44, ${c.color2}66)`,
          border: `3px solid ${c.color1}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40,
        }}>{user?.roleEmoji || '🌿'}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: c.text, marginBottom: 4 }}>{user?.name || 'Membre'}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
          <Badge label={user?.role || 'Fidèle'} color1={c.color1} />
          <Badge label={c.tag} color1={c.color2} />
        </div>
        <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 14 }}>Membre actif de la communauté 🤲</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 14 }}>
          <StatBox label="Présences" value="42" icon="✅" c={c} />
          <StatBox label="Groupes" value="3" icon="📿" c={c} />
          <StatBox label="Actions" value="8" icon="💚" c={c} />
        </div>
        <Button c={c} small onClick={() => setEditing(!editing)}>✏️ Modifier</Button>
      </Card>

      <Card c={c} style={{ marginBottom: 16 }}>
        <SectionTitle c={c}>Mon rôle</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {c.roles.map(role => (
            <div key={role.id} style={{
              background: role.id === (user?.roleId || 'fidele') ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.bg,
              border: `1px solid ${role.id === (user?.roleId || 'fidele') ? 'transparent' : c.border + '33'}`,
              borderRadius: 20, padding: '7px 14px', fontSize: 12,
              color: role.id === (user?.roleId || 'fidele') ? '#fff' : c.text,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            }}>{role.emoji} {role.label}</div>
          ))}
        </div>
      </Card>

      {[
        ['🔔', 'Notifications de prière'],
        ['📍', 'Ma mosquée / église'],
        ['🔒', 'Confidentialité'],
        ['❓', 'Aide'],
      ].map(([icon, label], i, arr) => (
        <Card key={label} c={c} style={{ marginBottom: 8, cursor: 'pointer' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ flex: 1, fontSize: 14, color: c.text }}>{label}</span>
            <span style={{ color: c.textSubtle }}>›</span>
          </div>
        </Card>
      ))}

      <button onClick={onLogout} style={{
        width: '100%', background: '#1a0505', border: '1px solid #ef444433',
        borderRadius: 14, padding: '14px', color: '#ef4444', fontSize: 14,
        cursor: 'pointer', fontFamily: c.font, marginTop: 8, marginBottom: 20,
      }}>⎋ Se déconnecter</button>
    </div>
  )
}
