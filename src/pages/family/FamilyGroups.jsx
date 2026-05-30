import { useState, useEffect, useRef } from 'react'
import { Card, Avatar, Badge, Button, SectionTitle } from '../../components/shared/UI'
import { getAllCircleMembers } from '../../utils/authStore'
import { getGroupMessages, sendGroupMessage } from '../../utils/messageStore'

const GRP_KEY = 'familyx_groups'

function getGroups(circleId) {
  try {
    const all = JSON.parse(localStorage.getItem(GRP_KEY) || '{}')
    if (!all[circleId]) {
      all[circleId] = [
        { id: `${circleId}_g1`, name: 'Groupe principal 🏠', desc: 'Canal général du cercle', members: [], admin: null, createdAt: Date.now() - 86400000 * 10, emoji: '🏠' },
      ]
      localStorage.setItem(GRP_KEY, JSON.stringify(all))
    }
    return all[circleId]
  } catch { return [] }
}

function saveGroups(circleId, groups) {
  try {
    const all = JSON.parse(localStorage.getItem(GRP_KEY) || '{}')
    all[circleId] = groups
    localStorage.setItem(GRP_KEY, JSON.stringify(all))
  } catch {}
}

const EVENTS_KEY = 'familyx_events'
function getEvents(circleId) {
  try {
    const all = JSON.parse(localStorage.getItem(EVENTS_KEY) || '{}')
    return all[circleId] || [
      { id: 'ev1', title: 'Réunion familiale', date: '15 Juin 2025', location: 'Abidjan', emoji: '🏡', going: [], maybe: [], createdAt: Date.now() - 86400000 * 2 },
      { id: 'ev2', title: 'Anniversaire', date: '20 Juin 2025', location: 'Paris', emoji: '🎂', going: [], maybe: [], createdAt: Date.now() - 86400000 },
    ]
  } catch { return [] }
}
function saveEvents(circleId, events) {
  try {
    const all = JSON.parse(localStorage.getItem(EVENTS_KEY) || '{}')
    all[circleId] = events
    localStorage.setItem(EVENTS_KEY, JSON.stringify(all))
  } catch {}
}

function timeAgo(ts) {
  const d = Date.now() - ts, m = Math.floor(d / 60000), h = Math.floor(d / 3600000)
  if (h > 0) return `${h}h`; if (m > 0) return `${m}min`; return 'maintenant'
}

