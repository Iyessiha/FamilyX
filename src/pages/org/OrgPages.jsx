import { useState } from 'react'
import { Card, Avatar, Badge, Button, SectionTitle, StatBox } from '../../components/shared/UI'
import { getAllCircleMembers } from '../../utils/authStore'

// ── ORG HOME / DASHBOARD ──────────────────────────────────────────────────────
export function OrgHome({ c, user }) {
  const [liked, setLiked] = useState({})
  const ANNOUNCEMENTS = [
    { id: 1, author: 'Sara Dupont', emoji: '📊', role: 'Manager', time: 'Il y a 1h', content: '📣 Réunion trimestrielle vendredi 10h — présence obligatoire pour tous les chefs de projet.', type: 'annonce', likes: 8 },
    { id: 2, author: 'Équipe RH', emoji: '🤝', role: 'RH', time: 'Il y a 3h', content: '🎉 Bienvenue à nos 3 nouveaux collaborateurs qui rejoignent l\'équipe cette semaine !', type: 'news', likes: 22 },
    { id: 3, author: 'Direction', emoji: '👑', role: 'CEO', time: 'Hier', content: '🏆 Notre équipe a atteint 120% des objectifs du trimestre. Félicitations à tous ! 💼', type: 'victoire', likes: 45 },
  ]
  const KPIs = [{ label: 'Collaborateurs', value: '24', icon: '👥' }, { label: 'Projets actifs', value: '8', icon: '📋' }, { label: 'Tâches ouvertes', value: '47', icon: '✅' }, { label: 'Réunions ce mois', value: '12', icon: '📅' }]

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: c.text, marginBottom: 2 }}>Bonjour, {user?.name?.split(' ')[0]} 👋</div>
        <div style={{ fontSize: 13, color: c.textMuted }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {KPIs.map(k => <StatBox key={k.label} {...k} c={c} />)}
      </div>

      {/* My tasks */}
      <Card c={c} style={{ marginBottom: 16 }}>
        <SectionTitle c={c} action={<Button c={c} small>Voir tout</Button>}>Mes tâches</SectionTitle>
        {[
          { label: 'Finaliser la maquette v2', due: 'Aujourd\'hui', prio: 'haute' },
          { label: 'Revue de code — module auth', due: 'Demain', prio: 'normale' },
          { label: 'Préparer slides réunion', due: 'Vendredi', prio: 'normale' },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: i < 2 ? `1px solid ${c.border}14` : 'none' }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${c.color1}66`, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: c.text }}>{t.label}</div>
              <div style={{ fontSize: 11, color: c.textMuted }}>📅 {t.due}</div>
            </div>
            <Badge label={t.prio} color1={t.prio === 'haute' ? '#ef4444' : c.color1} small />
          </div>
        ))}
      </Card>

      <SectionTitle c={c}>Publications internes</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ANNOUNCEMENTS.map(post => (
          <Card key={post.id} c={c}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${c.color1}33, ${c.color2}55)`, border: `1px solid ${c.border}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{post.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{post.author}</div>
                <div style={{ fontSize: 11, color: c.color1 }}>{post.role} · {post.time}</div>
              </div>
              <Badge label={post.type} color1={c.color1} small />
            </div>
            <div style={{ background: c.bg, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: c.text, lineHeight: 1.6, marginBottom: 10, border: `1px solid ${c.border}14` }}>{post.content}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setLiked(p => ({ ...p, [post.id]: !p[post.id] }))} style={{ background: 'none', border: 'none', color: liked[post.id] ? c.color1 : c.textMuted, fontSize: 13, cursor: 'pointer', display: 'flex', gap: 5, alignItems: 'center', fontFamily: 'inherit' }}>
                {liked[post.id] ? '👍' : '👍🏼'} {post.likes + (liked[post.id] ? 1 : 0)}
              </button>
              <button style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>💬 Commenter</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── ORG TEAMS ─────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { id: 1, name: 'Produit & Design', emoji: '🎨', count: 5, head: 'Sara Dupont', color: '#2563eb' },
  { id: 2, name: 'Développement', emoji: '💻', count: 8, head: 'Dev Lead', color: '#16a34a' },
  { id: 3, name: 'Commercial', emoji: '💼', count: 4, head: 'Sales Dir.', color: '#d97706' },
  { id: 4, name: 'Ressources Humaines', emoji: '🤝', count: 2, head: 'RH Manager', color: '#7c3aed' },
  { id: 5, name: 'Finance', emoji: '💰', count: 3, head: 'CFO', color: '#0891b2' },
]

export function OrgTeams({ c, user }) {
  const [activeTeam, setActiveTeam] = useState(null)
  const members = getAllCircleMembers('org')
  const allMembers = members.length > 0 ? members : [
    { id: 'm1', name: 'Sara Dupont', roleEmoji: '📊', roleLabel: 'Manager', location: 'Lyon', avatar: null },
    { id: 'm2', name: 'Alex Martin', roleEmoji: '💻', roleLabel: 'Développeur', location: 'Paris', avatar: null },
    { id: 'm3', name: 'Julie Bernard', roleEmoji: '🎨', roleLabel: 'Designer', location: 'Bordeaux', avatar: null },
    { id: 'm4', name: 'Tom Leroy', roleEmoji: '💰', roleLabel: 'Finance', location: 'Lyon', avatar: null },
    { id: 'm5', name: 'Emma Petit', roleEmoji: '🤝', roleLabel: 'RH', location: 'Paris', avatar: null },
  ]

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionTitle c={c}>Organigramme</SectionTitle>
        <Button c={c} small>+ Département</Button>
      </div>

      {/* Org chart visual */}
      <Card c={c} style={{ marginBottom: 16, padding: '16px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ display: 'inline-flex', background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`, borderRadius: 12, padding: '8px 18px', fontSize: 13, color: '#fff', fontWeight: 700 }}>👑 Direction Générale</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {DEPARTMENTS.map(dept => (
            <div key={dept.id} onClick={() => setActiveTeam(activeTeam === dept.id ? null : dept.id)} style={{
              background: activeTeam === dept.id ? `${dept.color}22` : c.surface,
              border: `1px solid ${activeTeam === dept.id ? dept.color : c.border + '33'}`,
              borderRadius: 12, padding: '10px 14px', cursor: 'pointer', textAlign: 'center',
              transition: 'all 0.2s', minWidth: 90,
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{dept.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.text, lineHeight: 1.2 }}>{dept.name}</div>
              <div style={{ fontSize: 10, color: dept.color, marginTop: 2 }}>{dept.count} pers.</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Members list */}
      <SectionTitle c={c}>Tous les collaborateurs ({allMembers.length})</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {allMembers.map(m => (
          <Card key={m.id} c={c}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Avatar name={m.name} emoji={m.roleEmoji} size={46} color1={c.color1} color2={c.color2} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{m.name}</div>
                <div style={{ fontSize: 12, color: c.color1 }}>{m.roleLabel}</div>
                {m.location && <div style={{ fontSize: 11, color: c.textMuted }}>📍 {m.location}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ background: c.surface, border: `1px solid ${c.border}22`, borderRadius: 8, width: 32, height: 32, fontSize: 15, cursor: 'pointer' }}>💬</button>
                <button style={{ background: c.surface, border: `1px solid ${c.border}22`, borderRadius: 8, width: 32, height: 32, fontSize: 15, cursor: 'pointer' }}>📋</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── ORG PROJECTS ──────────────────────────────────────────────────────────────
const PROJECTS = [
  { id: 1, name: 'App Mobile v2', desc: 'Refonte complète de l\'application mobile', progress: 68, status: 'en cours', members: 4, deadline: '30 Juin', emoji: '📱', color: '#2563eb' },
  { id: 2, name: 'Dashboard Analytics', desc: 'Tableau de bord analytique en temps réel', progress: 35, status: 'en cours', members: 3, deadline: '15 Juil', emoji: '📊', color: '#16a34a' },
  { id: 3, name: 'API v3 Migration', desc: 'Migration vers la nouvelle architecture API', progress: 90, status: 'finalisation', members: 5, deadline: '10 Juin', emoji: '⚙️', color: '#d97706' },
  { id: 4, name: 'Campagne Q3', desc: 'Stratégie marketing du 3ème trimestre', progress: 15, status: 'démarrage', members: 2, deadline: '1 Août', emoji: '🎯', color: '#7c3aed' },
]

export function OrgProjects({ c }) {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionTitle c={c}>Projets ({PROJECTS.length})</SectionTitle>
        <Button c={c} small onClick={() => setShowCreate(!showCreate)}>+ Nouveau projet</Button>
      </div>

      {showCreate && (
        <Card c={c} style={{ marginBottom: 14, border: `1px solid ${c.color1}44`, animation: 'slideUp 0.3s ease' }}>
          <SectionTitle c={c}>Nouveau projet</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Nom du projet', 'Description', 'Date limite'].map(ph => (
              <input key={ph} placeholder={ph} style={{ background: c.bg, border: `1px solid ${c.border}33`, borderRadius: 10, padding: '10px 14px', color: c.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            ))}
            <Button c={c} small full onClick={() => setShowCreate(false)}>Créer le projet ✓</Button>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {PROJECTS.map(p => (
          <Card key={p.id} c={c}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: `${p.color}22`, border: `1px solid ${p.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 6 }}>{p.desc}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Badge label={p.status} color1={p.color} small />
                  <Badge label={`👥 ${p.members}`} color1={c.textMuted} small />
                  <Badge label={`📅 ${p.deadline}`} color1={c.textMuted} small />
                </div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: c.textMuted, marginBottom: 6 }}>
                <span>Progression</span>
                <span style={{ color: p.color, fontWeight: 700 }}>{p.progress}%</span>
              </div>
              <div style={{ height: 6, background: `${p.color}22`, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${p.progress}%`, background: `linear-gradient(90deg, ${p.color}, ${p.color}99)`, borderRadius: 3, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
