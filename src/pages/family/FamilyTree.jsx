import { useState } from 'react'
import { Card, Avatar, Button, Badge } from '../../components/shared/UI'

const MEMBERS = [
  { id: 1, name: 'Grand-père Jean', role: 'Grand-père', emoji: '👴', gen: 0, parentIds: [], location: 'Abidjan', online: false, bio: 'Chef de famille, retraité.' },
  { id: 2, name: 'Grand-mère Marie', role: 'Grand-mère', emoji: '👵', gen: 0, parentIds: [], location: 'Abidjan', online: true, bio: 'Cuisinière exceptionnelle !' },
  { id: 3, name: 'Papa Kofi', role: 'Père', emoji: '👨🏿', gen: 1, parentIds: [1, 2], location: 'Paris', online: true, bio: 'Ingénieur, père de famille.' },
  { id: 4, name: 'Maman Ama', role: 'Mère', emoji: '👩🏿', gen: 1, parentIds: [], location: 'Paris', online: false, bio: 'Médecin, pilier de la famille.' },
  { id: 5, name: 'Oncle Samuel', role: 'Oncle', emoji: '🧔🏿', gen: 1, parentIds: [1, 2], location: 'Lyon', online: true, bio: 'Entrepreneur.' },
  { id: 6, name: 'Tante Grace', role: 'Tante', emoji: '👩🏽', gen: 1, parentIds: [], location: 'Dakar', online: false, bio: 'Enseignante.' },
  { id: 7, name: 'Moi — Yaw', role: 'Fils', emoji: '🧑🏿', gen: 2, parentIds: [3, 4], location: 'Paris', online: true, bio: 'Développeur et entrepreneur.' },
  { id: 8, name: 'Sœur Efua', role: 'Sœur', emoji: '👧🏿', gen: 2, parentIds: [3, 4], location: 'Paris', online: true, bio: 'Étudiante en droit.' },
  { id: 9, name: 'Cousin Kwame', role: 'Cousin', emoji: '👦🏿', gen: 2, parentIds: [5, 6], location: 'Lyon', online: false, bio: 'Footballeur amateur.' },
  { id: 10, name: 'Cousine Akua', role: 'Cousine', emoji: '👧🏽', gen: 2, parentIds: [5, 6], location: 'Dakar', online: true, bio: 'Créatrice de contenu.' },
]

const GEN_COLORS = ['#f59e0b', '#B8860B', '#92400e']

const POSITIONS = {
  1: { x: 170, y: 60 }, 2: { x: 330, y: 60 },
  3: { x: 90, y: 190 }, 4: { x: 190, y: 190 },
  5: { x: 310, y: 190 }, 6: { x: 410, y: 190 },
  7: { x: 60, y: 320 }, 8: { x: 160, y: 320 },
  9: { x: 280, y: 320 }, 10: { x: 390, y: 320 },
}

const EDGES = [
  [1, 2, 'couple'], [3, 4, 'couple'], [5, 6, 'couple'],
  [1, 3], [2, 3], [1, 5], [2, 5],
  [3, 7], [4, 7], [3, 8], [4, 8],
  [5, 9], [6, 9], [5, 10], [6, 10],
]

