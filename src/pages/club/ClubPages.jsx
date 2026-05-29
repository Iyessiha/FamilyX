import { useState } from 'react'
import { Card, Avatar, Badge, Button, SectionTitle, StatBox } from '../../components/shared/UI'
import { getAllCircleMembers } from '../../utils/authStore'

// ── CLUB HOME ─────────────────────────────────────────────────────────────────
export function ClubHome({ c, user }) {
  const [liked, setLiked] = useState({})
  const FEED = [
    { id: 1, author: 'Marc Lebrun', emoji: '🏛️', role: 'Président', time: 'Il y a 1h', content: '📣 Assemblée générale annuelle fixée au 28 Juin à 18h00. Tous les membres sont attendus. Merci de confirmer votre présence.', type: 'AG', likes: 18 },
    { id: 2, author: 'Trésorière Emma', emoji: '💳', role: 'Trésorière', time: 'Il y a 4h', content: '💰 Rapport financier du semestre disponible. Bilan très positif — nous avons atteint 90% de nos objectifs de collecte ! 🎉', type: 'finance', likes: 12 },
    { id: 3, author: 'Groupe Bénévoles', emoji: '💪', role: 'Bénévoles', time: 'Hier', content: 'Journée de nettoyage du parc ce samedi ! Rendez-vous à 9h devant l\'entrée principale. Venez nombreux 🌿', type: 'action', likes: 27 },
  ]

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <StatBox label="Membres" value="34" icon="👥" c={c} />
        <StatBox label="Projets" value="6" icon="🎯" c={c} />
        <StatBox label="Bénévoles" value="12" icon="💪" c={c} />
      </div>

      {/* Next event banner */}
      <Card c={c} style={{ marginBottom: 16, background: `linear-gradient(135deg, ${c.color1}14, ${c.bg})`, border: `1px solid ${c.color1}44` }}>
        <div style={{ fontSize: 11, color: c.color1, fontFamily: 'monospace', marginBottom: 8 }}>📅 PROCHAIN ÉVÉNEMENT</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 36 }}>🏛️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: c.text }}>Assemblée Générale Annuelle</div>
            <div style={{ fontSize: 12, color: c.textMuted }}>28 Juin 2025 · 18h00 · Salle communautaire</div>
            <div style={{ fontSize: 11, color: c.color1, marginTop: 4 }}>18 confirmés · 8 en attente</div>
          </div>
          <Button c={c} small>Je viens ✓</Button>
        </div>
      </Card>

      {/* Ongoing project */}
      <Card c={c} style={{ marginBottom: 16 }}>
        <SectionTitle c={c}>Collecte en cours 🎯</SectionTitle>
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: c.text, marginBottom: 4 }}>
            <span>Fonds matériel scolaire</span>
            <span style={{ color: c.color1, fontWeight: 700 }}>1 850 € / 2 000 €</span>
          </div>
          <div style={{ height: 8, background: `${c.color1}22`, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '92.5%', background: `linear-gradient(90deg, ${c.color1}, ${c.color2})`, borderRadius: 4 }} />
          </div>
          <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>92.5% atteint · 4 jours restants</div>
        </div>
        <Button c={c} small>💜 Contribuer</Button>
      </Card>

      <SectionTitle c={c}>Publications de l'association</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FEED.map(post => (
          <Card key={post.id} c={c}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${c.color1}33, ${c.color2}55)`, border: `2px solid ${c.color1}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{post.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{post.author}</div>
                <div style={{ fontSize: 11, color: c.color1 }}>{post.role} · {post.time}</div>
              </div>
              <Badge label={post.type} color1={c.color1} small />
            </div>
            <div style={{ background: c.bg, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: c.text, lineHeight: 1.6, marginBottom: 10, border: `1px solid ${c.border}14` }}>{post.content}</div>
            <div style={{ display: 'flex', gap: 10, borderTop: `1px solid ${c.border}14`, paddingTop: 8 }}>
              <button onClick={() => setLiked(p => ({ ...p, [post.id]: !p[post.id] }))} style={{ background: 'none', border: 'none', color: liked[post.id] ? c.color1 : c.textMuted, fontSize: 13, cursor: 'pointer', display: 'flex', gap: 5, alignItems: 'center', fontFamily: 'inherit' }}>
                {liked[post.id] ? '💜' : '🤍'} {post.likes + (liked[post.id] ? 1 : 0)}
              </button>
              <button style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>💬 Réagir</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── CLUB MEMBERS ──────────────────────────────────────────────────────────────
export function ClubMembers({ c, user }) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('tous')
  const members = getAllCircleMembers('club')
  const allMembers = members.length > 0 ? members : [
    { id: 'm1', name: 'Marc Lebrun', roleEmoji: '🏛️', roleLabel: 'Président', location: 'Bordeaux', avatar: null },
    { id: 'm2', name: 'Emma Dupuis', roleEmoji: '💳', roleLabel: 'Trésorière', location: 'Bordeaux', avatar: null },
    { id: 'm3', name: 'Lucie Martin', roleEmoji: '📝', roleLabel: 'Secrétaire', location: 'Mérignac', avatar: null },
    { id: 'm4', name: 'Paul Renard', roleEmoji: '💪', roleLabel: 'Bénévole', location: 'Pessac', avatar: null },
    { id: 'm5', name: 'Claire Morin', roleEmoji: '🌟', roleLabel: 'Membre', location: 'Bordeaux', avatar: null },
    { id: 'm6', name: 'Théo Blanc', roleEmoji: '🎗️', roleLabel: 'Parrain', location: 'Talence', avatar: null },
  ]
  const filtered = allMembers.filter(m =>
    (!search || m.name.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === 'tous' || m.roleLabel?.toLowerCase() === roleFilter)
  )

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un membre…"
          style={{ flex: 1, background: c.surface, border: `1px solid ${c.border}33`, borderRadius: 12, padding: '10px 14px', color: c.text, fontSize: 13, outline: 'none' }} />
        <Button c={c} small>+ Inviter</Button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['tous', 'président', 'secrétaire', 'trésorier', 'membre', 'bénévole'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} style={{
            background: roleFilter === r ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.surface,
            border: `1px solid ${roleFilter === r ? 'transparent' : c.border + '22'}`,
            borderRadius: 20, padding: '5px 12px', fontSize: 11, color: roleFilter === r ? '#fff' : c.textMuted,
            cursor: 'pointer', fontFamily: c.font, textTransform: 'capitalize',
          }}>{r}</button>
        ))}
      </div>

      <SectionTitle c={c}>Membres ({filtered.length})</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(m => (
          <Card key={m.id} c={c}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Avatar name={m.name} emoji={m.roleEmoji} size={46} color1={c.color1} color2={c.color2} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{m.name}</div>
                <Badge label={m.roleLabel} color1={c.color1} small />
                {m.location && <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>📍 {m.location}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ background: c.surface, border: `1px solid ${c.border}22`, borderRadius: 8, width: 32, height: 32, fontSize: 15, cursor: 'pointer' }}>💬</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Invite card */}
      <div style={{ marginTop: 12, background: 'transparent', border: `1px dashed ${c.border}44`, borderRadius: 14, padding: 18, textAlign: 'center', cursor: 'pointer' }}>
        <div style={{ fontSize: 30, marginBottom: 6 }}>🤝</div>
        <div style={{ fontSize: 13, color: c.text, marginBottom: 4 }}>Inviter un nouveau membre</div>
        <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 10 }}>Partagez un lien d'invitation unique</div>
        <button style={{ background: `${c.color1}22`, border: `1px solid ${c.color1}44`, borderRadius: 20, padding: '6px 16px', fontSize: 12, color: c.color1, cursor: 'pointer' }}>🔗 Copier le lien</button>
      </div>
    </div>
  )
}

