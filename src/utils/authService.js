// src/utils/authService.js
// Remplace authStore.js — toutes les opérations auth via Supabase
import { supabase } from './supabase'

// ── Inscription ────────────────────────────────────────────────────────────────
export async function register({ name, email, password, circleId, roleId, roleLabel, roleEmoji }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, circle_id: circleId, role_id: roleId, role_label: roleLabel, role_emoji: roleEmoji }
    }
  })
  if (error) return { error: error.message }

  // Le trigger handle_new_user crée le profil automatiquement
  // On attend un peu puis on le récupère
  await new Promise(r => setTimeout(r, 800))
  const profile = await getProfile(data.user.id)
  return { user: profile }
}

// ── Connexion ──────────────────────────────────────────────────────────────────
export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    if (error.message.includes('Invalid login')) return { error: 'Email ou mot de passe incorrect.' }
    return { error: error.message }
  }
  const profile = await getProfile(data.user.id)
  return { user: profile }
}

// ── Déconnexion ────────────────────────────────────────────────────────────────
export async function logout() {
  await supabase.auth.signOut()
}

// ── Session courante ───────────────────────────────────────────────────────────
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const profile = await getProfile(session.user.id)
  return profile
}

// ── Profil ─────────────────────────────────────────────────────────────────────
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export async function updateProfile(userId, updates) {
  // Exclure les champs protégés
  const { id, created_at, ...safe } = updates
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...safe, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  if (error) return { error: error.message }
  return { user: data }
}

// ── Mot de passe ───────────────────────────────────────────────────────────────
export async function changePassword(newPassword) {
  if (newPassword.length < 6) return { error: 'Mot de passe trop court (min 6 caractères).' }
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return { success: true }
}

export async function resetPasswordRequest(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function resetPasswordConfirm(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return { success: true }
}

// ── Upload avatar ──────────────────────────────────────────────────────────────
export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  const avatarUrl = data.publicUrl + '?t=' + Date.now()

  await updateProfile(userId, { avatar_url: avatarUrl })
  return { avatarUrl }
}

// ── Recherche membres ──────────────────────────────────────────────────────────
export async function searchMembers(query, excludeId) {
  const { data, error } = await supabase.rpc('search_members', {
    search_query: query,
    exclude_id: excludeId
  })
  if (error) return []
  return data
}

export async function getCircleMembers(circleId, excludeId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, circle_id, role_label, role_emoji, avatar_url, location')
    .eq('circle_id', circleId)
    .neq('id', excludeId)
    .order('name')
  if (error) return []
  return data
}

// ── Liens membres ──────────────────────────────────────────────────────────────
export async function sendLinkRequest(fromId, toId, relation) {
  const { error } = await supabase
    .from('member_links')
    .insert({ from_user_id: fromId, to_user_id: toId, relation, status: 'pending' })
  if (error) return { error: error.code === '23505' ? 'Demande déjà envoyée.' : error.message }
  return { success: true }
}

export async function respondToLink(linkId, accept) {
  const { error } = await supabase
    .from('member_links')
    .update({ status: accept ? 'accepted' : 'refused' })
    .eq('id', linkId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function getLinkedMembers(userId) {
  const { data, error } = await supabase
    .from('member_links')
    .select(`
      id, relation, status,
      from_profile:profiles!member_links_from_user_id_fkey(id, name, role_label, role_emoji, avatar_url, location),
      to_profile:profiles!member_links_to_user_id_fkey(id, name, role_label, role_emoji, avatar_url, location)
    `)
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .eq('status', 'accepted')
  if (error) return []
  return data.map(l => l.from_profile?.id === userId ? l.to_profile : l.from_profile).filter(Boolean)
}

export async function getPendingRequests(userId) {
  const { data, error } = await supabase
    .from('member_links')
    .select(`
      id, relation, status, created_at,
      from_profile:profiles!member_links_from_user_id_fkey(id, name, role_label, role_emoji)
    `)
    .eq('to_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) return []
  return data
}

// ── Auth state change listener ─────────────────────────────────────────────────
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const profile = await getProfile(session.user.id)
      callback(profile)
    } else {
      callback(null)
    }
  })
}
