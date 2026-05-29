import { useState, useRef } from 'react'
import { Card, Badge, Button, SectionTitle, StatBox } from '../../components/shared/UI'
import {
  authChangePassword, searchCircleMembers, sendLinkRequest,
  respondLinkRequest, getLinkedMembers, getPendingRequests
} from '../../utils/authStore'

// ── Avatar Upload ──────────────────────────────────────────────────────────────
function AvatarUpload({ user, c, onUpdate }) {
  const ref = useRef()
  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Image trop grande (max 2Mo)'); return }
    const reader = new FileReader()
    reader.onload = (ev) => onUpdate({ avatar: ev.target.result })
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }} onClick={() => ref.current.click()}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      <div style={{
        width: 88, height: 88, borderRadius: '50%',
        background: user.avatar ? 'transparent' : `linear-gradient(135deg, ${c.color1}44, ${c.color2}66)`,
        border: `3px solid ${c.color1}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', flexShrink: 0,
      }}>
        {user.avatar
          ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 44 }}>{user.roleEmoji}</span>
        }
      </div>
      <div style={{
        position: 'absolute', bottom: 2, right: 2,
        width: 26, height: 26, borderRadius: '50%',
        background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`,
        border: `2px solid ${c.bg}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13,
      }}>📷</div>
    </div>
  )
}

// ── Change Password ────────────────────────────────────────────────────────────
function ChangePasswordPanel({ user, c, onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const inp = {
    width: '100%', background: c.bg, border: `1px solid ${c.border}33`,
    borderRadius: 12, padding: '11px 14px', color: c.text, fontSize: 13,
    outline: 'none', fontFamily: c.font, boxSizing: 'border-box',
  }
  const submit = () => {
    setErr('')
    if (!form.current || !form.next || !form.confirm) { setErr('Tous les champs sont requis.'); return }
    if (form.next !== form.confirm) { setErr('Les mots de passe ne correspondent pas.'); return }
    const res = authChangePassword(user.id, { currentPassword: form.current, newPassword: form.next })
    if (res.error) { setErr(res.error); return }
    setOk(true)
    setTimeout(onClose, 1500)
  }

  return (
    <Card c={c} style={{ border: `1px solid ${c.color1}44`, animation: 'slideUp 0.3s ease' }}>
      <SectionTitle c={c}>🔒 Changer le mot de passe</SectionTitle>
      {ok
        ? <div style={{ color: '#86efac', fontSize: 14, padding: '8px 0' }}>✅ Mot de passe mis à jour !</div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {err && <div style={{ background: '#1a0505', border: '1px solid #ef444433', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#fca5a5' }}>⚠️ {err}</div>}
          {[['current', 'Mot de passe actuel', '••••••••'], ['next', 'Nouveau mot de passe', 'Min. 6 caractères'], ['confirm', 'Confirmer', 'Répétez le nouveau']].map(([k, label, ph]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 5, fontFamily: 'monospace', textTransform: 'uppercase' }}>{label}</div>
              <input type="password" value={form[k]} onChange={e => up(k, e.target.value)} placeholder={ph} style={inp}
                onFocus={e => e.target.style.borderColor = c.color1} onBlur={e => e.target.style.borderColor = `${c.border}33`} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Button c={c} small full onClick={submit}>Mettre à jour ✓</Button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: 13, cursor: 'pointer', padding: '0 8px', fontFamily: c.font }}>Annuler</button>
          </div>
        </div>
      }
    </Card>
  )
}

// ── Family Linking ─────────────────────────────────────────────────────────────
function LinkingPanel({ user, c, onRefresh }) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [relation, setRelation] = useState({})
  const [sent, setSent] = useState({})
  const [pending] = useState(() => getPendingRequests(user.id))
  const [linked] = useState(() => getLinkedMembers(user.id))

  const doSearch = (q) => {
    setSearch(q)
    if (!q.trim()) { setResults([]); return }
    setResults(searchCircleMembers(user.circleId, q, user.id))
  }

  const sendReq = (toId, toName) => {
    const rel = relation[toId] || 'membre de la famille'
    const res = sendLinkRequest(user.id, toId, rel)
    if (res.error) { alert(res.error); return }
    setSent(p => ({ ...p, [toId]: true }))
  }

  const respond = (reqId, accept) => {
    respondLinkRequest(user.id, reqId, accept)
    onRefresh()
  }

  return (
    <Card c={c} style={{ border: `1px solid ${c.color1}44` }}>
      <SectionTitle c={c}>🔗 Lier des membres</SectionTitle>

      {/* Pending requests */}
      {pending.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: c.color1, fontFamily: 'monospace', marginBottom: 8 }}>DEMANDES EN ATTENTE ({pending.length})</div>
          {pending.map(req => (
            <div key={req.id} style={{
              background: c.bg, border: `1px solid ${c.border}22`,
              borderRadius: 10, padding: '10px 12px', marginBottom: 8,
              display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <span style={{ fontSize: 24 }}>{req.fromEmoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{req.fromName}</div>
                <div style={{ fontSize: 11, color: c.textMuted }}>{req.fromRole} · veut vous lier comme <em>{req.relation}</em></div>
              </div>
              <button onClick={() => respond(req.id, true)} style={{ background: `${c.color1}22`, border: `1px solid ${c.color1}44`, borderRadius: 8, padding: '5px 10px', color: c.color1, fontSize: 12, cursor: 'pointer' }}>✓</button>
              <button onClick={() => respond(req.id, false)} style={{ background: '#1a0505', border: '1px solid #ef444433', borderRadius: 8, padding: '5px 10px', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Already linked */}
      {linked.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: c.color1, fontFamily: 'monospace', marginBottom: 8 }}>MEMBRES LIÉS ({linked.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {linked.map(m => (
              <div key={m.id} style={{
                background: c.surface, border: `1px solid ${c.color1}33`,
                borderRadius: 20, padding: '5px 12px', fontSize: 12, color: c.text,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>{m.roleEmoji}</span> {m.name}
                <Badge label={m.roleLabel} color1={c.color1} small />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 8, fontFamily: 'monospace', textTransform: 'uppercase' }}>Rechercher un membre à lier</div>
      <input value={search} onChange={e => doSearch(e.target.value)}
        placeholder="Nom ou email du membre…"
        style={{ width: '100%', background: c.bg, border: `1px solid ${c.border}33`, borderRadius: 12, padding: '10px 14px', color: c.text, fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
        onFocus={e => e.target.style.borderColor = c.color1}
        onBlur={e => e.target.style.borderColor = `${c.border}33`}
      />

      {results.map(m => (
        <div key={m.id} style={{
          background: c.bg, border: `1px solid ${c.border}22`,
          borderRadius: 10, padding: '10px 12px', marginBottom: 8,
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 26 }}>{m.roleEmoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{m.name}</div>
              <div style={{ fontSize: 11, color: c.textMuted }}>{m.roleLabel} {m.location ? `· ${m.location}` : ''}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={relation[m.id] || ''}
              onChange={e => setRelation(p => ({ ...p, [m.id]: e.target.value }))}
              placeholder={`Relation (ex: Mon père, Ma sœur…)`}
              style={{ flex: 1, background: c.surface, border: `1px solid ${c.border}22`, borderRadius: 8, padding: '7px 10px', color: c.text, fontSize: 12, outline: 'none' }}
            />
            <button
              onClick={() => sendReq(m.id, m.name)}
              disabled={sent[m.id]}
              style={{
                background: sent[m.id] ? '#0a1a0a' : `linear-gradient(135deg, ${c.color1}, ${c.color2})`,
                border: sent[m.id] ? '1px solid #22c55e44' : 'none',
                borderRadius: 8, padding: '7px 12px', fontSize: 12,
                color: sent[m.id] ? '#22c55e' : '#fff', cursor: sent[m.id] ? 'default' : 'pointer',
              }}>
              {sent[m.id] ? '✓ Envoyé' : 'Lier'}
            </button>
          </div>
        </div>
      ))}

      {search && results.length === 0 && (
        <div style={{ fontSize: 13, color: c.textMuted, textAlign: 'center', padding: '10px 0' }}>
          Aucun membre trouvé dans ce cercle.
        </div>
      )}
    </Card>
  )
}

// ── Main Profile Page ─────────────────────────────────────────────────────────
export default function ProfilePage({ c, user, onLogout, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [form, setForm] = useState({ name: user.name, bio: user.bio || '', location: user.location || '', phone: user.phone || '' })
  const [saveOk, setSaveOk] = useState(false)
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const inp = {
    width: '100%', background: c.bg, border: `1px solid ${c.border}33`,
    borderRadius: 12, padding: '11px 14px', color: c.text, fontSize: 13,
    outline: 'none', fontFamily: c.font, boxSizing: 'border-box',
  }

  const save = () => {
    if (!form.name.trim()) return
    onUpdate(form)
    setEditing(false)
    setSaveOk(true)
    setTimeout(() => setSaveOk(false), 2000)
  }

  const handleAvatarUpdate = (update) => onUpdate(update)

  const SETTINGS = [
    { icon: '🔒', label: 'Changer le mot de passe', action: () => { setShowPass(!showPass); setShowLink(false) } },
    { icon: '🔗', label: 'Lier des membres', action: () => { setShowLink(!showLink); setShowPass(false) } },
    { icon: '🔔', label: 'Notifications', action: () => {} },
    { icon: '🌐', label: 'Langue', action: () => {} },
    { icon: '🔏', label: 'Confidentialité', action: () => {} },
    { icon: '❓', label: 'Aide & Support', action: () => {} },
  ]

  const memberSince = new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const linkedCount = (user.linkedMemberIds || []).length
  const pendingCount = getPendingRequests(user.id).length

  return (
    <div className="fade-in">
      {/* Header card */}
      <Card c={c} style={{ marginBottom: 14, background: `linear-gradient(180deg, ${c.color1}10, ${c.surface})`, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <AvatarUpload user={user} c={c} onUpdate={handleAvatarUpdate} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: c.text, marginBottom: 4 }}>{user.name}</div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          <Badge label={`${user.roleEmoji} ${user.roleLabel}`} color1={c.color1} />
          <Badge label={c.tag} color1={c.color2} />
        </div>
        {user.bio && <div style={{ fontSize: 13, color: c.textMuted, marginBottom: 6, maxWidth: 280, margin: '0 auto 10px', lineHeight: 1.5, fontFamily: "'Crimson Text', serif" }}>{user.bio}</div>}
        <div style={{ fontSize: 11, color: c.textSubtle }}>📅 Membre depuis {memberSince}</div>

        <div style={{ display: 'flex', gap: 10, marginTop: 14, marginBottom: 14 }}>
          <StatBox label="Liés" value={linkedCount} icon="🔗" c={c} />
          <StatBox label="Groupes" value="4" icon="👥" c={c} />
          {pendingCount > 0 && <StatBox label="Demandes" value={pendingCount} icon="📨" c={c} />}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button c={c} small full onClick={() => setEditing(!editing)}>
            {editing ? 'Annuler' : '✏️ Modifier le profil'}
          </Button>
        </div>
        {saveOk && <div style={{ color: '#86efac', fontSize: 13, marginTop: 8 }}>✅ Profil mis à jour !</div>}
      </Card>

      {/* Edit form */}
      {editing && (
        <Card c={c} style={{ marginBottom: 14, border: `1px solid ${c.color1}44`, animation: 'slideUp 0.3s ease' }}>
          <SectionTitle c={c}>Modifier mes informations</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['name', 'Nom complet', 'Votre nom'], ['location', 'Localisation', 'Ville, Pays'], ['phone', 'Téléphone', '+225 00 00 00 00']].map(([k, label, ph]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 5, fontFamily: 'monospace', textTransform: 'uppercase' }}>{label}</div>
                <input value={form[k]} onChange={e => up(k, e.target.value)} placeholder={ph} style={inp}
                  onFocus={e => e.target.style.borderColor = c.color1}
                  onBlur={e => e.target.style.borderColor = `${c.border}33`} />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 5, fontFamily: 'monospace', textTransform: 'uppercase' }}>Bio</div>
              <textarea value={form.bio} onChange={e => up('bio', e.target.value)} rows={3} placeholder="Décrivez-vous en quelques mots…"
                style={{ ...inp, resize: 'none' }}
                onFocus={e => e.target.style.borderColor = c.color1}
                onBlur={e => e.target.style.borderColor = `${c.border}33`} />
            </div>
            <Button c={c} small full onClick={save}>Sauvegarder ✓</Button>
          </div>
        </Card>
      )}

      {/* Role selector */}
      <Card c={c} style={{ marginBottom: 14 }}>
        <SectionTitle c={c}>Mon rôle dans {c.name}</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {c.roles.map(r => (
            <div key={r.id} onClick={() => onUpdate({ roleId: r.id, roleLabel: r.label, roleEmoji: r.emoji })}
              style={{
                background: r.id === user.roleId ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.bg,
                border: `1px solid ${r.id === user.roleId ? 'transparent' : c.border + '22'}`,
                borderRadius: 20, padding: '7px 14px', fontSize: 13,
                color: r.id === user.roleId ? '#fff' : c.text,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
              {r.emoji} {r.label}
            </div>
          ))}
        </div>
      </Card>

      {/* Settings */}
      <Card c={c} style={{ marginBottom: 14 }}>
        <SectionTitle c={c}>Paramètres</SectionTitle>
        {SETTINGS.map((s, i) => (
          <div key={s.label}>
            <div onClick={s.action} style={{
              display: 'flex', gap: 12, alignItems: 'center',
              padding: '12px 0', cursor: 'pointer',
            }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ flex: 1, fontSize: 14, color: c.text }}>{s.label}</span>
              {(s.label === 'Lier des membres' && pendingCount > 0) && (
                <Badge label={`${pendingCount} en attente`} color1={c.color1} small />
              )}
              <span style={{ color: c.textSubtle }}>{(s.label === 'Changer le mot de passe' && showPass) || (s.label === 'Lier des membres' && showLink) ? '∨' : '›'}</span>
            </div>
            {s.label === 'Changer le mot de passe' && showPass && <ChangePasswordPanel user={user} c={c} onClose={() => setShowPass(false)} />}
            {s.label === 'Lier des membres' && showLink && <LinkingPanel user={user} c={c} onRefresh={() => {}} />}
            {i < SETTINGS.length - 1 && <div style={{ height: 1, background: `${c.border}12` }} />}
          </div>
        ))}
      </Card>

      {/* Account info */}
      <Card c={c} style={{ marginBottom: 14 }}>
        <SectionTitle c={c}>Compte</SectionTitle>
        {[['📧', 'Email', user.email], ['🆔', 'ID Membre', user.id]].map(([icon, label, value]) => (
          <div key={label} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: `1px solid ${c.border}10` }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 11, color: c.textMuted, fontFamily: 'monospace' }}>{label}</div>
              <div style={{ fontSize: 13, color: c.text }}>{value}</div>
            </div>
          </div>
        ))}
      </Card>

      <button onClick={onLogout} style={{
        width: '100%', background: '#1a0505', border: '1px solid #ef444433',
        borderRadius: 14, padding: '14px', color: '#ef4444', fontSize: 14,
        cursor: 'pointer', fontFamily: c.font, marginBottom: 20,
      }}>
        ⎋ Se déconnecter
      </button>
    </div>
  )
}
