import { useState } from 'react'
import { Card, Badge, Button, SectionTitle } from '../../components/shared/UI'
import { getUserPlan } from '../../utils/subscriptionStore'

function Toggle({ initialOn = true, color, onChange }) {
  const [on, setOn] = useState(initialOn)
  const toggle = () => { setOn(!on); onChange && onChange(!on) }
  return (
    <div onClick={toggle} style={{ width: 44, height: 24, borderRadius: 12, background: on ? color : '#333', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px #00000044' }} />
    </div>
  )
}

function Section({ title, children, c }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, color: c.color1, fontFamily: 'monospace', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>{title}</div>
      <Card c={c} style={{ padding: '4px 0' }}>
        {children}
      </Card>
    </div>
  )
}

function Row({ icon, label, desc, action, c, danger, last }) {
  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'center',
      padding: '13px 16px',
      borderBottom: last ? 'none' : `1px solid ${c.border}10`,
    }}>
      <span style={{ fontSize: 20, width: 26, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: danger ? '#ef4444' : c.text }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: c.textMuted, marginTop: 1 }}>{desc}</div>}
      </div>
      {action}
    </div>
  )
}

export default function SettingsPage({ c, user, onLogout, onNavigate }) {
  const plan = getUserPlan(user?.id)
  const [lang, setLang] = useState('fr')
  const [theme, setTheme] = useState('dark')

  return (
    <div className="fade-in">
      <div style={{ fontSize: 20, fontWeight: 900, color: c.text, marginBottom: 20 }}>Paramètres ⚙️</div>

      {/* Account */}
      <Section title="Mon compte" c={c}>
        <Row icon="👤" label={user?.name} desc={user?.email} action={
          <button onClick={() => onNavigate('profile')} style={{ background: `${c.color1}18`, border: `1px solid ${c.color1}33`, borderRadius: 8, padding: '5px 10px', fontSize: 12, color: c.color1, cursor: 'pointer' }}>Modifier</button>
        } c={c} />
        <Row icon="🔑" label="Mot de passe" desc="Dernière modification inconnue" action={<span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>} c={c} />
        <Row icon="📧" label="Email" desc={user?.email} action={<span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>} c={c} />
        <Row icon="📱" label="Téléphone" desc={user?.phone || 'Non renseigné'} action={<span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>} c={c} last />
      </Section>

      {/* Subscription */}
      <Section title="Abonnement" c={c}>
        <Row icon={plan.emoji} label={`Plan ${plan.name}`} desc={plan.id === 'free' ? 'Fonctionnalités limitées' : 'Abonnement actif'} action={
          <button onClick={() => onNavigate('subscription')} style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 12, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
            {plan.id === 'free' ? 'Passer Premium ⭐' : 'Gérer'}
          </button>
        } c={c} />
        {plan.id !== 'free' && (
          <Row icon="🧾" label="Historique de facturation" desc="Voir vos factures" action={<span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>} c={c} last />
        )}
      </Section>

      {/* Privacy */}
      <Section title="Confidentialité" c={c}>
        <Row icon="👁" label="Profil visible par" desc="Membres de mon cercle" action={
          <select style={{ background: c.surface, border: `1px solid ${c.border}33`, borderRadius: 8, padding: '5px 8px', color: c.text, fontSize: 12, cursor: 'pointer' }}>
            <option>Mon cercle</option>
            <option>Mes liens</option>
            <option>Personne</option>
          </select>
        } c={c} />
        <Row icon="📍" label="Afficher ma localisation" desc="Dans votre profil public" action={<Toggle initialOn={true} color={c.color1} />} c={c} />
        <Row icon="🟢" label="Afficher mon statut en ligne" action={<Toggle initialOn={true} color={c.color1} />} c={c} />
        <Row icon="🔍" label="Recherchable par ID" desc="Permettre aux autres de vous trouver" action={<Toggle initialOn={true} color={c.color1} />} c={c} last />
      </Section>

      {/* Notifications */}
      <Section title="Notifications" c={c}>
        <Row icon="🔔" label="Notifications push" action={<Toggle initialOn={true} color={c.color1} />} c={c} />
        <Row icon="📧" label="Notifications par email" action={<Toggle initialOn={false} color={c.color1} />} c={c} />
        <Row icon="📱" label="Notifications SMS" action={<Toggle initialOn={false} color={c.color1} />} c={c} last />
      </Section>

      {/* Appearance */}
      <Section title="Apparence" c={c}>
        <Row icon="🌍" label="Langue" desc="Français" action={
          <select value={lang} onChange={e => setLang(e.target.value)} style={{ background: c.surface, border: `1px solid ${c.border}33`, borderRadius: 8, padding: '5px 8px', color: c.text, fontSize: 12, cursor: 'pointer' }}>
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 English</option>
            <option value="ar">🇸🇦 العربية</option>
            <option value="pt">🇧🇷 Português</option>
          </select>
        } c={c} />
        <Row icon="🎨" label="Thème" action={
          <div style={{ display: 'flex', gap: 6 }}>
            {[['dark', '🌙'], ['light', '☀️']].map(([t, e]) => (
              <button key={t} onClick={() => setTheme(t)} style={{ background: theme === t ? `${c.color1}22` : c.surface, border: `1px solid ${theme === t ? c.color1 : c.border + '22'}`, borderRadius: 8, padding: '5px 10px', color: theme === t ? c.color1 : c.textMuted, fontSize: 14, cursor: 'pointer' }}>{e}</button>
            ))}
          </div>
        } c={c} last />
      </Section>

      {/* Security */}
      <Section title="Sécurité" c={c}>
        <Row icon="🔐" label="Authentification 2 facteurs" desc="Recommandé" action={<Toggle initialOn={false} color={c.color1} />} c={c} />
        <Row icon="📱" label="Appareils connectés" desc="2 appareils actifs" action={<span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>} c={c} />
        <Row icon="🕐" label="Historique de connexion" action={<span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>} c={c} last />
      </Section>

      {/* Storage */}
      <Section title="Stockage" c={c}>
        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: c.textMuted }}>Utilisé</span>
            <span style={{ color: c.text, fontWeight: 600 }}>
              {plan.limits.storagesMb >= 20000 ? '20 Go' : plan.limits.storagesMb >= 5000 ? '5 Go' : '50 Mo'} disponibles
            </span>
          </div>
          <div style={{ height: 6, background: `${c.border}22`, borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: '12%', background: `linear-gradient(90deg, ${c.color1}, ${c.color2})`, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 11, color: c.textMuted }}>6 Mo utilisés sur {plan.limits.storagesMb >= 20000 ? '20 Go' : plan.limits.storagesMb >= 5000 ? '5 Go' : '50 Mo'}</div>
        </div>
      </Section>

      {/* Support */}
      <Section title="Support" c={c}>
        <Row icon="❓" label="Centre d'aide" desc="FAQ et tutoriels" action={<span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>} c={c} />
        <Row icon="💬" label="Contacter le support" desc={plan.limits.prioritySupport ? 'Support prioritaire 24/7' : 'Support standard'} action={<span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>} c={c} />
        <Row icon="🐛" label="Signaler un bug" action={<span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>} c={c} />
        <Row icon="⭐" label="Noter l'application" action={<span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>} c={c} last />
      </Section>

      {/* Legal */}
      <Section title="Légal" c={c}>
        <Row icon="📄" label="Conditions d'utilisation" action={<span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>} c={c} />
        <Row icon="🔏" label="Politique de confidentialité" action={<span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>} c={c} />
        <Row icon="ℹ️" label="À propos" desc="FamilyX v3.0.0" action={<span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>} c={c} last />
      </Section>

      {/* Danger zone */}
      <Section title="Zone de danger" c={c}>
        <Row icon="📤" label="Exporter mes données" desc="Télécharger toutes vos données" action={<span style={{ color: c.textSubtle, fontSize: 14 }}>›</span>} c={c} />
        <Row icon="🗑️" label="Supprimer mon compte" desc="Action irréversible" action={<span style={{ color: '#ef4444', fontSize: 14 }}>›</span>} c={c} danger last />
      </Section>

      {/* Logout */}
      <button onClick={onLogout} style={{ width: '100%', background: '#1a0505', border: '1px solid #ef444433', borderRadius: 14, padding: '15px', color: '#ef4444', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: c.font, marginBottom: 30 }}>
        ⎋ Se déconnecter
      </button>
    </div>
  )
}
