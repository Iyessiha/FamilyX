import { useState, useRef, useEffect } from 'react'

// Stories stored in localStorage
const STORIES_KEY = 'familyx_stories'

function getStories() {
  try { return JSON.parse(localStorage.getItem(STORIES_KEY) || '[]') } catch { return [] }
}
function saveStories(stories) {
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories))
}
function getActiveStories(circleId) {
  const now = Date.now()
  return getStories().filter(s => s.circleId === circleId && (now - s.createdAt) < 24 * 60 * 60 * 1000)
}
export function addStory({ userId, userName, userEmoji, userAvatar, circleId, image, text, bg }) {
  const stories = getStories()
  stories.push({ id: 's' + Date.now(), userId, userName, userEmoji, userAvatar, circleId, image, text, bg, createdAt: Date.now(), views: [] })
  saveStories(stories)
}
export function viewStory(storyId, userId) {
  const stories = getStories()
  const idx = stories.findIndex(s => s.id === storyId)
  if (idx !== -1 && !stories[idx].views.includes(userId)) {
    stories[idx].views.push(userId)
    saveStories(stories)
  }
}

const BG_OPTIONS = [
  { id: 'dark', label: 'Sombre', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { id: 'gold', label: 'Or', bg: 'linear-gradient(135deg, #B8860B, #8B4513)' },
  { id: 'green', label: 'Vert', bg: 'linear-gradient(135deg, #064e3b, #065f46)' },
  { id: 'purple', label: 'Violet', bg: 'linear-gradient(135deg, #4c1d95, #6d28d9)' },
  { id: 'blue', label: 'Bleu', bg: 'linear-gradient(135deg, #1e3a5f, #2563eb)' },
  { id: 'sunset', label: 'Coucher', bg: 'linear-gradient(135deg, #7f1d1d, #c2410c, #d97706)' },
]

// ── Story Viewer ──────────────────────────────────────────────────────────────
function StoryViewer({ stories, startIndex, onClose, user }) {
  const [current, setCurrent] = useState(startIndex)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef(null)
  const s = stories[current]

  useEffect(() => {
    if (s) viewStory(s.id, user.id)
    setProgress(0)
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (current < stories.length - 1) { setCurrent(c => c + 1); return 0 }
          else { onClose(); return 100 }
        }
        return p + 2
      })
    }, 100)
    return () => clearInterval(intervalRef.current)
  }, [current])

  if (!s) return null

  const timeAgo = () => {
    const diff = Date.now() - s.createdAt
    const h = Math.floor(diff / 3600000)
    const m = Math.floor(diff / 60000)
    if (h > 0) return `Il y a ${h}h`
    if (m > 0) return `Il y a ${m}min`
    return 'À l\'instant'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: s.image ? `url(${s.image}) center/cover no-repeat` : s.bg || '#111',
      display: 'flex', flexDirection: 'column',
      maxWidth: 430, margin: '0 auto',
    }}>
      {/* Dark overlay */}
      {!s.image && <div style={{ position: 'absolute', inset: 0, background: s.bg || 'linear-gradient(135deg,#111,#333)' }} />}
      {s.image && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #00000066 0%, transparent 40%, transparent 60%, #000000aa 100%)' }} />}

      {/* Progress bars */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: 4, padding: '12px 14px 8px' }}>
        {stories.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, background: '#ffffff33', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2, background: '#fff',
              width: i < current ? '100%' : i === current ? `${progress}%` : '0%',
              transition: i === current ? 'none' : 'none',
            }} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', gap: 10, alignItems: 'center', padding: '4px 14px 10px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #B8860B, #8B4513)',
          border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, overflow: 'hidden', flexShrink: 0,
        }}>
          {s.userAvatar ? <img src={s.userAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : s.userEmoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{s.userName}</div>
          <div style={{ fontSize: 10, color: '#ffffff99' }}>{timeAgo()} · {s.views.length} vues</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>✕</button>
      </div>

      {/* Content area — tap left/right to navigate */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 10 }}>
        <div onClick={() => current > 0 && setCurrent(c => c - 1)} style={{ width: '35%', height: '100%', cursor: 'pointer' }} />
        <div style={{ flex: 1 }} />
        <div onClick={() => { if (current < stories.length - 1) setCurrent(c => c + 1); else onClose() }} style={{ width: '35%', height: '100%', cursor: 'pointer' }} />
      </div>

      {/* Text overlay */}
      {s.text && (
        <div style={{
          position: 'relative', zIndex: 10,
          padding: '0 20px 20px',
          textAlign: 'center',
        }}>
          <div style={{
            background: '#00000066', borderRadius: 12, padding: '12px 16px',
            fontSize: 16, color: '#fff', lineHeight: 1.6, fontWeight: 500,
            backdropFilter: 'blur(4px)',
          }}>{s.text}</div>
        </div>
      )}

      {/* Nav arrows */}
      <div style={{ position: 'absolute', bottom: 80, left: 14, right: 14, zIndex: 20, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        {current > 0 && <div style={{ background: '#ffffff22', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, pointerEvents: 'all', cursor: 'pointer' }} onClick={() => setCurrent(c => c - 1)}>‹</div>}
        {current < stories.length - 1 && <div style={{ marginLeft: 'auto', background: '#ffffff22', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, pointerEvents: 'all', cursor: 'pointer' }} onClick={() => setCurrent(c => c + 1)}>›</div>}
      </div>
    </div>
  )
}

// ── Story Creator ─────────────────────────────────────────────────────────────
function StoryCreator({ c, user, onClose, onPublish }) {
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [selectedBg, setSelectedBg] = useState(BG_OPTIONS[0])
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Image trop grande (max 5Mo)'); return }
    const reader = new FileReader()
    reader.onload = ev => setImage(ev.target.result)
    reader.readAsDataURL(file)
  }

  const publish = () => {
    if (!text.trim() && !image) { alert('Ajoutez du texte ou une image.'); return }
    addStory({
      userId: user.id, userName: user.name,
      userEmoji: user.roleEmoji, userAvatar: user.avatar,
      circleId: user.circleId, image, text, bg: selectedBg.bg,
    })
    onPublish()
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: '#000000cc', display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto' }}>
      {/* Preview */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: image ? `url(${image}) center/cover no-repeat` : selectedBg.bg,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        {image && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, #000000aa 100%)' }} />}

        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 14px 10px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
          <button onClick={onClose} style={{ background: '#00000055', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current.click()} style={{ background: '#00000055', border: '1px solid #ffffff44', borderRadius: 20, padding: '6px 14px', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            📷 {image ? 'Changer' : 'Ajouter photo'}
          </button>
        </div>

        {/* Text preview */}
        {text && (
          <div style={{ position: 'relative', zIndex: 10, padding: '0 20px 16px', textAlign: 'center' }}>
            <div style={{ background: '#00000066', borderRadius: 12, padding: '12px 16px', fontSize: 18, color: '#fff', lineHeight: 1.5, backdropFilter: 'blur(4px)' }}>{text}</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ background: '#111', padding: '14px 14px 24px' }}>
        {/* BG picker (only if no image) */}
        {!image && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {BG_OPTIONS.map(bg => (
              <div key={bg.id} onClick={() => setSelectedBg(bg)} style={{
                width: 36, height: 36, borderRadius: 10, background: bg.bg, flexShrink: 0, cursor: 'pointer',
                border: selectedBg.id === bg.id ? '3px solid #fff' : '2px solid #333',
                transition: 'border 0.15s',
              }} />
            ))}
          </div>
        )}

        {/* Text input */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            value={text} onChange={e => setText(e.target.value)}
            placeholder="Écrivez quelque chose… ✍️"
            rows={2}
            style={{
              flex: 1, background: '#222', border: '1px solid #444',
              borderRadius: 12, padding: '10px 14px', color: '#fff', fontSize: 14,
              resize: 'none', outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button onClick={publish} style={{
            background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`,
            border: 'none', borderRadius: 12, padding: '10px 16px',
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>Publier</button>
        </div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 8, textAlign: 'center' }}>
          La story disparaît automatiquement après 24h
        </div>
      </div>
    </div>
  )
}

// ── Stories Bar ───────────────────────────────────────────────────────────────
export function StoriesBar({ c, user, onRefresh }) {
  const [stories, setStories] = useState(() => getActiveStories(user.circleId))
  const [viewing, setViewing] = useState(null) // index
  const [creating, setCreating] = useState(false)

  const refresh = () => setStories(getActiveStories(user.circleId))

  // Group by user
  const grouped = stories.reduce((acc, s) => {
    if (!acc[s.userId]) acc[s.userId] = { userId: s.userId, userName: s.userName, userEmoji: s.userEmoji, userAvatar: s.userAvatar, stories: [] }
    acc[s.userId].stories.push(s)
    return acc
  }, {})
  const groups = Object.values(grouped)
  const myStories = stories.filter(s => s.userId === user.id)
  const hasViewed = (group) => group.stories.every(s => s.views.includes(user.id))

  const allStories = stories // flat list for viewer
  const getStartIndex = (group) => stories.findIndex(s => s.id === group.stories[0].id)

  return (
    <>
      <div style={{
        display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8,
        marginBottom: 16, paddingTop: 2,
        scrollbarWidth: 'none',
      }}>
        {/* Add story */}
        <div onClick={() => setCreating(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', flexShrink: 0 }}>
          <div style={{
            width: 58, height: 58, borderRadius: '50%',
            background: c.surface, border: `2px dashed ${c.border}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, position: 'relative', overflow: 'hidden',
          }}>
            {user.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28 }}>{user.roleEmoji}</span>}
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 20, height: 20, borderRadius: '50%',
              background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`,
              border: `2px solid ${c.bg}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: '#fff', fontWeight: 900,
            }}>+</div>
          </div>
          <div style={{ fontSize: 10, color: c.textMuted, textAlign: 'center', maxWidth: 58, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {myStories.length > 0 ? `Ma story` : 'Ajouter'}
          </div>
        </div>

        {/* Stories from others */}
        {groups.filter(g => g.userId !== user.id).map(group => (
          <div key={group.userId} onClick={() => setViewing(getStartIndex(group))} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', flexShrink: 0 }}>
            <div style={{
              width: 58, height: 58, borderRadius: '50%',
              border: `3px solid ${hasViewed(group) ? c.textSubtle : c.color1}`,
              padding: 2, background: c.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: group.stories[0].image ? `url(${group.stories[0].image}) center/cover` : group.stories[0].bg || c.surface,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}>
                {!group.stories[0].image && (group.userAvatar
                  ? <img src={group.userAvatar} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : group.userEmoji)}
              </div>
            </div>
            <div style={{ fontSize: 10, color: hasViewed(group) ? c.textSubtle : c.text, textAlign: 'center', maxWidth: 58, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {group.userName.split(' ')[0]}
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div style={{ fontSize: 12, color: c.textMuted, display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px' }}>
            Aucune story active — soyez le premier ! 🌟
          </div>
        )}
      </div>

      {creating && (
        <StoryCreator c={c} user={user} onClose={() => setCreating(false)} onPublish={refresh} />
      )}
      {viewing !== null && (
        <StoryViewer stories={allStories} startIndex={viewing} onClose={() => { setViewing(null); refresh() }} user={user} />
      )}
    </>
  )
}
