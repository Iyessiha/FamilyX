import { useState, useEffect, useRef } from 'react'
import { Avatar } from '../../components/shared/UI'
import { getAllCircleMembers } from '../../utils/authStore'
import { getConversations, getOrCreateConv, getMessages, sendMessage, markRead, getConvId } from '../../utils/messageStore'

function timeAgo(ts) {
  const d = Date.now() - ts
  const m = Math.floor(d / 60000), h = Math.floor(d / 3600000)
  if (h > 23) return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  if (h > 0) return `${h}h`
  if (m > 0) return `${m}min`
  return 'maintenant'
}

export default function FamilyMessages({ c, user }) {
  const [contacts, setContacts] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const bottomRef = useRef()

  // Load contacts = all circle members except self
  useEffect(() => {
    const members = getAllCircleMembers(user.circleId).filter(m => m.id !== user.id)
    const convs = getConversations(user.id)
    // Merge members with their conversation data
    const enriched = members.map(m => {
      const convId = getConvId(user.id, m.id)
      const conv = convs.find(c => c.id === convId)
      return { ...m, convId, lastMsg: conv?.lastMsg || '', lastAt: conv?.lastAt || 0, unread: conv?.unread?.[user.id] || 0 }
    }).sort((a, b) => b.lastAt - a.lastAt)
    setContacts(enriched)
    if (!activeConv && enriched.length > 0) openConv(enriched[0])
  }, [])

  // Refresh messages when conv changes
  useEffect(() => {
    if (!activeConv) return
    const msgs = getMessages(activeConv.id)
    setMessages(msgs)
    markRead(activeConv.id, user.id)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [activeConv])

  // Auto-refresh every 1s for real-time feel
  useEffect(() => {
    if (!activeConv) return
    const interval = setInterval(() => {
      const msgs = getMessages(activeConv.id)
      setMessages(msgs)
    }, 1000)
    return () => clearInterval(interval)
  }, [activeConv])

  const openConv = (contact) => {
    const conv = getOrCreateConv(user.id, contact.id, contact.name, contact.roleEmoji, contact.roleLabel)
    setActiveConv({ ...conv, contact })
  }

  const send = () => {
    if (!input.trim() || !activeConv) return
    sendMessage(activeConv.id, user.id, input.trim())
    setInput('')
    setMessages(getMessages(activeConv.id))
    // Update contacts list
    setContacts(prev => prev.map(c => c.id === activeConv.contact.id ? { ...c, lastMsg: input.trim(), lastAt: Date.now() } : c))
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const filtered = contacts.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fade-in" style={{ height: 'calc(100vh - 140px)', display: 'flex', gap: 12, minHeight: 400 }}>
      {/* Contacts */}
      <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', background: c.surface, borderRadius: 16, border: `1px solid ${c.border}22`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 12px 8px', borderBottom: `1px solid ${c.border}18` }}>
          <div style={{ fontSize: 12, color: c.color1, fontFamily: 'monospace', marginBottom: 8 }}>MESSAGES</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            style={{ width: '100%', background: c.bg, border: `1px solid ${c.border}22`, borderRadius: 20, padding: '7px 12px', color: c.text, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: c.textMuted, fontSize: 12 }}>Aucun membre dans ce cercle.</div>
          )}
          {filtered.map(contact => (
            <div key={contact.id} onClick={() => openConv(contact)} style={{
              padding: '10px 12px', cursor: 'pointer',
              background: activeConv?.contact?.id === contact.id ? `${c.color1}14` : 'transparent',
              borderLeft: `3px solid ${activeConv?.contact?.id === contact.id ? c.color1 : 'transparent'}`,
              display: 'flex', gap: 10, alignItems: 'center', transition: 'background 0.15s',
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${c.color1}33, ${c.color2}55)`, border: `2px solid ${c.border}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, overflow: 'hidden' }}>
                  {contact.avatar ? <img src={contact.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : contact.roleEmoji}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, fontWeight: contact.unread > 0 ? 700 : 500, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.name}</div>
                  {contact.lastAt > 0 && <div style={{ fontSize: 9, color: c.textSubtle, flexShrink: 0, marginLeft: 4 }}>{timeAgo(contact.lastAt)}</div>}
                </div>
                <div style={{ fontSize: 11, color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {contact.lastMsg || `${contact.roleLabel} · Démarrer la conv.`}
                </div>
              </div>
              {contact.unread > 0 && (
                <div style={{ background: c.color1, borderRadius: '50%', width: 17, height: 17, fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 700, flexShrink: 0 }}>{contact.unread}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: c.surface, borderRadius: 16, border: `1px solid ${c.border}22`, overflow: 'hidden', minWidth: 0 }}>
        {activeConv ? (
          <>
            {/* Header */}
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${c.border}18`, display: 'flex', gap: 10, alignItems: 'center', background: c.bg }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${c.color1}33, ${c.color2}55)`, border: `2px solid ${c.border}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, overflow: 'hidden', flexShrink: 0 }}>
                {activeConv.contact?.avatar ? <img src={activeConv.contact.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : activeConv.contact?.roleEmoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{activeConv.contact?.name}</div>
                <div style={{ fontSize: 11, color: c.color1 }}>{activeConv.contact?.roleLabel}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['📞', '📹'].map(icon => (
                  <button key={icon} style={{ background: c.surface, border: `1px solid ${c.border}22`, borderRadius: 8, width: 32, height: 32, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: c.textMuted, fontSize: 13, marginTop: 40 }}>
                  Démarrez la conversation avec {activeConv.contact?.name} 👋
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.fromId === user.id
                const showAvatar = !isMe && (i === 0 || messages[i - 1].fromId !== msg.fromId)
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 6, alignItems: 'flex-end' }}>
                    {!isMe && (
                      <div style={{ width: 26, flexShrink: 0 }}>
                        {showAvatar && (
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${c.color1}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                            {activeConv.contact?.roleEmoji}
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ maxWidth: '72%' }}>
                      <div style={{
                        background: isMe ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.bg,
                        border: isMe ? 'none' : `1px solid ${c.border}22`,
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        padding: '8px 12px', fontSize: 13, color: isMe ? '#fff' : c.text, lineHeight: 1.5,
                        wordBreak: 'break-word',
                      }}>{msg.text}</div>
                      <div style={{ fontSize: 9, color: c.textSubtle, textAlign: isMe ? 'right' : 'left', marginTop: 2 }}>
                        {timeAgo(msg.createdAt)} {isMe && (msg.readBy?.length > 1 ? '✓✓' : '✓')}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '8px 12px', borderTop: `1px solid ${c.border}18`, display: 'flex', gap: 8, alignItems: 'center' }}>
              <button style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>📎</button>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder={`Message à ${activeConv.contact?.name}…`}
                style={{ flex: 1, background: c.bg, border: `1px solid ${c.border}22`, borderRadius: 22, padding: '9px 14px', color: c.text, fontSize: 13, outline: 'none' }} />
              <button style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>😊</button>
              <button onClick={send} disabled={!input.trim()} style={{ background: input.trim() ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.surface, border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', fontSize: 16, cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: input.trim() ? 1 : 0.4 }}>➤</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: c.textMuted }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div style={{ fontSize: 14 }}>Sélectionnez un contact pour commencer</div>
          </div>
        )}
      </div>
    </div>
  )
}
