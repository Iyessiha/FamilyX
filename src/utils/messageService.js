// src/utils/messageService.js
import { supabase } from './supabase'

// ── Conversations ──────────────────────────────────────────────────────────────
export async function getOrCreateConversation(otherUserId) {
  const { data, error } = await supabase.rpc('get_or_create_conversation', {
    other_user_id: otherUserId
  })
  if (error) throw new Error(error.message)
  return data // uuid
}

export async function getConversations(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id, last_message, last_at,
      profile_a:profiles!conversations_participant_a_fkey(id, name, role_label, role_emoji, avatar_url),
      profile_b:profiles!conversations_participant_b_fkey(id, name, role_label, role_emoji, avatar_url)
    `)
    .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
    .order('last_at', { ascending: false })
  if (error) return []
  return data.map(c => ({
    ...c,
    other: c.profile_a?.id === userId ? c.profile_b : c.profile_a
  }))
}

// ── Messages ──────────────────────────────────────────────────────────────────
export async function getMessages(conversationId, limit = 50) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id, content, type, is_read, created_at, sender_id,
      sender:profiles!messages_sender_id_fkey(id, name, role_emoji, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit)
  if (error) return []
  return data
}

export async function sendMessage(conversationId, senderId, content, type = 'text') {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content, type })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function markMessagesRead(conversationId, userId) {
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false)
}

export async function getUnreadCount(userId) {
  const { data } = await supabase.rpc('unread_count', { p_user_id: userId })
  return data || 0
}

// ── Realtime subscription ─────────────────────────────────────────────────────
export function subscribeToMessages(conversationId, callback) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, payload => callback(payload.new))
    .subscribe()
}

export function subscribeToConversations(userId, callback) {
  return supabase
    .channel(`conversations:${userId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'conversations',
      filter: `participant_a=eq.${userId}`
    }, payload => callback(payload.new))
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'conversations',
      filter: `participant_b=eq.${userId}`
    }, payload => callback(payload.new))
    .subscribe()
}

// ── Group Messages ────────────────────────────────────────────────────────────
export async function getGroupMessages(groupId, limit = 50) {
  const { data, error } = await supabase
    .from('group_messages')
    .select(`
      id, content, type, created_at, sender_id,
      sender:profiles!group_messages_sender_id_fkey(id, name, role_emoji, avatar_url)
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
    .limit(limit)
  if (error) return []
  return data
}

export async function sendGroupMessage(groupId, senderId, content) {
  const { data, error } = await supabase
    .from('group_messages')
    .insert({ group_id: groupId, sender_id: senderId, content })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export function subscribeToGroupMessages(groupId, callback) {
  return supabase
    .channel(`group_messages:${groupId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'group_messages',
      filter: `group_id=eq.${groupId}`
    }, payload => callback(payload.new))
    .subscribe()
}
