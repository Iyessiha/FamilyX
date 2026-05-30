// src/utils/messageStore.js
const MSG_KEY = 'familyx_messages'
const CONV_KEY = 'familyx_conversations'

function getData(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} }
}
function setData(key, data) { localStorage.setItem(key, JSON.stringify(data)) }

// Conversation ID = sorted pair of user IDs
export function getConvId(a, b) {
  return [a, b].sort().join('__')
}

// ── Conversations list ────────────────────────────────────────────────────────
export function getConversations(userId) {
  const convs = getData(CONV_KEY)
  return Object.values(convs)
    .filter(c => c.participants.includes(userId))
    .sort((a, b) => b.lastAt - a.lastAt)
}

export function getOrCreateConv(userId, otherId, otherName, otherEmoji, otherRole) {
  const convs = getData(CONV_KEY)
  const id = getConvId(userId, otherId)
  if (!convs[id]) {
    convs[id] = {
      id, participants: [userId, otherId],
      otherUser: { id: otherId, name: otherName, emoji: otherEmoji, role: otherRole },
      lastMsg: '', lastAt: Date.now(), unread: { [userId]: 0, [otherId]: 0 },
    }
    setData(CONV_KEY, convs)
  }
  return convs[id]
}

// ── Messages ──────────────────────────────────────────────────────────────────
export function getMessages(convId) {
  const msgs = getData(MSG_KEY)
  return (msgs[convId] || []).sort((a, b) => a.createdAt - b.createdAt)
}

export function sendMessage(convId, fromId, text, type = 'text') {
  const msgs = getData(MSG_KEY)
  const convs = getData(CONV_KEY)
  const msg = { id: 'm' + Date.now(), convId, fromId, text, type, createdAt: Date.now(), readBy: [fromId] }
  msgs[convId] = [...(msgs[convId] || []), msg]
  setData(MSG_KEY, msgs)

  // Update conversation
  if (convs[convId]) {
    convs[convId].lastMsg = text
    convs[convId].lastAt = Date.now()
    // Increment unread for other participant
    convs[convId].participants.forEach(pid => {
      if (pid !== fromId) {
        convs[convId].unread[pid] = (convs[convId].unread[pid] || 0) + 1
      }
    })
    setData(CONV_KEY, convs)
  }
  return msg
}

export function markRead(convId, userId) {
  const convs = getData(CONV_KEY)
  if (convs[convId]) {
    convs[convId].unread[userId] = 0
    setData(CONV_KEY, convs)
  }
  const msgs = getData(MSG_KEY)
  if (msgs[convId]) {
    msgs[convId] = msgs[convId].map(m => ({
      ...m, readBy: m.readBy.includes(userId) ? m.readBy : [...m.readBy, userId]
    }))
    setData(MSG_KEY, msgs)
  }
}

export function getTotalUnread(userId) {
  const convs = getData(CONV_KEY)
  return Object.values(convs)
    .filter(c => c.participants.includes(userId))
    .reduce((sum, c) => sum + (c.unread[userId] || 0), 0)
}

// ── Group messages ─────────────────────────────────────────────────────────────
const GRP_KEY = 'familyx_group_messages'

export function getGroupMessages(groupId) {
  try {
    const all = JSON.parse(localStorage.getItem(GRP_KEY) || '{}')
    return (all[groupId] || []).sort((a, b) => a.createdAt - b.createdAt)
  } catch { return [] }
}

export function sendGroupMessage(groupId, fromId, fromName, fromEmoji, text) {
  try {
    const all = JSON.parse(localStorage.getItem(GRP_KEY) || '{}')
    const msg = { id: 'gm' + Date.now(), groupId, fromId, fromName, fromEmoji, text, createdAt: Date.now() }
    all[groupId] = [...(all[groupId] || []), msg]
    localStorage.setItem(GRP_KEY, JSON.stringify(all))
    return msg
  } catch { return null }
}
