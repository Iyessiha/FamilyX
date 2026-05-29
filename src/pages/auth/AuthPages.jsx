import { useState } from 'react'
import { authLogin, authRegister, authResetPasswordRequest, authResetPasswordConfirm } from '../../utils/authStore'
import { CIRCLES } from '../../data/themes'

// ── Reusable ──────────────────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder, c, error }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 6, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: c.bg, borderRadius: 12, padding: '12px 16px',
          color: c.text, fontSize: 14, fontFamily: c.font, outline: 'none',
          border: `1px solid ${error ? '#ef4444' : focused ? c.color1 : c.border + '33'}`,
          transition: 'border-color 0.2s', boxSizing: 'border-box',
        }}
      />
      {error && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

function Btn({ children, onClick, c, loading, variant = 'primary', full }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      width: full ? '100%' : 'auto',
      background: variant === 'primary' ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.surface,
      border: variant === 'primary' ? 'none' : `1px solid ${c.border}33`,
      borderRadius: 14, padding: '13px 20px',
      color: variant === 'primary' ? '#fff' : c.text,
      fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
      fontFamily: c.font, opacity: loading ? 0.7 : 1,
      boxShadow: variant === 'primary' ? `0 6px 24px ${c.color1}44` : 'none',
      transition: 'all 0.2s',
    }}>
      {loading ? '⏳ Chargement…' : children}
    </button>
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
    <div style={{
      minHeight: '100vh', background: c.bg, fontFamily: c.font,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* bg blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', top: '-10%', left: '-5%', background: `radial-gradient(circle, ${c.color1}12, transparent)`, filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', bottom: '10%', right: '-5%', background: `radial-gradient(circle, ${c.color2}10, transparent)`, filter: 'blur(30px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, padding: '20px 24px 40px', maxWidth: 440, margin: '0 auto' }}>
        {/* Header */}
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
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = () => {
    setErr('')
    if (!email || !pass) { setErr('Veuillez remplir tous les champs.'); return }
    setLoading(true)
    setTimeout(() => {
      const res = authLogin({ email, password: pass })
      setLoading(false)
      if (res.error) { setErr(res.error); return }
      if (res.user.circleId !== c.id) {
        setErr(`Ce compte appartient au cercle "${CIRCLES[res.user.circleId]?.name}". Choisissez le bon cercle.`)
        return
      }
      onSuccess(res.user)
    }, 600)
  }

  return (
    <Shell c={c} title="Bon retour 👋" subtitle={`Connectez-vous à ${c.tag}`} onBack={onBack}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Alert msg={err} />
        <Field label="Adresse email" type="email" value={email} onChange={setEmail} placeholder="votre@email.com" c={c} />
        <div>
          <Field label="Mot de passe" type="password" value={pass} onChange={setPass} placeholder="••••••••" c={c} />
          <div style={{ textAlign: 'right', marginTop: 6 }}>
            <button onClick={onForgot} style={{ background: 'none', border: 'none', color: c.color1, fontSize: 12, cursor: 'pointer', fontFamily: c.font }}>
              Mot de passe oublié ?
            </button>
          </div>
        </div>
        <Btn c={c} onClick={submit} loading={loading} full>Se connecter →</Btn>

        <div style={{ display: 'flex', gap: 10 }}>
          {['🌐 Google', '📱 Téléphone'].map(l => (
            <button key={l} style={{ flex: 1, background: c.surface, border: `1px solid ${c.border}22`, borderRadius: 12, padding: 12, color: c.textMuted, fontSize: 12, cursor: 'pointer', fontFamily: c.font }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', fontSize: 13, color: c.textMuted }}>
          Pas encore de compte ?{' '}
          <button onClick={onRegister} style={{ background: 'none', border: 'none', color: c.color1, fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: c.font }}>
            Créer un compte
          </button>
        </div>

        {/* Demo hint */}
        <div style={{ background: c.surface, border: `1px dashed ${c.border}33`, borderRadius: 10, padding: '10px 14px', fontSize: 12, color: c.textMuted }}>
          <div style={{ color: c.color1, fontFamily: 'monospace', marginBottom: 4 }}>🔑 COMPTES DÉMO</div>
          <div>FamilyX → kofi@demo.com / ama@demo.com / yaw@demo.com</div>
          <div>FaithX → imam@demo.com | OrgX → sara@demo.com</div>
          <div>ClubX → marc@demo.com | Mot de passe : <strong style={{ color: c.color1 }}>demo1234</strong></div>
        </div>
      </div>
    </Shell>
  )
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
export function RegisterPage({ c, onSuccess, onLogin, onBack }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: null, password: '', confirm: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const up = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const next = () => {
    setErr('')
    if (step === 1) {
      if (!form.name.trim()) { setErr('Entrez votre nom.'); return }
      if (!form.email.includes('@')) { setErr('Email invalide.'); return }
      setStep(2)
    } else {
      if (!form.role) { setErr('Choisissez votre rôle.'); return }
      if (form.password.length < 6) { setErr('Mot de passe trop court (min 6 caractères).'); return }
      if (form.password !== form.confirm) { setErr('Les mots de passe ne correspondent pas.'); return }
      setLoading(true)
      setTimeout(() => {
        const res = authRegister({
          name: form.name, email: form.email, password: form.password,
          circleId: c.id, roleId: form.role.id, roleLabel: form.role.label, roleEmoji: form.role.emoji,
        })
        setLoading(false)
        if (res.error) { setErr(res.error); return }
        onSuccess(res.user)
      }, 700)
    }
  }

  return (
    <Shell c={c} title={step === 1 ? 'Créer un compte' : 'Votre rôle'} subtitle={`Rejoignez ${c.tag} — ${c.name}`} onBack={step === 2 ? () => setStep(1) : onBack}>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {[1, 2].map(s => (
          <div key={s} style={{ height: 4, flex: 1, borderRadius: 2, background: s <= step ? `linear-gradient(90deg, ${c.color1}, ${c.color2})` : `${c.color1}22`, transition: 'background 0.3s' }} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Alert msg={err} />

        {step === 1 && (<>
          <Field label="Nom complet" value={form.name} onChange={v => up('name', v)} placeholder="Votre prénom et nom" c={c} />
          <Field label="Email" type="email" value={form.email} onChange={v => up('email', v)} placeholder="votre@email.com" c={c} />
          <Field label="Téléphone (optionnel)" type="tel" value={form.phone} onChange={v => up('phone', v)} placeholder="+225 00 00 00 00" c={c} />
          <Btn c={c} onClick={next} full>Continuer →</Btn>
        </>)}

        {step === 2 && (<>
          <div>
            <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 10, fontFamily: 'monospace', textTransform: 'uppercase' }}>
              Mon rôle dans {c.name}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {c.roles.map(r => (
                <div key={r.id} onClick={() => up('role', r)} style={{
                  background: form.role?.id === r.id ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.surface,
                  border: `1px solid ${form.role?.id === r.id ? 'transparent' : c.border + '33'}`,
                  borderRadius: 20, padding: '8px 14px', fontSize: 13,
                  color: form.role?.id === r.id ? '#fff' : c.text,
                  cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {r.emoji} {r.label}
                </div>
              ))}
            </div>
          </div>
          <Field label="Mot de passe" type="password" value={form.password} onChange={v => up('password', v)} placeholder="Min. 6 caractères" c={c} />
          <Field label="Confirmer le mot de passe" type="password" value={form.confirm} onChange={v => up('confirm', v)} placeholder="Répétez votre mot de passe" c={c} />
          <Btn c={c} onClick={next} loading={loading} full>Créer mon compte ✓</Btn>
        </>)}

        <div style={{ textAlign: 'center', fontSize: 13, color: c.textMuted }}>
          Déjà un compte ?{' '}
          <button onClick={onLogin} style={{ background: 'none', border: 'none', color: c.color1, fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: c.font }}>
            Se connecter
          </button>
        </div>
        <div style={{ fontSize: 11, color: c.textSubtle, textAlign: 'center', fontFamily: "'Crimson Text', serif", lineHeight: 1.5 }}>
          En créant un compte, vous acceptez nos{' '}
          <span style={{ color: c.color1, cursor: 'pointer' }}>Conditions d'utilisation</span>{' '}
          et notre <span style={{ color: c.color1, cursor: 'pointer' }}>Politique de confidentialité</span>.
        </div>
      </div>
    </Shell>
  )
}

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
export function ForgotPasswordPage({ c, onBack }) {
  const [step, setStep] = useState(1) // 1=email, 2=code+newpass, 3=done
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [demoCode, setDemoCode] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const requestReset = () => {
    setErr('')
    if (!email.includes('@')) { setErr('Email invalide.'); return }
    setLoading(true)
    setTimeout(() => {
      const res = authResetPasswordRequest(email)
      setLoading(false)
      if (res.error) { setErr(res.error); return }
      setDemoCode(res.code) // Demo only
      setStep(2)
    }, 600)
  }

  const confirmReset = () => {
    setErr('')
    if (!code.trim()) { setErr('Entrez le code reçu.'); return }
    if (newPass.length < 6) { setErr('Mot de passe trop court.'); return }
    if (newPass !== confirm) { setErr('Les mots de passe ne correspondent pas.'); return }
    setLoading(true)
    setTimeout(() => {
      const res = authResetPasswordConfirm(email, code, newPass)
      setLoading(false)
      if (res.error) { setErr(res.error); return }
      setStep(3)
    }, 600)
  }

  return (
    <Shell c={c} title="Mot de passe oublié" subtitle="Réinitialisez votre mot de passe" onBack={onBack}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Alert msg={err} />

        {step === 1 && (<>
          <div style={{ fontSize: 14, color: c.textMuted, lineHeight: 1.6, fontFamily: "'Crimson Text', serif" }}>
            Entrez votre email. Vous recevrez un code de vérification pour réinitialiser votre mot de passe.
          </div>
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="votre@email.com" c={c} />
          <Btn c={c} onClick={requestReset} loading={loading} full>Envoyer le code →</Btn>
        </>)}

        {step === 2 && (<>
          <div style={{ background: c.surface, border: `1px solid ${c.border}33`, borderRadius: 10, padding: '12px 14px', fontSize: 13, color: c.textMuted }}>
            Un code a été envoyé à <strong style={{ color: c.text }}>{email}</strong>.
            {demoCode && <div style={{ marginTop: 6, color: c.color1, fontFamily: 'monospace' }}>🔑 Code démo : <strong>{demoCode}</strong></div>}
          </div>
          <Field label="Code de vérification" value={code} onChange={setCode} placeholder="000000" c={c} />
          <Field label="Nouveau mot de passe" type="password" value={newPass} onChange={setNewPass} placeholder="Min. 6 caractères" c={c} />
          <Field label="Confirmer" type="password" value={confirm} onChange={setConfirm} placeholder="Répétez le mot de passe" c={c} />
          <Btn c={c} onClick={confirmReset} loading={loading} full>Réinitialiser ✓</Btn>
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: 13, cursor: 'pointer', fontFamily: c.font }}>← Renvoyer le code</button>
        </>)}

        {step === 3 && (<>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.text, marginBottom: 8 }}>Mot de passe réinitialisé !</div>
            <div style={{ fontSize: 14, color: c.textMuted, fontFamily: "'Crimson Text', serif" }}>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</div>
          </div>
          <Btn c={c} onClick={onBack} full>← Retour à la connexion</Btn>
        </>)}
      </div>
    </Shell>
  )
}
