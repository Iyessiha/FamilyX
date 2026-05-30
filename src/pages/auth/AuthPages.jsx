import { useState } from 'react'
import { register, login, resetPasswordRequest, resetPasswordConfirm } from '../../utils/authService'
import { CIRCLES } from '../../data/themes'

function Field({ label, type = 'text', value, onChange, placeholder, c, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 6, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: c.bg, borderRadius: 12, padding: '12px 16px',
          color: c.text, fontSize: 14, fontFamily: c.font, outline: 'none', boxSizing: 'border-box',
          border: `1px solid ${error ? '#ef4444' : focused ? c.color1 : c.border + '33'}`,
          transition: 'border-color 0.2s',
        }}
      />
      {error && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

function Alert({ msg, type = 'error' }) {
  if (!msg) return null
  const isErr = type === 'error'
  return (
    <div style={{
      background: isErr ? '#1a0505' : '#051a0a',
      border: `1px solid ${isErr ? '#ef444444' : '#22c55e44'}`,
      borderRadius: 10, padding: '10px 14px',
      fontSize: 13, color: isErr ? '#fca5a5' : '#86efac',
      display: 'flex', gap: 8, alignItems: 'flex-start',
    }}>
      {isErr ? '⚠️' : '✅'} {msg}
    </div>
  )
}

function Shell({ c, children, title, subtitle, onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: c.bg, fontFamily: c.font, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', top: '-10%', left: '-5%', background: `radial-gradient(circle, ${c.color1}12, transparent)`, filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', bottom: '10%', right: '-5%', background: `radial-gradient(circle, ${c.color2}10, transparent)`, filter: 'blur(30px)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 10, padding: '20px 24px 40px', maxWidth: 440, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingTop: 8 }}>
          {onBack && (
            <button onClick={onBack} style={{ background: c.surface, border: `1px solid ${c.border}22`, borderRadius: 10, width: 36, height: 36, color: c.text, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>←</button>
          )}
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: c.text, lineHeight: 1 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 13, color: c.textMuted, marginTop: 3, fontFamily: "'Crimson Text', serif" }}>{subtitle}</div>}
          </div>
          <div style={{ marginLeft: 'auto', background: `${c.color1}18`, border: `1px solid ${c.color1}33`, borderRadius: 20, padding: '4px 12px', fontSize: 11, color: c.color1, fontFamily: 'monospace' }}>{c.emoji} {c.tag}</div>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export function LoginPage({ c, onSuccess, onRegister, onForgot, onBack }) {
  const [email, setEmail] = useState('')
  const [pass, setPass]   = useState('')
  const [err, setErr]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setErr('')
    if (!email || !pass) { setErr('Veuillez remplir tous les champs.'); return }
    setLoading(true)
    const res = await login({ email, password: pass })
    setLoading(false)
    if (res.error) { setErr(res.error); return }
    if (res.user.circle_id !== c.id) {
      setErr(`Ce compte appartient au cercle "${CIRCLES[res.user.circle_id]?.name}". Choisissez le bon cercle.`)
      return
    }
    onSuccess(res.user)
  }

  return (
    <Shell c={c} title="Bon retour 👋" subtitle={`Connectez-vous à ${c.tag}`} onBack={onBack}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Alert msg={err} />
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="votre@email.com" c={c} />
        <div>
          <Field label="Mot de passe" type="password" value={pass} onChange={setPass} placeholder="••••••••" c={c} />
          <div style={{ textAlign: 'right', marginTop: 6 }}>
            <button onClick={onForgot} style={{ background: 'none', border: 'none', color: c.color1, fontSize: 12, cursor: 'pointer', fontFamily: c.font }}>Mot de passe oublié ?</button>
          </div>
        </div>

        <button onClick={submit} disabled={loading} style={{
          width: '100%', background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`,
          border: 'none', borderRadius: 14, padding: '14px', color: '#fff',
          fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: c.font, opacity: loading ? 0.7 : 1,
          boxShadow: `0 6px 24px ${c.color1}44`,
        }}>
          {loading ? '⏳ Connexion…' : 'Se connecter →'}
        </button>

        {/* Demo hint */}
        <div style={{ background: c.surface, border: `1px dashed ${c.border}33`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: c.textMuted }}>
          <div style={{ color: c.color1, fontFamily: 'monospace', marginBottom: 4 }}>🔑 COMPTES DÉMO</div>
          <div>kofi@demo.com · ama@demo.com · yaw@demo.com</div>
          <div>imam@demo.com · sara@demo.com · marc@demo.com</div>
          <div>Mot de passe : <strong style={{ color: c.color1 }}>demo1234</strong></div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 13, color: c.textMuted }}>
          Pas encore de compte ?{' '}
          <button onClick={onRegister} style={{ background: 'none', border: 'none', color: c.color1, fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: c.font }}>Créer un compte</button>
        </div>
      </div>
    </Shell>
  )
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
export function RegisterPage({ c, onSuccess, onLogin, onBack }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: null, password: '', confirm: '' })
  const [err, setErr]   = useState('')
  const [loading, setLoading] = useState(false)
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const next = async () => {
    setErr('')
    if (step === 1) {
      if (!form.name.trim())       { setErr('Entrez votre nom.'); return }
      if (!form.email.includes('@')){ setErr('Email invalide.'); return }
      setStep(2)
    } else {
      if (!form.role)              { setErr('Choisissez votre rôle.'); return }
      if (form.password.length < 6){ setErr('Mot de passe trop court (min 6 caractères).'); return }
      if (form.password !== form.confirm){ setErr('Les mots de passe ne correspondent pas.'); return }
      setLoading(true)
      const res = await register({
        name: form.name, email: form.email, password: form.password,
        circleId: c.id, roleId: form.role.id,
        roleLabel: form.role.label, roleEmoji: form.role.emoji,
      })
      setLoading(false)
      if (res.error) { setErr(res.error); return }
      onSuccess(res.user)
    }
  }

  return (
    <Shell c={c} title={step === 1 ? 'Créer un compte' : 'Votre rôle'} subtitle={`Rejoignez ${c.tag} — ${c.name}`} onBack={step === 2 ? () => setStep(1) : onBack}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {[1, 2].map(s => <div key={s} style={{ height: 4, flex: 1, borderRadius: 2, background: s <= step ? `linear-gradient(90deg, ${c.color1}, ${c.color2})` : `${c.color1}22`, transition: 'background 0.3s' }} />)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Alert msg={err} />
        {step === 1 && (<>
          <Field label="Nom complet" value={form.name} onChange={v => up('name', v)} placeholder="Votre prénom et nom" c={c} />
          <Field label="Email" type="email" value={form.email} onChange={v => up('email', v)} placeholder="votre@email.com" c={c} />
          <Field label="Téléphone (optionnel)" type="tel" value={form.phone} onChange={v => up('phone', v)} placeholder="+225 00 00 00 00" c={c} />
          <button onClick={next} style={{ width: '100%', background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`, border: 'none', borderRadius: 14, padding: '14px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: c.font }}>
            Continuer →
          </button>
        </>)}
        {step === 2 && (<>
          <div>
            <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 10, fontFamily: 'monospace', textTransform: 'uppercase' }}>Mon rôle dans {c.name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {c.roles.map(r => (
                <div key={r.id} onClick={() => up('role', r)} style={{
                  background: form.role?.id === r.id ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.surface,
                  border: `1px solid ${form.role?.id === r.id ? 'transparent' : c.border + '33'}`,
                  borderRadius: 20, padding: '8px 14px', fontSize: 13,
                  color: form.role?.id === r.id ? '#fff' : c.text,
                  cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5,
                }}>{r.emoji} {r.label}</div>
              ))}
            </div>
          </div>
          <Field label="Mot de passe" type="password" value={form.password} onChange={v => up('password', v)} placeholder="Min. 6 caractères" c={c} />
          <Field label="Confirmer" type="password" value={form.confirm} onChange={v => up('confirm', v)} placeholder="Répétez le mot de passe" c={c} />
          <button onClick={next} disabled={loading} style={{ width: '100%', background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`, border: 'none', borderRadius: 14, padding: '14px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: c.font, opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Création du compte…' : `Rejoindre ${c.tag} ✓`}
          </button>
        </>)}
        <div style={{ textAlign: 'center', fontSize: 13, color: c.textMuted }}>
          Déjà un compte ?{' '}
          <button onClick={onLogin} style={{ background: 'none', border: 'none', color: c.color1, fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: c.font }}>Se connecter</button>
        </div>
      </div>
    </Shell>
  )
}

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
export function ForgotPasswordPage({ c, onBack }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [err, setErr]    = useState('')
  const [msg, setMsg]    = useState('')
  const [loading, setLoading] = useState(false)

  const requestReset = async () => {
    setErr('')
    if (!email.includes('@')) { setErr('Email invalide.'); return }
    setLoading(true)
    const res = await resetPasswordRequest(email)
    setLoading(false)
    if (res.error) { setErr(res.error); return }
    setMsg(`Un lien de réinitialisation a été envoyé à ${email}. Vérifiez votre boîte mail.`)
    setStep(2)
  }

  return (
    <Shell c={c} title="Mot de passe oublié" subtitle="Réinitialisez via votre email" onBack={onBack}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Alert msg={err} type="error" />
        <Alert msg={msg} type="success" />
        {step === 1 && (<>
          <div style={{ fontSize: 14, color: c.textMuted, lineHeight: 1.6, fontFamily: "'Crimson Text', serif" }}>
            Entrez votre email. Vous recevrez un lien sécurisé pour réinitialiser votre mot de passe.
          </div>
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="votre@email.com" c={c} />
          <button onClick={requestReset} disabled={loading} style={{ width: '100%', background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`, border: 'none', borderRadius: 14, padding: '14px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: c.font, opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Envoi…' : 'Envoyer le lien →'}
          </button>
        </>)}
        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>📧</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 8 }}>Email envoyé !</div>
            <div style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.6, marginBottom: 20 }}>
              Cliquez sur le lien dans votre email pour réinitialiser votre mot de passe. Le lien expire dans 1 heure.
            </div>
            <button onClick={onBack} style={{ background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`, border: 'none', borderRadius: 14, padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: c.font }}>
              ← Retour à la connexion
            </button>
          </div>
        )}
      </div>
    </Shell>
  )
}