// ── Group Chat ────────────────────────────────────────────────────────────────
function GroupChat({ group, c, user, onBack }) {
  const [messages, setMessages] = useState(() => getGroupMessages(group.id))
  const [input, setInput] = useState('')
  const bottomRef = useRef()

  useEffect(() => {
    const interval = setInterval(() => setMessages(getGroupMessages(group.id)), 1000)
    return () => clearInterval(interval)
  }, [group.id])

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [messages.length])

  const send = () => {
    if (!input.trim()) return
    sendGroupMessage(group.id, user.id, user.name, user.roleEmoji, input.trim())
    setInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', background: c.surface, borderRadius: 16, border: `1px solid ${c.border}22`, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${c.border}18`, display: 'flex', gap: 10, alignItems: 'center', background: c.bg }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: 18, cursor: 'pointer' }}>←</button>
        <span style={{ fontSize: 22 }}>{group.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{group.name}</div>
          <div style={{ fontSize: 11, color: c.textMuted }}>{group.members?.length || 0} membres</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: c.textMuted, fontSize: 13, marginTop: 30 }}>Aucun message — démarrez la conversation ! 👋</div>
        )}
        {messages.map(msg => {
          const isMe = msg.fromId === user.id
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 6, alignItems: 'flex-end' }}>
              {!isMe && <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${c.color1}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{msg.fromEmoji}</div>}
              <div style={{ maxWidth: '72%' }}>
                {!isMe && <div style={{ fontSize: 10, color: c.textMuted, marginBottom: 2, marginLeft: 4 }}>{msg.fromName}</div>}
                <div style={{ background: isMe ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.bg, border: isMe ? 'none' : `1px solid ${c.border}22`, borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '8px 12px', fontSize: 13, color: isMe ? '#fff' : c.text, wordBreak: 'break-word' }}>{msg.text}</div>
                <div style={{ fontSize: 9, color: c.textSubtle, textAlign: isMe ? 'right' : 'left', marginTop: 2 }}>{timeAgo(msg.createdAt)}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: '8px 12px', borderTop: `1px solid ${c.border}18`, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Message au groupe…"
          style={{ flex: 1, background: c.bg, border: `1px solid ${c.border}22`, borderRadius: 22, padding: '9px 14px', color: c.text, fontSize: 13, outline: 'none' }} />
        <button onClick={send} disabled={!input.trim()} style={{ background: input.trim() ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.surface, border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', fontSize: 16, cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: input.trim() ? 1 : 0.4 }}>➤</button>
      </div>
    </div>
  )
}

// ── Main Groups Page ──────────────────────────────────────────────────────────
export default function FamilyGroups({ c, user }) {
  const [tab, setTab] = useState('groupes')
  const [groups, setGroups] = useState(() => getGroups(user.circleId))
  const [events, setEvents] = useState(() => getEvents(user.circleId))
  const [activeGroup, setActiveGroup] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', desc: '', emoji: '👥' })
  const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', emoji: '📅' })
  const members = getAllCircleMembers(user.circleId)

  if (activeGroup) return <GroupChat group={activeGroup} c={c} user={user} onBack={() => setActiveGroup(null)} />

  const createGroup = () => {
    if (!newGroup.name.trim()) return
    const g = { id: `${user.circleId}_g${Date.now()}`, name: newGroup.name, desc: newGroup.desc, emoji: newGroup.emoji, members: [user.id], admin: user.id, createdAt: Date.now() }
    const updated = [...groups, g]
    setGroups(updated)
    saveGroups(user.circleId, updated)
    setNewGroup({ name: '', desc: '', emoji: '👥' })
    setShowCreate(false)
  }

  const createEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return
    const ev = { id: 'ev' + Date.now(), ...newEvent, going: [user.id], maybe: [], createdAt: Date.now() }
    const updated = [...events, ev]
    setEvents(updated)
    saveEvents(user.circleId, updated)
    setNewEvent({ title: '', date: '', location: '', emoji: '📅' })
    setShowCreateEvent(false)
  }

  const toggleGoing = (evId) => {
    const updated = events.map(ev => {
      if (ev.id !== evId) return ev
      const going = ev.going.includes(user.id) ? ev.going.filter(id => id !== user.id) : [...ev.going, user.id]
      return { ...ev, going }
    })
    setEvents(updated)
    saveEvents(user.circleId, updated)
  }

  const inp = { background: c.bg, border: `1px solid ${c.border}33`, borderRadius: 10, padding: '10px 14px', color: c.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }
  const EMOJIS = ['👥','🏠','🎉','❤️','💼','⭐','🌍','🎂','📚','🎯']

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {[['groupes', '👥 Groupes'], ['evenements', '📅 Événements']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, background: tab === id ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.surface, border: `1px solid ${tab === id ? 'transparent' : c.border + '33'}`, borderRadius: 12, padding: '10px', color: tab === id ? '#fff' : c.textMuted, fontSize: 13, fontWeight: tab === id ? 700 : 400, cursor: 'pointer', fontFamily: c.font }}>{label}</button>
        ))}
      </div>

      {tab === 'groupes' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionTitle c={c}>Mes groupes ({groups.length})</SectionTitle>
            <Button c={c} small onClick={() => setShowCreate(!showCreate)}>+ Créer</Button>
          </div>

          {showCreate && (
            <Card c={c} style={{ marginBottom: 14, border: `1px solid ${c.color1}44`, animation: 'slideUp 0.3s ease' }}>
              <div style={{ fontSize: 12, color: c.color1, fontFamily: 'monospace', marginBottom: 10 }}>NOUVEAU GROUPE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 6, fontFamily: 'monospace' }}>ICÔNE</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => setNewGroup(p => ({ ...p, emoji: e }))} style={{ background: newGroup.emoji === e ? `${c.color1}22` : c.surface, border: `2px solid ${newGroup.emoji === e ? c.color1 : c.border + '22'}`, borderRadius: 10, width: 36, height: 36, fontSize: 18, cursor: 'pointer' }}>{e}</button>
                    ))}
                  </div>
                </div>
                <input placeholder="Nom du groupe *" value={newGroup.name} onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))} style={inp} />
                <input placeholder="Description (optionnel)" value={newGroup.desc} onChange={e => setNewGroup(p => ({ ...p, desc: e.target.value }))} style={inp} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button c={c} small full onClick={createGroup}>Créer ✓</Button>
                  <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: c.textMuted, cursor: 'pointer', fontSize: 13, fontFamily: c.font }}>Annuler</button>
                </div>
              </div>
            </Card>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {groups.map(g => {
              const msgs = getGroupMessages(g.id)
              const lastMsg = msgs[msgs.length - 1]
              return (
                <Card key={g.id} c={c} onClick={() => setActiveGroup(g)}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${c.color1}22, ${c.color2}44)`, border: `1px solid ${c.border}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{g.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 2 }}>{g.name}</div>
                      <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 4 }}>{g.desc}</div>
                      <div style={{ fontSize: 11, color: c.textSubtle }}>
                        {lastMsg ? `${lastMsg.fromName}: ${lastMsg.text}` : 'Aucun message encore'}
                      </div>
                    </div>
                    <div style={{ fontSize: 18, color: c.textSubtle }}>›</div>
                  </div>
                </Card>
              )
            })}

            {/* Invite card */}
            <div style={{ background: 'transparent', border: `1px dashed ${c.border}44`, borderRadius: 14, padding: 18, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>🔗</div>
              <div style={{ fontSize: 13, color: c.text, marginBottom: 4 }}>Inviter par lien</div>
              <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 10 }}>Partagez votre ID : <strong style={{ color: c.color1, fontFamily: 'monospace' }}>{user.id}</strong></div>
              <button onClick={() => { navigator.clipboard.writeText(user.id); alert('ID copié !') }} style={{ background: `${c.color1}22`, border: `1px solid ${c.color1}44`, borderRadius: 20, padding: '6px 16px', fontSize: 12, color: c.color1, cursor: 'pointer' }}>📋 Copier mon ID</button>
            </div>
          </div>
        </>
      )}

      {tab === 'evenements' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <SectionTitle c={c}>Événements à venir</SectionTitle>
            <Button c={c} small onClick={() => setShowCreateEvent(!showCreateEvent)}>+ Créer</Button>
          </div>

          {showCreateEvent && (
            <Card c={c} style={{ marginBottom: 14, border: `1px solid ${c.color1}44`, animation: 'slideUp 0.3s ease' }}>
              <div style={{ fontSize: 12, color: c.color1, fontFamily: 'monospace', marginBottom: 10 }}>NOUVEL ÉVÉNEMENT</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['📅','🎂','🏡','✈️','🎉','🙏','💼','⭐'].map(e => (
                    <button key={e} onClick={() => setNewEvent(p => ({ ...p, emoji: e }))} style={{ background: newEvent.emoji === e ? `${c.color1}22` : c.surface, border: `2px solid ${newEvent.emoji === e ? c.color1 : c.border + '22'}`, borderRadius: 10, width: 36, height: 36, fontSize: 18, cursor: 'pointer' }}>{e}</button>
                  ))}
                </div>
                <input placeholder="Titre *" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} style={inp} />
                <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))} style={inp} />
                <input placeholder="Lieu" value={newEvent.location} onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} style={inp} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button c={c} small full onClick={createEvent}>Créer ✓</Button>
                  <button onClick={() => setShowCreateEvent(false)} style={{ background: 'none', border: 'none', color: c.textMuted, cursor: 'pointer', fontSize: 13, fontFamily: c.font }}>Annuler</button>
                </div>
              </div>
            </Card>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {events.map(ev => {
              const isGoing = ev.going.includes(user.id)
              return (
                <Card key={ev.id} c={c}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${c.color1}18, ${c.color2}33)`, border: `1px solid ${c.border}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{ev.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 4 }}>{ev.title}</div>
                      <div style={{ fontSize: 12, color: c.color1, marginBottom: 2 }}>📅 {ev.date}</div>
                      {ev.location && <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 8 }}>📍 {ev.location}</div>}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Badge label={`✓ ${ev.going.length} participants`} color1={c.color1} small />
                        <button onClick={() => toggleGoing(ev.id)} style={{ background: isGoing ? `${c.color1}22` : `linear-gradient(135deg, ${c.color1}, ${c.color2})`, border: isGoing ? `1px solid ${c.color1}` : 'none', borderRadius: 20, padding: '5px 14px', color: isGoing ? c.color1 : '#fff', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                          {isGoing ? '✓ Je participe' : 'Je participe'}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
            {events.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: c.textMuted }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📅</div>
                <div>Aucun événement — créez le premier !</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
