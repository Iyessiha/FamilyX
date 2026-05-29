import { useState, useEffect } from 'react'
import { CIRCLES } from '../data/themes'
import { LoginPage, RegisterPage, ForgotPasswordPage } from './auth/AuthPages'

const SLIDES = [
  { icon: '🌐', title: 'Un réseau fait pour vous', body: 'FamilyX regroupe familles, communautés, entreprises et associations dans une seule plateforme.' },
  { icon: '🌳', title: 'Arbre auto-généré', body: 'Chaque membre précise son rôle. L\'application construit votre arbre ou organigramme automatiquement.' },
  { icon: '💬', title: 'Messagerie & Groupes', body: 'Échangez en privé ou en groupe. Restez connectés peu importe la distance.' },
  { icon: '🎨', title: 'Interface sur mesure', body: 'Famille, religion, entreprise ou association — chaque cercle a son identité visuelle dédiée.' },
]

function Landing({ onNext, onLogin }) {
  const [v, setV] = useState(false)
  useEffect(() => { setTimeout(() => setV(true), 80) }, [])
  return (
    <div style={{ minHeight: '100vh', background: '#060308', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden', fontFamily: "'Playfair Display', serif" }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', top: '-20%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, #B8860B18, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', bottom: '5%', right: '-10%', background: 'radial-gradient(circle, #7c3aed12, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff05 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>
      <div style={{ opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)', textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 90, height: 90, borderRadius: 28, background: 'linear-gradient(135deg, #B8860B, #8B4513, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, margin: '0 auto 18px', boxShadow: '0 20px 60px #B8860B44' }}>🌍</div>
        <div style={{ fontSize: 54, fontWeight: 900, letterSpacing: -1, background: 'linear-gradient(135deg, #e8d5b0, #B8860B, #e8d5b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>FamilyX</div>
        <div style={{ fontSize: 12, color: '#7a6a50', letterSpacing: 4, textTransform: 'uppercase', marginTop: 6, fontFamily: 'monospace' }}>Votre cercle. Votre réseau.</div>
      </div>
      <div style={{ opacity: v ? 1 : 0, transition: 'all 0.7s 0.15s', display: 'flex', gap: 10, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
        {Object.values(CIRCLES).map((c) => (
          <div key={c.id} style={{ background: c.surface, border: `1px solid ${c.color1}44`, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>{c.emoji}</span>
            <div><div style={{ fontSize: 12, fontWeight: 700, color: c.text, fontFamily: 'monospace' }}>{c.tag}</div><div style={{ fontSize: 10, color: c.textMuted }}>{c.name}</div></div>
          </div>
        ))}
      </div>
      <div style={{ opacity: v ? 1 : 0, transition: 'all 0.7s 0.3s', textAlign: 'center', maxWidth: 340, marginBottom: 40 }}>
        <p style={{ fontSize: 16, color: '#c8b890', lineHeight: 1.7, fontFamily: "'Crimson Text', serif" }}>
          Une plateforme unique pour connecter <strong style={{ color: '#e8d5b0' }}>familles</strong>, <strong style={{ color: '#e8d5b0' }}>communautés</strong>, <strong style={{ color: '#e8d5b0' }}>entreprises</strong> et <strong style={{ color: '#e8d5b0' }}>associations</strong>.
        </p>
      </div>
      <div style={{ opacity: v ? 1 : 0, transition: 'all 0.7s 0.4s', display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        <button onClick={onNext} style={{ background: 'linear-gradient(135deg, #B8860B, #8B4513)', border: 'none', borderRadius: 16, padding: 16, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 30px #B8860B55' }}>Découvrir FamilyX →</button>
        <button onClick={onLogin} style={{ background: 'transparent', border: '1px solid #B8860B33', borderRadius: 16, padding: 14, color: '#c8b890', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Se connecter</button>
      </div>
    </div>
  )
}

function Slides({ onNext }) {
  const [slide, setSlide] = useState(0)
  const [anim, setAnim] = useState(true)
  const s = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1
  const go = (dir) => { setAnim(false); setTimeout(() => { setSlide(p => Math.max(0, Math.min(SLIDES.length - 1, p + dir))); setAnim(true) }, 150) }
  return (
    <div style={{ minHeight: '100vh', background: '#08050f', display: 'flex', flexDirection: 'column', fontFamily: "'Playfair Display', serif" }}>
      <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onNext} style={{ background: 'none', border: 'none', color: '#5a4070', fontSize: 13, cursor: 'pointer', fontFamily: 'monospace' }}>Passer →</button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', opacity: anim ? 1 : 0, transform: anim ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.3s ease' }}>
        <div style={{ width: 110, height: 110, borderRadius: 32, background: 'linear-gradient(135deg, #1a0f2e, #2d1050)', border: '1px solid #7c3aed44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, marginBottom: 36, boxShadow: '0 20px 60px #7c3aed33' }}>{s.icon}</div>
        <div style={{ fontSize: 28, fontWeight: 900, textAlign: 'center', color: '#e8d4f5', marginBottom: 20, lineHeight: 1.2 }}>{s.title}</div>
        <div style={{ fontSize: 15, color: '#9a80b8', textAlign: 'center', lineHeight: 1.8, maxWidth: 300, fontFamily: "'Crimson Text', serif" }}>{s.body}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
        {SLIDES.map((_, i) => <div key={i} style={{ width: i === slide ? 20 : 6, height: 6, borderRadius: 3, background: i === slide ? '#7c3aed' : '#7c3aed44', transition: 'all 0.3s' }} />)}
      </div>
      <div style={{ padding: '0 24px 48px', display: 'flex', gap: 12 }}>
        {slide > 0 && <button onClick={() => go(-1)} style={{ flex: 1, background: '#1a0f2e', border: '1px solid #7c3aed44', borderRadius: 16, padding: 14, color: '#c8b0e8', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Précédent</button>}
        <button onClick={isLast ? onNext : () => go(1)} style={{ flex: 2, background: isLast ? 'linear-gradient(135deg, #7c3aed, #4c1d95)' : 'linear-gradient(135deg, #B8860B, #8B4513)', border: 'none', borderRadius: 16, padding: 16, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          {isLast ? 'Choisir mon cercle 🎯' : 'Suivant →'}
        </button>
      </div>
    </div>
  )
}

function CircleChoice({ onSelect }) {
  const [hovered, setHovered] = useState(null)
  return (
    <div style={{ minHeight: '100vh', background: '#050505', fontFamily: "'Playfair Display', serif", padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: '#5a5a5a', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 10 }}>Étape 1 sur 2</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: '#f0f0f0', lineHeight: 1.1, marginBottom: 10 }}>Quel est votre cercle ?</div>
        <div style={{ fontSize: 14, color: '#7a7a7a', maxWidth: 280, margin: '0 auto', fontFamily: "'Crimson Text', serif", lineHeight: 1.6 }}>Choisissez le type de communauté à créer ou rejoindre.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420, margin: '0 auto' }}>
        {Object.values(CIRCLES).map(c => (
          <div key={c.id} onClick={() => onSelect(c)} onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}
            style={{ background: hovered === c.id ? c.surface : '#0f0f0f', border: `1px solid ${hovered === c.id ? c.color1 : '#2a2a2a'}`, borderRadius: 20, padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.25s ease', transform: hovered === c.id ? 'translateX(6px)' : 'translateX(0)' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${c.color1}22, ${c.color2}44)`, border: `1px solid ${c.color1}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{c.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: c.text }}>{c.name}</span>
                <span style={{ fontSize: 10, fontFamily: 'monospace', background: `${c.color1}22`, color: c.color1, border: `1px solid ${c.color1}44`, borderRadius: 6, padding: '1px 6px' }}>{c.tag}</span>
              </div>
              <div style={{ fontSize: 12, color: '#6a6a6a', lineHeight: 1.5, fontFamily: "'Crimson Text', serif" }}>{c.desc}</div>
            </div>
            <div style={{ color: hovered === c.id ? c.color1 : '#3a3a3a', fontSize: 20, transition: 'color 0.2s' }}>›</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Onboarding({ onLogin }) {
  const [screen, setScreen] = useState('landing')
  const [circle, setCircle] = useState(null)
  const [authMode, setAuthMode] = useState('login') // login | register | forgot

  const handleCircleSelect = (c) => { setCircle(c); setScreen('auth'); setAuthMode('register') }
  const goLogin = () => { setScreen('auth'); setAuthMode('login') }

  return (
    <>
      {screen === 'landing' && <Landing onNext={() => setScreen('slides')} onLogin={goLogin} />}
      {screen === 'slides' && <Slides onNext={() => setScreen('circle')} />}
      {screen === 'circle' && <CircleChoice onSelect={handleCircleSelect} />}
      {screen === 'auth' && circle && authMode === 'login' && (
        <LoginPage c={circle} onSuccess={onLogin} onRegister={() => setAuthMode('register')} onForgot={() => setAuthMode('forgot')} onBack={() => setScreen('circle')} />
      )}
      {screen === 'auth' && circle && authMode === 'register' && (
        <RegisterPage c={circle} onSuccess={onLogin} onLogin={() => setAuthMode('login')} onBack={() => setScreen('circle')} />
      )}
      {screen === 'auth' && circle && authMode === 'forgot' && (
        <ForgotPasswordPage c={circle} onBack={() => setAuthMode('login')} />
      )}
      {screen === 'auth' && !circle && (
        <CircleChoice onSelect={c => { setCircle(c); setAuthMode('login') }} />
      )}
    </>
  )
}
