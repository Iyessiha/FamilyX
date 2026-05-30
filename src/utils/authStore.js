// Auth store — localStorage (replace with Supabase/Firebase in production)
const STORAGE_KEY = 'familyx_users'
const SESSION_KEY = 'familyx_session'

function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveUsers(u) { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)) }
function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}
function saveSession(s) {
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s))
  else localStorage.removeItem(SESSION_KEY)
}

// ── Seed demo users ───────────────────────────────────────────────────────────
function seedDemoUsers() {
  if (getUsers().length > 0) return
  const demo = [
    { id: 'u1', name: 'Kofi Jean', email: 'kofi@demo.com', password: 'demo1234', circleId: 'family', roleId: 'pere', roleLabel: 'Père', roleEmoji: '👨🏿', avatar: null, bio: 'Père de famille, ingénieur.', location: 'Paris', phone: '+33 6 00 00 01', createdAt: Date.now() - 86400000 * 30, linkedMemberIds: ['u2', 'u3'], linkRequests: [] },
    { id: 'u2', name: 'Ama Kofi', email: 'ama@demo.com', password: 'demo1234', circleId: 'family', roleId: 'mere', roleLabel: 'Mère', roleEmoji: '👩🏿', avatar: null, bio: 'Médecin et maman.', location: 'Paris', phone: '+33 6 00 00 02', createdAt: Date.now() - 86400000 * 25, linkedMemberIds: ['u1', 'u3'], linkRequests: [] },
    { id: 'u3', name: 'Yaw Kofi', email: 'yaw@demo.com', password: 'demo1234', circleId: 'family', roleId: 'fils', roleLabel: 'Fils', roleEmoji: '🧑🏿', avatar: null, bio: 'Développeur & entrepreneur.', location: 'Paris', phone: '+33 6 00 00 03', createdAt: Date.now() - 86400000 * 10, linkedMemberIds: ['u1', 'u2'], linkRequests: [] },
    { id: 'u4', name: 'Imam Diallo', email: 'imam@demo.com', password: 'demo1234', circleId: 'mosque', roleId: 'imam', roleLabel: 'Imam', roleEmoji: '🕌', avatar: null, bio: 'Imam de la communauté Al-Nour.', location: 'Paris 18e', phone: '', createdAt: Date.now() - 86400000 * 60, linkedMemberIds: [], linkRequests: [] },
    { id: 'u5', name: 'Sara Dupont', email: 'sara@demo.com', password: 'demo1234', circleId: 'org', roleId: 'manager', roleLabel: 'Manager', roleEmoji: '📊', avatar: null, bio: 'Manager produit senior.', location: 'Lyon', phone: '', createdAt: Date.now() - 86400000 * 15, linkedMemberIds: [], linkRequests: [] },
    { id: 'u6', name: 'Marc Lebrun', email: 'marc@demo.com', password: 'demo1234', circleId: 'club', roleId: 'president', roleLabel: 'Président', roleEmoji: '🏛️', avatar: null, bio: "Président de l'association.", location: 'Bordeaux', phone: '', createdAt: Date.now() - 86400000 * 20, linkedMemberIds: [], linkRequests: [] },
    { id: 'u7', name: 'Pasteur Samuel', email: 'pasteur@demo.com', password: 'demo1234', circleId: 'church', roleId: 'pasteur', roleLabel: 'Pasteur', roleEmoji: '✝️', avatar: null, bio: 'Pasteur de la communauté.', location: 'Abidjan', phone: '', createdAt: Date.now() - 86400000 * 45, linkedMemberIds: [], linkRequests: [] },
  ]
  saveUsers(demo)
}
seedDemoUsers()

