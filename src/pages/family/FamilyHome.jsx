import { useState } from 'react'
import { Card, Avatar, Badge, Button, SectionTitle, StatBox } from '../../components/shared/UI'
import { StoriesBar } from '../../components/shared/Stories'

const FEED = [
  { id: 1, author: 'Grand-mère Marie', roleEmoji: '👵', role: 'Grand-mère', time: 'Il y a 2h', content: 'Retrouvailles au village la semaine prochaine ! Tout le monde est invité 🏡❤️', likes: 14, comments: 6, type: 'status' },
  { id: 2, author: 'Papa Kofi', roleEmoji: '👨', role: 'Père', time: 'Il y a 4h', content: '📅 Anniversaire de Grand-père Jean — 15 Juin ! N\'oubliez pas de lui souhaiter 🎂', likes: 9, comments: 3, type: 'event' },
  { id: 3, author: 'Cousine Akua', roleEmoji: '👧🏽', role: 'Cousine', time: 'Hier', content: 'Vacances à Abidjan avec toute la famille, que de bons souvenirs 🌴😍', likes: 22, comments: 11, type: 'photo' },
]

const BIRTHDAYS = [
  { name: 'Grand-père Jean', date: '15 Juin', emoji: '👴', days: 3 },
  { name: 'Sœur Efua', date: '22 Juin', emoji: '👧🏿', days: 10 },
]

export default function FamilyHome({ c, user }) {
  const [liked, setLiked] = useState({})
  const [postText, setPostText] = useState('')

  return (
    <div className="fade-in">
      {/* Stories */}
      <StoriesBar c={c} user={user} />

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <StatBox label="Membres" value="10" icon="👨‍👩‍👧" c={c} />
        <StatBox label="Générations" value="3" icon="🌳" c={c} />
        <StatBox label="Groupes" value="4" icon="💬" c={c} />
      </div>

      {/* Birthdays banner */}
      <Card c={c} style={{ marginBottom: 20, background: `linear-gradient(135deg, ${c.color1}18, ${c.color2}10)`, border: `1px solid ${c.color1}44` }}>
        <div style={{ fontSize: 12, color: c.color1, fontFamily: 'monospace', marginBottom: 8 }}>🎂 ANNIVERSAIRES À VENIR</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {BIRTHDAYS.map((b) => (
            <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{b.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{b.name}</div>
                <div style={{ fontSize: 11, color: c.textMuted }}>{b.date}</div>
              </div>
              <Badge label={`Dans ${b.days}j`} color1={c.color1} small />
            </div>
          ))}
        </div>
      </Card>

      {/* Post composer */}
      <Card c={c} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <Avatar name={user?.name} emoji={user?.roleEmoji} size={38} color1={c.color1} color2={c.color2} online />
          <textarea
            value={postText}
            onChange={e => setPostText(e.target.value)}
            placeholder="Partage quelque chose avec ta famille… 🌿"
            rows={postText ? 3 : 1}
            style={{
              flex: 1, background: c.bg, border: `1px solid ${c.border}22`,
              borderRadius: 12, padding: '10px 14px',
              color: c.text, fontSize: 13, resize: 'none', outline: 'none',
              fontFamily: c.font, transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = c.color1}
            onBlur={e => e.target.style.borderColor = `${c.border}22`}
          />
        </div>
        {postText && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setPostText('')} style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: 13, cursor: 'pointer' }}>Annuler</button>
            <Button c={c} small onClick={() => setPostText('')}>Publier ✓</Button>
          </div>
        )}
        {!postText && (
          <div style={{ display: 'flex', gap: 8 }}>
            {[['📸', 'Photo'], ['📅', 'Événement'], ['🎂', 'Anniversaire']].map(([icon, label]) => (
              <button key={label} onClick={() => setPostText(`${icon} `)} style={{
                flex: 1, background: c.bg, border: `1px solid ${c.border}22`,
                borderRadius: 10, padding: '8px 4px',
                color: c.textMuted, fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>{icon} {label}</button>
            ))}
          </div>
        )}
      </Card>

      {/* Feed */}
      <SectionTitle c={c}>Actualités familiales</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {FEED.map((post) => (
          <PostCard key={post.id} post={post} c={c} liked={liked} onLike={() => setLiked(p => ({ ...p, [post.id]: !p[post.id] }))} />
        ))}
      </div>
    </div>
  )
}

function PostCard({ post, c, liked, onLike }) {
  const [showComments, setShowComments] = useState(false)
  const isLiked = liked[post.id]

  return (
    <Card c={c}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
        <Avatar name={post.author} emoji={post.roleEmoji} size={42} color1={c.color1} color2={c.color2} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{post.author}</div>
          <div style={{ fontSize: 11, color: c.color1 }}>{post.role} · {post.time}</div>
        </div>
        <Badge label={post.type === 'event' ? '📅 Événement' : post.type === 'photo' ? '📸 Photo' : '✍️ Statut'} color1={c.color1} small />
      </div>

      <div style={{
        background: c.bg, borderRadius: 10, padding: '12px 14px',
        fontSize: 14, color: c.text, lineHeight: 1.6, marginBottom: 12,
        border: `1px solid ${c.border}18`,
      }}>
        {post.content}
      </div>

      <div style={{ display: 'flex', gap: 6, borderTop: `1px solid ${c.border}18`, paddingTop: 10 }}>
        <ActionBtn icon={isLiked ? '❤️' : '🤍'} count={post.likes + (isLiked ? 1 : 0)} onClick={onLike} active={isLiked} c={c} />
        <ActionBtn icon="💬" count={post.comments} onClick={() => setShowComments(!showComments)} c={c} />
        <ActionBtn icon="↗️" label="Partager" c={c} style={{ marginLeft: 'auto' }} />
      </div>

      {showComments && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${c.border}18` }}>
          <CommentInput c={c} />
          <div style={{ fontSize: 12, color: c.textMuted, marginTop: 8, textAlign: 'center' }}>
            Afficher les {post.comments} commentaires
          </div>
        </div>
      )}
    </Card>
  )
}

function ActionBtn({ icon, count, label, onClick, active, c, style: s = {} }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      color: active ? c.color1 : c.textMuted, fontSize: 13,
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 8px', borderRadius: 8,
      transition: 'color 0.15s', fontFamily: 'inherit',
      ...s,
    }}>
      {icon} {count ?? label}
    </button>
  )
}

function CommentInput({ c }) {
  const [val, setVal] = useState('')
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input value={val} onChange={e => setVal(e.target.value)}
        placeholder="Ajouter un commentaire…"
        style={{
          flex: 1, background: c.bg, border: `1px solid ${c.border}22`,
          borderRadius: 20, padding: '7px 14px', color: c.text, fontSize: 13, outline: 'none',
        }}
      />
      <button onClick={() => setVal('')} style={{
        background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`,
        border: 'none', borderRadius: '50%', width: 32, height: 32,
        color: '#fff', fontSize: 14, cursor: 'pointer',
      }}>➤</button>
    </div>
  )
}