export default function FamilyTree({ c, user }) {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const selMember = selected ? MEMBERS.find(m => m.id === selected) : null

  const filtered = filter === 'all' ? MEMBERS : MEMBERS.filter(m => m.gen === parseInt(filter))

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['all', 'Tous'], ['0', '👴 Génération 1'], ['1', '👨 Génération 2'], ['2', '🧑 Génération 3']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            background: filter === val ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.surface,
            border: `1px solid ${filter === val ? 'transparent' : c.border + '33'}`,
            borderRadius: 20, padding: '6px 14px', fontSize: 12,
            color: filter === val ? '#fff' : c.textMuted, cursor: 'pointer',
            fontFamily: c.font,
          }}>{label}</button>
        ))}
        <button style={{
          marginLeft: 'auto', background: c.surface, border: `1px solid ${c.border}33`,
          borderRadius: 20, padding: '6px 14px', fontSize: 12, color: c.color1, cursor: 'pointer',
        }}>+ Ajouter un membre</button>
      </div>

      {/* SVG Tree */}
      <Card c={c} style={{ marginBottom: 16, padding: '10px 4px 4px' }}>
        <div style={{ fontSize: 12, color: c.color1, fontFamily: 'monospace', padding: '0 10px 8px' }}>
          🌳 ARBRE GÉNÉALOGIQUE — {MEMBERS.length} MEMBRES
        </div>
        <div style={{ overflowX: 'auto' }}>
          <svg width="500" viewBox="0 0 500 390" style={{ display: 'block', minWidth: 400 }}>
            <defs>
              <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={c.color1} stopOpacity="0.3" />
                <stop offset="100%" stopColor={c.color1} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Edges */}
            {EDGES.map(([a, b, type], i) => {
              const pa = POSITIONS[a]; const pb = POSITIONS[b]
              if (!pa || !pb) return null
              if (type === 'couple') {
                return <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                  stroke={c.color1 + '55'} strokeWidth={2} strokeDasharray="6,4" />
              }
              const mx = (pa.x + pb.x) / 2
              const my = pa.y + (pb.y - pa.y) * 0.4
              return <path key={i} d={`M${pa.x},${pa.y} C${mx},${my} ${mx},${my} ${pb.x},${pb.y}`}
                fill="none" stroke={c.color1 + '33'} strokeWidth={1.5} />
            })}

            {/* Nodes */}
            {MEMBERS.map(m => {
              const pos = POSITIONS[m.id]
              if (!pos) return null
              const isSel = selected === m.id
              const col = GEN_COLORS[m.gen] || c.color1
              const isFiltered = filter !== 'all' && m.gen !== parseInt(filter)
              return (
                <g key={m.id} transform={`translate(${pos.x},${pos.y})`}
                  onClick={() => setSelected(isSel ? null : m.id)}
                  style={{ cursor: 'pointer', opacity: isFiltered ? 0.25 : 1, transition: 'opacity 0.3s' }}>
                  {isSel && <circle r={34} fill="url(#glow)" />}
                  <circle r={26} fill={isSel ? col : c.surface} stroke={col} strokeWidth={isSel ? 3 : 1.5} />
                  <text textAnchor="middle" dominantBaseline="central" fontSize={18}>{m.emoji}</text>
                  <text textAnchor="middle" y={40} fill={c.text} fontSize={9} fontFamily="'Crimson Text',serif">
                    {m.name.split(' ')[0]}
                  </text>
                  <text textAnchor="middle" y={52} fill={col} fontSize={8} fontFamily="monospace">
                    {m.role}
                  </text>
                  {m.online && <circle cx={18} cy={-18} r={5} fill="#22c55e" stroke={c.bg} strokeWidth={1.5} />}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 10, padding: '8px 12px', flexWrap: 'wrap' }}>
          {['Génération 1', 'Génération 2', 'Génération 3'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: c.textMuted }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: GEN_COLORS[i] }} />
              {label}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: c.textMuted }}>
            <div style={{ width: 16, height: 2, background: c.color1 + '66', borderRadius: 1 }} />
            Couple
          </div>
        </div>
      </Card>

      {/* Member detail */}
      {selMember && (
        <Card c={c} style={{ border: `1px solid ${c.color1}55`, animation: 'popIn 0.3s ease both' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: `linear-gradient(135deg, ${c.color1}33, ${c.color2}55)`,
              border: `2px solid ${c.color1}`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 32, flexShrink: 0,
            }}>{selMember.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 2 }}>{selMember.name}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <Badge label={selMember.role} color1={c.color1} small />
                <Badge label={`Gén. ${selMember.gen + 1}`} color1={c.color2} small />
                <Badge label={selMember.online ? '● En ligne' : '○ Hors ligne'} color1={selMember.online ? '#22c55e' : '#555'} small />
              </div>
              <div style={{ fontSize: 12, color: c.textMuted }}>📍 {selMember.location}</div>
            </div>
          </div>

          <div style={{
            background: c.bg, borderRadius: 10, padding: '10px 12px', marginBottom: 14,
            fontSize: 13, color: c.textMuted, border: `1px solid ${c.border}18`,
          }}>
            {selMember.bio}
          </div>

          {selMember.parentIds.length > 0 && (
            <div style={{ fontSize: 12, color: c.textMuted, marginBottom: 14 }}>
              👨‍👩‍👧 Parents :{' '}
              {selMember.parentIds.map(pid => {
                const p = MEMBERS.find(m => m.id === pid)
                return p ? <span key={pid} style={{ color: c.color1 }}>{p.name.split(' ')[0]} </span> : null
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Button c={c} small full>💬 Envoyer un message</Button>
            <Button c={c} small variant="ghost" style={{ flexShrink: 0 }}>👤 Profil</Button>
          </div>
        </Card>
      )}

      {/* Members list */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, color: c.color1, fontFamily: 'monospace', marginBottom: 10 }}>MEMBRES ({filtered.length})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(m => (
            <Card key={m.id} c={c} onClick={() => setSelected(selected === m.id ? null : m.id)}
              style={{ border: selected === m.id ? `1px solid ${c.color1}66` : undefined }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar name={m.name} emoji={m.emoji} size={44} color1={c.color1} color2={c.color2} online={m.online} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: c.color1 }}>{m.role} · {m.location}</div>
                </div>
                <div style={{ fontSize: 12, color: c.textSubtle }}>Gén. {m.gen + 1}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
