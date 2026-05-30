import { useState } from 'react'
import { Card, Badge, Button, SectionTitle } from '../../components/shared/UI'

const STORAGE_KEY = 'familyx_notifications'

function getNotifs(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return all[userId] || getDefaultNotifs()
  } catch { return getDefaultNotifs() }
}

function getDefaultNotifs() {
  return [
    { id: 'n1', type: 'link', title: 'Demande de lien', body: 'Kofi Jean veut vous lier comme "Père"', time: Date.now() - 1000 * 60 * 5, read: false, emoji: '🔗' },
    { id: 'n2', type: 'story', title: 'Nouvelle story', body: 'Grand-mère Marie a publié une story', time: Date.now() - 1000 * 60 * 30, read: false, emoji: '📸' },
    { id: 'n3', type: 'message', title: 'Nouveau message', body: 'Papa Kofi vous a envoyé un message', time: Date.now() - 1000 * 60 * 60, read: false, emoji: '💬' },
    { id: 'n4', type: 'event', title: 'Rappel événement', body: 'Anniversaire Grand-père Jean dans 3 jours 🎂', time: Date.now() - 1000 * 60 * 60 * 2, read: true, emoji: '📅' },
    { id: 'n5', type: 'member', title: 'Nouveau membre', body: 'Cousine Akua a rejoint FamilyX', time: Date.now() - 1000 * 60 * 60 * 5, read: true, emoji: '👤' },
    { id: 'n6', type: 'group', title: 'Message de groupe', body: 'Famille Kofi : "On se retrouve bientôt !"', time: Date.now() - 1000 * 60 * 60 * 8, read: true, emoji: '👥' },
    { id: 'n7', type: 'subscription', title: 'Abonnement', body: 'Votre période gratuite expire dans 7 jours', time: Date.now() - 1000 * 60 * 60 * 24, read: true, emoji: '⭐' },
  ]
}

function timeAgo(ts) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (d > 0) return `Il y a ${d}j`
  if (h > 0) return `Il y a ${h}h`
  if (m > 0) return `Il y a ${m}min`
  return "À l'instant"
}

const TYPE_COLORS = {
  link: '#B8860B', story: '#7c3aed', message: '#2563eb',
  event: '#16a34a', member: '#0891b2', group: '#d97706', subscription: '#ec4899',
}

export default function NotificationsPage({ c, user }) {
  const [notifs, setNotifs] = useState(() => getNotifs(user?.id))
  const [filter, setFilter] = useState('all')

  const markRead = (id) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })))
  const deleteNotif = (id) => setNotifs(p => p.filter(n => n.id !== id))
  const clearAll = () => setNotifs([])

  const filters = [
    { id: 'all', label: 'Tout' },
    { id: 'unread', label: 'Non lu' },
    { id: 'link', label: '🔗 Liens' },
    { id: 'message', label: '💬 Messages' },
    { id: 'event', label: '📅 Événements' },
  ]

  const filtered = notifs.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    return n.type === filter
  })

  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: c.text }}>Notifications</div>
          {unreadCount > 0 && <div style={{ fontSize: 12, color: c.color1 }}>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && <Button c={c} small variant="ghost" onClick={markAllRead}>Tout lire</Button>}
          {notifs.length > 0 && <Button c={c} small variant="ghost" onClick={clearAll}>Effacer tout</Button>}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4, scrollbarWidth: 'none' }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            flexShrink: 0, background: filter === f.id ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.surface,
            border: `1px solid ${filter === f.id ? 'transparent' : c.border + '22'}`,
            borderRadius: 20, padding: '6px 14px', fontSize: 12,
            color: filter === f.id ? '#fff' : c.textMuted,
            cursor: 'pointer', fontFamily: c.font,
          }}>{f.label}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: c.textMuted }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 6 }}>Tout est à jour !</div>
          <div style={{ fontSize: 13 }}>Aucune notification {filter !== 'all' ? 'dans cette catégorie' : ''}.</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(n => (
          <div key={n.id} onClick={() => markRead(n.id)} style={{
            background: n.read ? c.surface : `${TYPE_COLORS[n.type] || c.color1}12`,
            border: `1px solid ${n.read ? c.border + '18' : (TYPE_COLORS[n.type] || c.color1) + '44'}`,
            borderRadius: 14, padding: '12px 14px',
            display: 'flex', gap: 12, alignItems: 'flex-start',
            cursor: 'pointer', transition: 'all 0.15s',
            position: 'relative',
          }}>
            {/* Icon */}
            <div style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: `${TYPE_COLORS[n.type] || c.color1}22`,
              border: `1px solid ${TYPE_COLORS[n.type] || c.color1}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>{n.emoji}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: c.text }}>{n.title}</div>
                <div style={{ fontSize: 10, color: c.textSubtle, whiteSpace: 'nowrap', marginLeft: 8 }}>{timeAgo(n.time)}</div>
              </div>
              <div style={{ fontSize: 12, color: c.textMuted, lineHeight: 1.4 }}>{n.body}</div>
            </div>

            {/* Unread dot */}
            {!n.read && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[n.type] || c.color1, flexShrink: 0, marginTop: 4 }} />
            )}

            {/* Delete */}
            <button onClick={e => { e.stopPropagation(); deleteNotif(n.id) }} style={{
              position: 'absolute', top: 8, right: 8,
              background: 'none', border: 'none', color: c.textSubtle,
              fontSize: 14, cursor: 'pointer', opacity: 0,
              transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => e.target.style.opacity = 1}
              onMouseLeave={e => e.target.style.opacity = 0}
            >✕</button>
          </div>
        ))}
      </div>

      {/* Notification preferences */}
      <div style={{ marginTop: 24 }}>
        <SectionTitle c={c}>Préférences de notification</SectionTitle>
        <Card c={c}>
          {[
            { label: 'Demandes de lien', key: 'link', on: true },
            { label: 'Nouveaux messages', key: 'message', on: true },
            { label: 'Stories', key: 'story', on: true },
            { label: 'Événements & rappels', key: 'event', on: true },
            { label: 'Nouveaux membres', key: 'member', on: false },
            { label: 'Abonnement & facturation', key: 'sub', on: true },
          ].map((pref, i, arr) => (
            <div key={pref.key} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${c.border}12` : 'none',
            }}>
              <div style={{ fontSize: 13, color: c.text }}>{pref.label}</div>
              <Toggle on={pref.on} color={c.color1} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

function Toggle({ on: initialOn, color }) {
  const [on, setOn] = useState(initialOn)
  return (
    <div onClick={() => setOn(!on)} style={{
      width: 44, height: 24, borderRadius: 12,
      background: on ? color : '#333',
      position: 'relative', cursor: 'pointer',
      transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 22 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 4px #00000044',
      }} />
    </div>
  )
}
