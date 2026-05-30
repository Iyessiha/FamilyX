// src/utils/dataService.js
import { supabase } from './supabase'

// ── POSTS (Feed) ──────────────────────────────────────────────────────────────
export async function getPosts(circleId, limit = 20) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, content, type, image_urls, likes, created_at,
      author:profiles!posts_user_id_fkey(id, name, role_label, role_emoji, avatar_url)
    `)
    .eq('circle_id', circleId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return data
}

export async function createPost(userId, circleId, content, type = 'status', imageUrls = []) {
  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id: userId, circle_id: circleId, content, type, image_urls: imageUrls })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function toggleLike(postId, userId) {
  const { data: post } = await supabase
    .from('posts').select('likes').eq('id', postId).single()
  if (!post) return
  const likes = post.likes || []
  const newLikes = likes.includes(userId)
    ? likes.filter(id => id !== userId)
    : [...likes, userId]
  await supabase.from('posts').update({ likes: newLikes }).eq('id', postId)
}

export async function deletePost(postId, userId) {
  await supabase.from('posts').delete().eq('id', postId).eq('user_id', userId)
}

export function subscribeToPosts(circleId, callback) {
  return supabase
    .channel(`posts:${circleId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts', filter: `circle_id=eq.${circleId}` }, p => callback('INSERT', p.new))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts', filter: `circle_id=eq.${circleId}` }, p => callback('UPDATE', p.new))
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, p => callback('DELETE', p.old))
    .subscribe()
}

// ── COMMENTS ──────────────────────────────────────────────────────────────────
export async function getComments(postId) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id, content, created_at,
      author:profiles!comments_user_id_fkey(id, name, role_emoji, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  if (error) return []
  return data
}

export async function addComment(postId, userId, content) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: userId, content })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

// ── STORIES ───────────────────────────────────────────────────────────────────
export async function getActiveStories(circleId) {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      id, image_url, text, bg_gradient, views, created_at, expires_at,
      author:profiles!stories_user_id_fkey(id, name, role_emoji, avatar_url)
    `)
    .eq('circle_id', circleId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  if (error) return []
  return data
}

export async function createStory(userId, circleId, { imageUrl, text, bgGradient }) {
  const { data, error } = await supabase
    .from('stories')
    .insert({
      user_id: userId, circle_id: circleId,
      image_url: imageUrl || null, text: text || null,
      bg_gradient: bgGradient || 'linear-gradient(135deg, #1a1a2e, #16213e)',
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    })
    .select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function viewStory(storyId, userId) {
  const { data: story } = await supabase
    .from('stories').select('views').eq('id', storyId).single()
  if (!story) return
  const views = story.views || []
  if (!views.includes(userId)) {
    await supabase.from('stories').update({ views: [...views, userId] }).eq('id', storyId)
  }
}

export async function uploadStoryImage(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('stories').upload(path, file, { contentType: file.type })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('stories').getPublicUrl(path)
  return data.publicUrl
}

export function subscribeToStories(circleId, callback) {
  return supabase
    .channel(`stories:${circleId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stories', filter: `circle_id=eq.${circleId}` }, p => callback(p.new))
    .subscribe()
}

// ── GROUPS ────────────────────────────────────────────────────────────────────
export async function getGroups(circleId, userId) {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      id, name, description, emoji, created_at,
      admin:profiles!groups_admin_id_fkey(id, name, role_emoji),
      members:group_members(user_id)
    `)
    .eq('circle_id', circleId)
    .order('created_at', { ascending: true })
  if (error) return []
  return data
}

export async function createGroup(userId, circleId, { name, description, emoji }) {
  const { data: group, error } = await supabase
    .from('groups')
    .insert({ admin_id: userId, circle_id: circleId, name, description: description || '', emoji: emoji || '👥' })
    .select().single()
  if (error) throw new Error(error.message)
  // Auto-join as admin
  await supabase.from('group_members').insert({ group_id: group.id, user_id: userId, role: 'admin' })
  return group
}

export async function joinGroup(groupId, userId) {
  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId, role: 'member' })
  if (error && error.code !== '23505') throw new Error(error.message) // ignore duplicate
}

// ── EVENTS ────────────────────────────────────────────────────────────────────
export async function getEvents(circleId) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      id, title, description, emoji, location, event_date, event_time, going, maybe, created_at,
      organizer:profiles!events_user_id_fkey(id, name, role_emoji)
    `)
    .eq('circle_id', circleId)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })
  if (error) return []
  return data
}

