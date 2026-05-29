import { useState } from 'react'
import { Card, Avatar, Badge, Button, SectionTitle } from '../../components/shared/UI'

const GROUPS = [
  { id: 1, name: 'Famille Kofi 🏠', desc: 'Groupe principal de la famille Kofi', members: 10, unread: 3, lastMsg: 'On se retrouve bientôt !', lastTime: '10:32', emoji: '🏠', admin: 'Grand-père Jean' },
  { id: 2, name: 'Les cousins 🎉', desc: 'Groupe des cousins et cousines', members: 4, unread: 0, lastMsg: "C'est l'heure de fêter !", lastTime: 'Hier', emoji: '🎉', admin: 'Cousin Kwame' },
  { id: 3, name: 'Mamans & Papas 👨‍👩‍👧', desc: 'Groupe des parents de la famille', members: 3, unread: 7, lastMsg: 'Réunion dimanche 14h 📅', lastTime: '09:15', emoji: '👨‍👩‍👧', admin: 'Maman Ama' },
  { id: 4, name: 'Grands-parents ❤️', desc: 'Lien direct avec les grands-parents', members: 6, unread: 0, lastMsg: "Merci pour les photos d'anniversaire !", lastTime: 'Lundi', emoji: '❤️', admin: 'Grand-mère Marie' },
]

const EVENTS = [
  { id: 1, title: 'Retrouvailles au village', date: '15 Juin 2025', location: 'Village natal, Côte d\'Ivoire', emoji: '🏡', going: 8 },
  { id: 2, title: 'Anniversaire Grand-père Jean', date: '20 Juin 2025', location: 'Abidjan', emoji: '🎂', going: 10 },
  { id: 3, title: 'Réunion de famille virtuelle', date: '1 Juillet 2025', location: 'En ligne (Zoom)', emoji: '💻', going: 12 },
]

export default function FamilyGroups({ c, user }) {
  const [tab, setTab] = useState('groupes')
  const [showCreate, setShowCreate] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', desc: '' })

  return (
    <div className="fade-in">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['groupes', '👥 Groupes'], ['evenements', '📅 Événements']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, background: tab === id ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.surface,
            border: `1px solid ${tab === id ? 'transparent' : c.border + '33'}`,
            borderRadius: 12, padding: '10px', color: tab === id ? '#fff' : c.textMuted,
            fontSize: 13, fontWeight: tab === id ? 700 : 400, cursor: 'pointer', fontFamily: c.font,
          }}>{label}</button>
        ))}
      </div>

      {tab === 'groupes' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionTitle c={c}>Mes groupes ({GROUPS.length})</SectionTitle>
            <Button c={c} small onClick={() => setShowCreate(!showCreate)}>+ Créer</Button>
          </div>

          {/* Create form */}
          {showCreate && (
            <Card c={c} style={{ marginBottom: 16, border: `1px solid ${c.color1}44`, animation: 'slideUp 0.3s ease' }}>
              <div style={{ fontSize: 13, color: c.color1, fontFamily: 'monospace', marginBottom: 12 }}>NOUVEAU GROUPE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input placeholder="Nom du groupe" value={newGroup.name}
                  onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))}
                  style={{ background: c.bg, border: `1px solid ${c.border}33`, borderRadius: 10, padding: '10px 14px', color: c.text, fontSize: 13, outline: 'none' }} />
                <input placeholder="Description (optionnelle)" value={newGroup.desc}
                  onChange={e => setNewGroup(p => ({ ...p, desc: e.target.value }))}
                  style={{ background: c.bg, border: `1px solid ${c.border}33`, borderRadius: 10, padding: '10px 14px', color: c.text, fontSize: 13, outline: 'none' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button c={c} small full onClick={() => setShowCreate(false)}>Créer le groupe ✓</Button>
                  <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: 13, cursor: 'pointer', padding: '0 8px' }}>Annuler</button>
                </div>
              </div>
            </Card>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {GROUPS.map(g => (
              <Card key={g.id} c={c} onClick={() => {}}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                    background: `linear-gradient(135deg, ${c.color1}22, ${c.color2}44)`,
                    border: `1px solid ${c.border}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  }}>{g.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{g.name}</div>
                      {g.unread > 0 && (
                        <div style={{
                          background: c.color1, borderRadius: '50%', width: 18, height: 18,
                          fontSize: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'monospace', fontWeight: 700, flexShrink: 0,
                        }}>{g.unread}</div>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 4 }}>{g.desc}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: c.textSubtle }}>
                      <span>👥 {g.members} membres</span>
                      <span>⏱ {g.lastTime}</span>
                    </div>
                    <div style={{ fontSize: 12, color: c.textMuted, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{g.lastMsg}"
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Invite card */}
            <div style={{
              background: 'transparent', border: `1px dashed ${c.border}44`,
              borderRadius: 16, padding: 20, textAlign: 'center', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>👨‍👩‍👧‍👦</div>
              <div style={{ fontSize: 13, color: c.text, marginBottom: 4 }}>Inviter de la famille</div>
              <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 12 }}>Partage un lien d'invitation unique</div>
              <button style={{
                background: `linear-gradient(135deg, ${c.color1}22, ${c.color2}22)`,
                border: `1px solid ${c.border}44`, borderRadius: 20,
                padding: '6px 16px', fontSize: 12, color: c.color1, cursor: 'pointer',
              }}>🔗 Copier le lien</button>
            </div>
          </div>
        </>
      )}

      {tab === 'evenements' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionTitle c={c}>Événements à venir</SectionTitle>
            <Button c={c} small>+ Créer</Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {EVENTS.map(ev => (
              <Card key={ev.id} c={c}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: 14, flexShrink: 0,
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
                      <Button c={c} small>Je participe ✓</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