function buildSession(user) {
  return {
    id: user.id, name: user.name, email: user.email,
    circleId: user.circleId, roleId: user.roleId,
    roleLabel: user.roleLabel, roleEmoji: user.roleEmoji,
    avatar: user.avatar, bio: user.bio || '', location: user.location || '', phone: user.phone || '',
    createdAt: user.createdAt,
    linkedMemberIds: user.linkedMemberIds || [],
    linkRequests: user.linkRequests || [],
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export function authRegister({ name, email, password, circleId, roleId, roleLabel, roleEmoji }) {
  const users = getUsers()
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return { error: 'Cet email est déjà utilisé.' }
  const newUser = { id: 'u' + Date.now(), name, email: email.toLowerCase(), password, circleId, roleId, roleLabel, roleEmoji, avatar: null, bio: '', location: '', phone: '', createdAt: Date.now(), linkedMemberIds: [], linkRequests: [] }
  users.push(newUser)
  saveUsers(users)
  const session = buildSession(newUser)
  saveSession(session)
  return { user: session }
}

export function authLogin({ email, password }) {
  const users = getUsers()
  const user = users.find(u => u.email === email.toLowerCase())
  if (!user) return { error: 'Aucun compte avec cet email.' }
  if (user.password !== password) return { error: 'Mot de passe incorrect.' }
  const session = buildSession(user)
  saveSession(session)
  return { user: session }
}

export function authLogout() { saveSession(null) }

export function authGetSession() {
  const session = getSession()
  if (!session) return null
  const user = getUsers().find(u => u.id === session.id)
  if (!user) { saveSession(null); return null }
  return buildSession(user)
}

export function authUpdateProfile(userId, updates) {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return { error: 'Utilisateur introuvable.' }
  // Never overwrite password/email via this function
  const { password, email, ...safeUpdates } = updates
  users[idx] = { ...users[idx], ...safeUpdates }
  saveUsers(users)
  const session = buildSession(users[idx])
  saveSession(session)
  return { user: session }
}

export function authChangePassword(userId, { currentPassword, newPassword }) {
  const users = getUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return { error: 'Utilisateur introuvable.' }
  if (users[idx].password !== currentPassword) return { error: 'Mot de passe actuel incorrect.' }
  if (newPassword.length < 6) return { error: 'Le nouveau mot de passe doit faire au moins 6 caractères.' }
  users[idx].password = newPassword
  saveUsers(users)
  return { success: true }
}

export function authResetPasswordRequest(email) {
  const users = getUsers()
  const idx = users.findIndex(u => u.email === email.toLowerCase())
  if (idx === -1) return { error: 'Aucun compte avec cet email.' }
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  users[idx].resetCode = code
  users[idx].resetExpiry = Date.now() + 1000 * 60 * 15
  saveUsers(users)
  console.log(`[FamilyX] Reset code for ${email}: ${code}`)
  return { success: true, code }
}

export function authResetPasswordConfirm(email, code, newPassword) {
  const users = getUsers()
  const idx = users.findIndex(u => u.email === email.toLowerCase())
  if (idx === -1) return { error: 'Email introuvable.' }
  if (!users[idx].resetCode || users[idx].resetCode !== code) return { error: 'Code invalide.' }
  if (Date.now() > users[idx].resetExpiry) return { error: 'Code expiré. Refaites la demande.' }
  if (newPassword.length < 6) return { error: 'Mot de passe trop court (min 6 caractères).' }
  users[idx].password = newPassword
  delete users[idx].resetCode
  delete users[idx].resetExpiry
  saveUsers(users)
  return { success: true }
}

// ── Member search & linking ───────────────────────────────────────────────────
export function searchCircleMembers(circleId, query, excludeId) {
  return getUsers()
    .filter(u => u.circleId === circleId && u.id !== excludeId)
    .filter(u => !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
    .map(u => ({ id: u.id, name: u.name, roleLabel: u.roleLabel, roleEmoji: u.roleEmoji, avatar: u.avatar, location: u.location }))
}

export function searchAllMembers(query, excludeId) {
  return getUsers()
    .filter(u => u.id !== excludeId && (
      u.id === query.trim() ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
    ))
    .map(u => ({ id: u.id, name: u.name, roleLabel: u.roleLabel, roleEmoji: u.roleEmoji, avatar: u.avatar, location: u.location, circleId: u.circleId }))
}

export function sendLinkRequest(fromId, toId, relation) {
  const users = getUsers()
  const fromIdx = users.findIndex(u => u.id === fromId)
  const toIdx = users.findIndex(u => u.id === toId)
  if (fromIdx === -1 || toIdx === -1) return { error: 'Utilisateur introuvable.' }
  if ((users[fromIdx].linkedMemberIds || []).includes(toId)) return { error: 'Déjà lié à ce membre.' }
  if ((users[toIdx].linkRequests || []).find(r => r.fromId === fromId && r.status === 'pending')) return { error: 'Demande déjà envoyée.' }
  users[toIdx].linkRequests = users[toIdx].linkRequests || []
  users[toIdx].linkRequests.push({ id: 'req' + Date.now(), fromId, fromName: users[fromIdx].name, fromEmoji: users[fromIdx].roleEmoji, fromRole: users[fromIdx].roleLabel, relation, status: 'pending', sentAt: Date.now() })
  saveUsers(users)
  return { success: true }
}

export function respondLinkRequest(userId, requestId, accept) {
  const users = getUsers()
  const toIdx = users.findIndex(u => u.id === userId)
  if (toIdx === -1) return { error: 'Utilisateur introuvable.' }
  const req = (users[toIdx].linkRequests || []).find(r => r.id === requestId)
  if (!req) return { error: 'Demande introuvable.' }
  req.status = accept ? 'accepted' : 'refused'
  if (accept) {
    users[toIdx].linkedMemberIds = [...new Set([...(users[toIdx].linkedMemberIds || []), req.fromId])]
    const fromIdx = users.findIndex(u => u.id === req.fromId)
    if (fromIdx !== -1) users[fromIdx].linkedMemberIds = [...new Set([...(users[fromIdx].linkedMemberIds || []), userId])]
  }
  saveUsers(users)
  const session = buildSession(users[toIdx])
  saveSession(session)
  return { user: session }
}

export function getLinkedMembers(userId) {
  const users = getUsers()
  const user = users.find(u => u.id === userId)
  if (!user) return []
  return (user.linkedMemberIds || []).map(id => {
    const m = users.find(u => u.id === id)
    return m ? { id: m.id, name: m.name, roleLabel: m.roleLabel, roleEmoji: m.roleEmoji, avatar: m.avatar, location: m.location } : null
  }).filter(Boolean)
}

export function getPendingRequests(userId) {
  const users = getUsers()
  const user = users.find(u => u.id === userId)
  return (user?.linkRequests || []).filter(r => r.status === 'pending')
}

export function getAllCircleMembers(circleId) {
  return getUsers().filter(u => u.circleId === circleId).map(buildSession)
}