export async function createEvent(userId, circleId, { title, description, emoji, location, eventDate, eventTime }) {
  const { data, error } = await supabase
    .from('events')
    .insert({ user_id: userId, circle_id: circleId, title, description: description || '', emoji: emoji || '📅', location: location || '', event_date: eventDate, event_time: eventTime || null })
    .select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function toggleEventGoing(eventId, userId) {
  const { data: event } = await supabase.from('events').select('going').eq('id', eventId).single()
  if (!event) return
  const going = event.going || []
  const newGoing = going.includes(userId) ? going.filter(id => id !== userId) : [...going, userId]
  await supabase.from('events').update({ going: newGoing }).eq('id', eventId)
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export async function getNotifications(userId, limit = 30) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return data
}

export async function markNotifRead(notifId) {
  await supabase.from('notifications').update({ is_read: true }).eq('id', notifId)
}

export async function markAllNotifsRead(userId) {
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
}

export async function deleteNotif(notifId) {
  await supabase.from('notifications').delete().eq('id', notifId)
}

export async function getUnreadNotifCount(userId) {
  const { count } = await supabase
    .from('notifications').select('*', { count: 'exact', head: true })
    .eq('user_id', userId).eq('is_read', false)
  return count || 0
}

export function subscribeToNotifications(userId, callback) {
  return supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, p => callback(p.new))
    .subscribe()
}

// ── GALLERY ───────────────────────────────────────────────────────────────────
export async function getGallery(circleId, album = null) {
  let query = supabase
    .from('gallery')
    .select(`
      id, title, image_url, album, likes, storage_path, size_bytes, created_at,
      uploader:profiles!gallery_user_id_fkey(id, name, role_emoji)
    `)
    .eq('circle_id', circleId)
    .order('created_at', { ascending: false })
  if (album) query = query.eq('album', album)
  const { data, error } = await query
  if (error) return []
  return data
}

export async function uploadPhoto(userId, circleId, file, title, album = 'Général') {
  const ext = file.name.split('.').pop()
  const path = `${circleId}/${userId}/${Date.now()}.${ext}`
  const { error: uploadErr } = await supabase.storage
    .from('gallery').upload(path, file, { contentType: file.type })
  if (uploadErr) throw new Error(uploadErr.message)
  const { data } = supabase.storage.from('gallery').getPublicUrl(path)
  const { data: photo, error } = await supabase.from('gallery')
    .insert({ user_id: userId, circle_id: circleId, title, image_url: data.publicUrl, album, storage_path: path, size_bytes: file.size })
    .select().single()
  if (error) throw new Error(error.message)
  return photo
}

export async function togglePhotoLike(photoId, userId) {
  const { data: photo } = await supabase.from('gallery').select('likes').eq('id', photoId).single()
  if (!photo) return
  const likes = photo.likes || []
  const newLikes = likes.includes(userId) ? likes.filter(id => id !== userId) : [...likes, userId]
  await supabase.from('gallery').update({ likes: newLikes }).eq('id', photoId)
}

export async function deletePhoto(photoId, userId, storagePath) {
  if (storagePath) await supabase.storage.from('gallery').remove([storagePath])
  await supabase.from('gallery').delete().eq('id', photoId).eq('user_id', userId)
}

// ── SUBSCRIPTION ──────────────────────────────────────────────────────────────
export async function getSubscription(userId) {
  const { data } = await supabase
    .from('subscriptions').select('*').eq('user_id', userId).single()
  return data
}

export async function upsertSubscription(userId, { planId, billing, paymentMethod, monerooTxId, expiresAt }) {
  const { error } = await supabase.from('subscriptions').upsert({
    user_id: userId, plan_id: planId, billing,
    status: 'active', payment_method: paymentMethod,
    moneroo_tx_id: monerooTxId || null,
    activated_at: new Date().toISOString(),
    expires_at: expiresAt || null,
    auto_renew: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
  if (error) throw new Error(error.message)
}

export async function cancelSubscription(userId) {
  await supabase.from('subscriptions')
    .update({ auto_renew: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
}

export async function createTransaction(userId, { planId, billing, amount, currency, status, paymentMethod, monerooTxId, country, metadata }) {
  const { data, error } = await supabase.from('payment_transactions')
    .insert({ user_id: userId, plan_id: planId, billing, amount, currency: currency || 'XOF', status, payment_method: paymentMethod, moneroo_tx_id: monerooTxId || null, country, metadata: metadata || {} })
    .select().single()
  if (error) throw new Error(error.message)
  return data
}
