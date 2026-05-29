import { useState } from 'react'
import { Avatar, Card, Badge } from '../../components/shared/UI'

const CONTACTS = [
  { id: 1, name: 'Grand-mère Marie', emoji: '👵', role: 'Grand-mère', online: true, unread: 2, lastMsg: 'Est-ce que tout le monde sera là ?', time: '10:32' },
  { id: 2, name: 'Papa Kofi', emoji: '👨🏿', role: 'Père', online: true, unread: 0, lastMsg: 'Oui on arrive le 23 !', time: '10:45' },
  { id: 3, name: 'Oncle Samuel', emoji: '🧔🏿', role: 'Oncle', online: true, unread: 5, lastMsg: "J'amène les enfants 😄", time: '11:00' },
  { id: 4, name: 'Sœur Efua', emoji: '👧🏿', role: 'Sœur', online: false, unread: 0, lastMsg: 'On se voit bientôt !', time: 'Hier' },
  { id: 5, name: 'Cousine Akua', emoji: '👧🏽', role: 'Cousine', online: true, unread: 1, lastMsg: 'Tu as vu les photos ?', time: 'Lundi' },
]

const INIT_MESSAGES = {
  1: [
    { id: 1, from: 1, text: 'Est-ce que tout le monde sera là pour Noël ? 🎄', time: '10:30' },
    { id: 2, from: 'me', text: 'Oui bien sûr ! On arrive le 23 décembre 😊', time: '10:31' },
    { id: 3, from: 1, text: 'Parfait ! Je prépare le thiéboudienne comme d\'habitude 🍚❤️', time: '10:32' },
  ],
  2: [
    { id: 1, from: 2, text: 'Mon fils, comment tu vas ?', time: '09:00' },
    { id: 2, from: 'me', text: 'Très bien Papa ! Et toi ?', time: '09:05' },
    { id: 3, from: 2, text: 'Oui on arrive le 23 !', time: '10:45' },
  ],
}

export default function FamilyMessages({ c, user }) {
  const [activeContact, setActiveContact] = useState(CONTACTS[0])
  const [messages, setMessages] = useState(INIT_MESSAGES)
  const [input, setInput] = useState('')
  const [view, setView] = useState('list') // 'list' | 'chat' (mobile)

  const chatMsgs = messages[activeContact?.id] || []

  const send = () => {
    if (!input.trim()) return
    setMessages(prev => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), {
        id: Date.now(), from: 'me', text: input, time: 'maintenant'
      }]
    }))
    setInput('')
  }

  return (
    <div className="fade-in" style={{ height: 'calc(100vh - 140px)', display: 'flex', gap: 14, minHeight: 400 }}>
      {/* Contacts list */}
      <div style={{
        width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: c.surface, borderRadius: 16, border: `1px solid ${c.border}22`,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${c.border}18` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.color1, fontFamily: 'monospace', marginBottom: 8 }}>MESSAGES</div>
          <input placeholder="Rechercher…"
            style={{
              width: '100%', background: c.bg, border: `1px solid ${c.border}22`,
              borderRadius: 20, padding: '7px 14px', color: c.text, fontSize: 13, outline: 'none',
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {CONTACTS.map(contact => (
            <div key={contact.id} onClick={() => { setActiveContact(contact); setView('chat') }}
              style={{
                padding: '12px 14px', cursor: 'pointer',
                background: activeContact?.id === contact.id ? `${c.color1}14` : 'transparent',
                borderLeft: activeContact?.id === contact.id ? `3px solid ${c.color1}` : '3px solid transparent',
                display: 'flex', gap: 10, alignItems: 'center',
                transition: 'background 0.15s',
              }}>
              <Avatar name={contact.name} emoji={contact.emoji} size={42} color1={c.color1} color2={c.color2} online={contact.online} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{contact.name}</div>
                  <div style={{ fontSize: 10, color: c.textMuted }}>{contact.time}</div>
                </div>
                <div style={{ fontSize: 11, color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {contact.lastMsg}
                </div>
              </div>
              {contact.unread > 0 && (
                <div style={{
                  background: c.color1, borderRadius: '50%', width: 18, height: 18,
                  fontSize: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'monospace', fontWeight: 700,
                }}>{contact.unread}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: c.surface, borderRadius: 16, border: `1px solid ${c.border}22`,
        overflow: 'hidden', minWidth: 0,
      }}>
        {/* Chat header */}
        <div style={{
          padding: '12px 16px', borderBottom: `1px solid ${c.border}18`,
          display: 'flex', gap: 12, alignItems: 'center', background: c.bg,
        }}>
          <Avatar name={activeContact?.name} emoji={activeContact?.emoji} size={40}
            color1={c.color1} color2={c.color2} online={activeContact?.online} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{activeContact?.name}</div>
            <div style={{ fontSize: 11, color: activeContact?.online ? '#22c55e' : c.textMuted }}>
              {activeContact?.online ? '● En ligne' : '○ Hors ligne'} · {activeContact?.role}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['📞', '📹', 'ℹ️'].map(icon => (
              <button key={icon} style={{
                background: c.surface, border: `1px solid ${c.border}22`,
                borderRadius: 8, width: 32, height: 32, fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{icon}</button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {chatMsgs.length === 0 && (
            <div style={{ textAlign: 'center', color: c.textMuted, fontSize: 13, marginTop: 40 }}>
              Commencez la conversation avec {activeContact?.name} 👋
            </div>
          )}
          {chatMsgs.map(msg => {
            const isMe = msg.from === 'me'
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                {!isMe && <Avatar name={activeContact?.name} emoji={activeContact?.emoji} size={28} color1={c.color1} color2={c.color2} />}
                <div>
                  <div style={{
                    background: isMe ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.bg,
                    border: isMe ? 'none' : `1px solid ${c.border}22`,
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '9px 13px', fontSize: 13, color: isMe ? '#fff' : c.text,
                    maxWidth: 280, lineHeight: 1.5,
                  }}>{msg.text}</div>
                  <div style={{ fontSize: 9, color: c.textSubtle, textAlign: isMe ? 'right' : 'left', marginTop: 2 }}>{msg.time}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Input */}
        <div style={{ padding: '10px 14px', borderTop: `1px solid ${c.border}18`, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>📎</button>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={`Message à ${activeContact?.name}…`}
            style={{
              flex: 1, background: c.bg, border: `1px solid ${c.border}22`,
              borderRadius: 22, padding: '9px 16px', color: c.text, fontSize: 13, outline: 'none',
            }}
          />
          <button style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>😊</button>
          <button onClick={send} style={{
            background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`,
            border: 'none', borderRadius: '50%', width: 36, height: 36,
            color: '#fff', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>➤</button>
        </div>
      </div>
    </div>
  )
}
