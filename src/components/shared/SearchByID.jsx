import { useState } from 'react'
import { Card, Avatar, Badge, Button } from './UI'
import { sendLinkRequest } from '../../utils/authStore'

// Search any user across ALL circles by their ID or name
function getAllUsers() {
  try { return JSON.parse(localStorage.getItem('familyx_users') || '[]') } catch { return [] }
}

export function SearchByID({ c, user, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [sent, setSent] = useState({})
  const [relation, setRelation] = useState({})
  const [mode, setMode] = useState('id') // 'id' | 'name'

  const search = () => {
    if (!query.trim()) return
    const all = getAllUsers()
    let found = []
    if (mode === 'id') {
      found = all.filter(u => u.id === query.trim() && u.id !== user.id)
    } else {
      found = all.filter(u =>
        u.id !== user.id &&
        u.name.toLowerCase().includes(query.toLowerCase())
      )
    }
    setResults(found.map(u => ({
      id: u.id, name: u.name, roleLabel: u.roleLabel, roleEmoji: u.roleEmoji,
      avatar: u.avatar, location: u.location, circleId: u.circleId,
      circleTag: getCircleTag(u.circleId),
    })))
  }

  const getCircleTag = (id) => {
    const tags = { family: 'FamilyX', mosque: 'MosqueX', church: 'ChurchX', org: 'OrgX', club: 'ClubX' }
    return tags[id] || id
  }
  const getCircleEmoji = (id) => {
    const emojis = { family: '👨‍👩‍👧‍👦', mosque: '🕌', church: '⛪', org: '🏢', club: '🤝' }
    return emojis[id] || '🌐'
  }

  const sendReq = (toId) => {
    const rel = relation[toId] || 'contact'
    const res = sendLinkRequest(user.id, toId, rel)
    if (res.error) { alert(res.error); return }
    setSent(p => ({ ...p, [toId]: true }))
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900,
      background: '#000000cc', display: 'flex', alignItems: 'flex-end',
      maxWidth: 430, margin: '0 auto',
    }}>
      <div style={{
        background: c.bgSecond, borderRadius: '20px 20px 0 0',
        border: `1px solid ${c.border}33`, width: '100%',
        padding: '20px 16px 40px', maxHeight: '80vh', overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: c.textSubtle, borderRadius: 2, margin: '0 auto 18px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: c.text }}>🔍 Rechercher un membre</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* My ID card */}
        <Card c={c} style={{ marginBottom: 16, background: `${c.color1}14`, border: `1px solid ${c.color1}44` }}>
          <div style={{ fontSize: 11, color: c.color1, fontFamily: 'monospace', marginBottom: 6 }}>🪪 MON ID — À PARTAGER</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 14, color: c.text, background: c.bg, borderRadius: 8, padding: '6px 12px', flex: 1, wordBreak: 'break-all' }}>
              {user.id}
            </div>
            <button onClick={() => navigator.clipboard.writeText(user.id)} style={{
              background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`,
              border: 'none', borderRadius: 8, padding: '7px 12px',
              color: '#fff', fontSize: 12, cursor: 'pointer',
            }}>📋 Copier</button>
          </div>
        </Card>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: c.surface, border: `1px solid ${c.border}22`, borderRadius: 12, padding: 4, marginBottom: 14, gap: 4 }}>
          {[['id', '🪪 Par ID'], ['name', '🔤 Par nom']].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setQuery(''); setResults([]) }} style={{
              flex: 1, border: 'none', borderRadius: 8, padding: '9px',
              background: mode === m ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : 'transparent',
              color: mode === m ? '#fff' : c.textMuted,
              fontSize: 13, fontWeight: mode === m ? 700 : 400,
              cursor: 'pointer', fontFamily: c.font, transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder={mode === 'id' ? 'Collez l\'ID du membre (ex: u1234…)' : 'Nom du membre…'}
            style={{
              flex: 1, background: c.surface, border: `1px solid ${c.border}33`,
              borderRadius: 12, padding: '11px 14px', color: c.text,
              fontSize: 13, outline: 'none', fontFamily: c.font,
            }}
            onFocus={e => e.target.style.borderColor = c.color1}
            onBlur={e => e.target.style.borderColor = `${c.border}33`}
          />
          <button onClick={search} style={{
            background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`,
            border: 'none', borderRadius: 12, padding: '0 18px',
            color: '#fff', fontSize: 15, cursor: 'pointer',
          }}>🔍</button>
        </div>

        {/* Results */}
        {results.length === 0 && query && (
          <div style={{ textAlign: 'center', color: c.textMuted, fontSize: 13, padding: '20px 0' }}>
            Aucun membre trouvé. Vérifiez l'ID ou le nom.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {results.map(m => (
            <Card key={m.id} c={c}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${c.color1}33, ${c.color2}55)`,
                  border: `2px solid ${c.border}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, overflow: 'hidden',
                }}>
                  {m.avatar ? <img src={m.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.roleEmoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 4 }}>{m.name}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Badge label={m.roleLabel} color1={c.color1} small />
                    <Badge label={`${getCircleEmoji(m.circleId)} ${m.circleTag}`} color1={c.textMuted} small />
                  </div>
                  {m.location && <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>📍 {m.location}</div>}
                  <div style={{ fontSize: 10, color: c.textSubtle, marginTop: 2, fontFamily: 'monospace' }}>ID: {m.id}</div>
                </div>
              </div>

              {!sent[m.id] ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={relation[m.id] || ''}
                    onChange={e => setRelation(p => ({ ...p, [m.id]: e.target.value }))}
                    placeholder="Relation (ex: Mon cousin, Mon collègue…)"
                    style={{
                      flex: 1, background: c.bg, border: `1px solid ${c.border}22`,
                      borderRadius: 10, padding: '8px 12px', color: c.text,
                      fontSize: 12, outline: 'none', fontFamily: c.font,
                    }}
                  />
                  <button onClick={() => sendReq(m.id)} style={{
                    background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`,
                    border: 'none', borderRadius: 10, padding: '8px 14px',
                    color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}>
                    + Lier
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#22c55e', display: 'flex', gap: 6, alignItems: 'center' }}>
                  ✅ Demande envoyée à {m.name}
                </div>
              )}
            </Card>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: c.textSubtle, lineHeight: 1.6 }}>
          Partagez votre ID à vos proches pour qu'ils puissent vous retrouver,<br />
          peu importe leur cercle dans FamilyX.
        </div>
      </div>
    </div>
  )
}
