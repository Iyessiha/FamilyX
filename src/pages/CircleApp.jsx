import { useState } from 'react'
import { AppShell } from '../components/shared/Layout'
import FamilyHome from './family/FamilyHome'
import FamilyTree from './family/FamilyTree'
import FamilyMessages from './family/FamilyMessages'
import FamilyGroups from './family/FamilyGroups'
import ProfilePage from './family/ProfilePage'
import { FaithHome, FaithMembers, FaithEvents } from './faith/FaithPages'
import { OrgHome, OrgTeams, OrgProjects } from './org/OrgPages'
import { ClubHome, ClubMembers, ClubProjects } from './club/ClubPages'
import SubscriptionPage from './subscription/SubscriptionPage'
import NotificationsPage from './notifications/NotificationsPage'
import GalleryPage from './gallery/GalleryPage'
import SettingsPage from './settings/SettingsPage'

const TABS = {
  family: [
    { id: 'home',         icon: '🏠', label: 'Accueil' },
    { id: 'tree',         icon: '🌳', label: 'Arbre' },
    { id: 'gallery',      icon: '📸', label: 'Galerie' },
    { id: 'messages',     icon: '💬', label: 'Messages', badge: 3 },
    { id: 'more',         icon: '⋯',  label: 'Plus' },
  ],
  mosque: [
    { id: 'home',         icon: '🕌', label: 'Accueil' },
    { id: 'membres',      icon: '👥', label: 'Membres' },
    { id: 'messages',     icon: '💬', label: 'Messages', badge: 2 },
    { id: 'events',       icon: '📅', label: 'Événements' },
    { id: 'more',         icon: '⋯',  label: 'Plus' },
  ],
  church: [
    { id: 'home',         icon: '⛪', label: 'Accueil' },
    { id: 'membres',      icon: '👥', label: 'Membres' },
    { id: 'messages',     icon: '💬', label: 'Messages', badge: 1 },
    { id: 'events',       icon: '📅', label: 'Célébrations' },
    { id: 'more',         icon: '⋯',  label: 'Plus' },
  ],
  org: [
    { id: 'home',         icon: '📊', label: 'Dashboard' },
    { id: 'equipes',      icon: '👥', label: 'Équipes' },
    { id: 'messages',     icon: '💬', label: 'Messages', badge: 5 },
    { id: 'projets',      icon: '📋', label: 'Projets' },
    { id: 'more',         icon: '⋯',  label: 'Plus' },
  ],
  club: [
    { id: 'home',         icon: '🏛️', label: 'Accueil' },
    { id: 'membres',      icon: '👥', label: 'Membres' },
    { id: 'messages',     icon: '💬', label: 'Messages', badge: 1 },
    { id: 'projets',      icon: '🎯', label: 'Projets' },
    { id: 'more',         icon: '⋯',  label: 'Plus' },
  ],
}

// "Plus" menu — shown when user taps ⋯
function MoreMenu({ c, onNavigate, onClose }) {
  const items = [
    { id: 'groups',       icon: '👥', label: 'Groupes' },
    { id: 'gallery',      icon: '📸', label: 'Galerie' },
    { id: 'notifications',icon: '🔔', label: 'Notifications' },
    { id: 'subscription', icon: '⭐', label: 'Abonnement' },
    { id: 'profile',      icon: '👤', label: 'Mon profil' },
    { id: 'settings',     icon: '⚙️', label: 'Paramètres' },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 800, background: '#000000aa' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'absolute', bottom: 70, left: 0, right: 0,
        background: c.bgSecond, borderRadius: '20px 20px 0 0',
        border: `1px solid ${c.border}33`, padding: '16px 16px 24px',
        maxWidth: 430, margin: '0 auto',
      }}>
        <div style={{ width: 40, height: 4, background: c.textSubtle, borderRadius: 2, margin: '0 auto 16px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {items.map(item => (
            <button key={item.id} onClick={() => { onNavigate(item.id); onClose() }} style={{
              background: c.surface, border: `1px solid ${c.border}22`,
              borderRadius: 14, padding: '14px 8px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = c.color1}
              onMouseLeave={e => e.currentTarget.style.borderColor = `${c.border}22`}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <span style={{ fontSize: 11, color: c.text, fontFamily: c.font }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CircleApp({ circle, user, onLogout, onUpdateUser }) {
  const [tab, setTab] = useState('home')
  const [showMore, setShowMore] = useState(false)
  const c = circle
  const tabs = TABS[c.id] || TABS.family

  const handleTabChange = (t) => {
    if (t === 'more') { setShowMore(true); return }
    setShowMore(false)
    setTab(t)
  }

  const navigate = (t) => { setTab(t); setShowMore(false) }

  const renderPage = () => {
    // Shared across all circles
    if (tab === 'profile')       return <ProfilePage c={c} user={user} onLogout={onLogout} onUpdate={onUpdateUser} />
    if (tab === 'messages')      return <FamilyMessages c={c} user={user} />
    if (tab === 'subscription')  return <SubscriptionPage c={c} user={user} onClose={() => navigate('home')} />
    if (tab === 'notifications') return <NotificationsPage c={c} user={user} />
    if (tab === 'gallery')       return <GalleryPage c={c} user={user} />
    if (tab === 'settings')      return <SettingsPage c={c} user={user} onLogout={onLogout} onNavigate={navigate} />

    // Family
    if (c.id === 'family') {
      if (tab === 'home')    return <FamilyHome c={c} user={user} />
      if (tab === 'tree')    return <FamilyTree c={c} user={user} />
      if (tab === 'groups')  return <FamilyGroups c={c} user={user} />
    }

    // Mosque / Church
    if (c.id === 'mosque' || c.id === 'church') {
      if (tab === 'home')    return <FaithHome c={c} user={user} />
      if (tab === 'membres') return <FaithMembers c={c} user={user} />
      if (tab === 'events')  return <FaithEvents c={c} user={user} />
      if (tab === 'groups')  return <FamilyGroups c={c} user={user} />
    }

    // Org
    if (c.id === 'org') {
      if (tab === 'home')    return <OrgHome c={c} user={user} />
      if (tab === 'equipes') return <OrgTeams c={c} user={user} />
      if (tab === 'projets') return <OrgProjects c={c} user={user} />
    }

    // Club
    if (c.id === 'club') {
      if (tab === 'home')    return <ClubHome c={c} user={user} />
      if (tab === 'membres') return <ClubMembers c={c} user={user} />
      if (tab === 'projets') return <ClubProjects c={c} user={user} />
    }

    return <div style={{ color: c.text, padding: 20 }}>Page en construction…</div>
  }

  return (
    <>
      <AppShell c={c} user={user} tabs={tabs} activeTab={tab} onTabChange={handleTabChange}>
        {renderPage()}
      </AppShell>
      {showMore && <MoreMenu c={c} onNavigate={navigate} onClose={() => setShowMore(false)} />}
    </>
  )
}