// ── CLUB PROJECTS ─────────────────────────────────────────────────────────────
const CLUB_PROJECTS = [
  { id: 1, name: 'Fonds scolaire 2025', emoji: '📚', progress: 92, goal: '2 000 €', current: '1 850 €', deadline: '25 Juin', color: '#7c3aed', type: 'collecte', volunteers: 6 },
  { id: 2, name: 'Nettoyage parc municipal', emoji: '🌿', progress: 60, goal: '30 bénévoles', current: '18 inscrits', deadline: '22 Juin', color: '#16a34a', type: 'action', volunteers: 18 },
  { id: 3, name: 'Tournoi sportif annuel', emoji: '⚽', progress: 30, goal: 'Organiser', current: 'En préparation', deadline: '12 Juil', color: '#d97706', type: 'événement', volunteers: 4 },
  { id: 4, name: 'Newsletter mensuelle', emoji: '📰', progress: 100, goal: 'Publier', current: 'Publié ✓', deadline: '1 Juin', color: '#0891b2', type: 'communication', volunteers: 2 },
]

export function ClubProjects({ c }) {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionTitle c={c}>Projets & Actions ({CLUB_PROJECTS.length})</SectionTitle>
        <Button c={c} small onClick={() => setShowCreate(!showCreate)}>+ Créer</Button>
      </div>

      {showCreate && (
        <Card c={c} style={{ marginBottom: 14, border: `1px solid ${c.color1}44`, animation: 'slideUp 0.3s ease' }}>
          <SectionTitle c={c}>Nouveau projet</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Nom du projet', 'text'], ['Objectif (ex: 500€, 20 bénévoles)', 'text'], ['Date limite', 'date']].map(([ph, type]) => (
              <input key={ph} type={type} placeholder={ph} style={{ background: c.bg, border: `1px solid ${c.border}33`, borderRadius: 10, padding: '10px 14px', color: c.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            ))}
            <Button c={c} small full onClick={() => setShowCreate(false)}>Créer ✓</Button>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {CLUB_PROJECTS.map(p => (
          <Card key={p.id} c={c}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${p.color}22`, border: `1px solid ${p.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 2 }}>{p.name}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                  <Badge label={p.type} color1={p.color} small />
                  <Badge label={`📅 ${p.deadline}`} color1={c.textMuted} small />
                  {p.volunteers > 0 && <Badge label={`💪 ${p.volunteers}`} color1={c.textMuted} small />}
                </div>
                <div style={{ fontSize: 12, color: c.textMuted }}>{p.current} / {p.goal}</div>
              </div>
            </div>
            <div style={{ marginBottom: p.progress < 100 ? 10 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: c.textMuted, marginBottom: 5 }}>
                <span>Progression</span>
                <span style={{ color: p.progress === 100 ? '#22c55e' : p.color, fontWeight: 700 }}>{p.progress}%</span>
              </div>
              <div style={{ height: 6, background: `${p.color}22`, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${p.progress}%`, background: p.progress === 100 ? '#22c55e' : `linear-gradient(90deg, ${p.color}, ${p.color}99)`, borderRadius: 3 }} />
              </div>
            </div>
            {p.progress < 100 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <Button c={c} small>Participer</Button>
                <Button c={c} small variant="ghost">Voir détails</Button>
              </div>
            )}
            {p.progress === 100 && <div style={{ fontSize: 12, color: '#22c55e', marginTop: 4 }}>✅ Projet terminé</div>}
          </Card>
        ))}
      </div>
    </div>
  )
}
