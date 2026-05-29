import { useState } from 'react'
import { AppShell } from '../components/shared/Layout'
import FamilyHome from './family/FamilyHome'
import FamilyTree from './family/FamilyTree'
import FamilyMessages from './family/FamilyMessages'
import FamilyGroups from './family/FamilyGroups'
import ProfilePage from './family/ProfilePage'
import { FaithHome, FaithMembers, FaithEvents, FaithProfile } from './faith/FaithPages'
import { OrgHome, OrgTeams, OrgProjects } from './org/OrgPages'
import { ClubHome, ClubMembers, ClubProjects } from './club/ClubPages'

const TABS = {
  family: [
    { id: 'home', icon: '🏠', label: 'Accueil' },
    { id: 'tree', icon: '🌳', label: 'Arbre' },
    { id: 'messages', icon: '💬', label: 'Messages', badge: 3 },
    { id: 'groups', icon: '👥', label: 'Groupes' },
    { id: 'profile', icon: '👤', label: 'Profil' },
  ],
  faith: [
    { id: 'home', icon: '🕌', label: 'Accueil' },
    { id: 'membres', icon: '👥', label: 'Membres' },
    { id: 'messages', icon: '💬', label: 'Messages', badge: 2 },
    { id: 'events', icon: '📅', label: 'Événements' },
    { id: 'profile', icon: '👤', label: 'Profil' },
  ],
  org: [
    { id: 'home', icon: '📊', label: 'Dashboard' },
    { id: 'equipes', icon: '👥', label: 'Équipes' },
    { id: 'messages', icon: '💬', label: 'Messages', badge: 5 },
    { id: 'projets', icon: '📋', label: 'Projets' },
    { id: 'profile', icon: '👤', label: 'Profil' },
  ],
  club: [
    { id: 'home', icon: '🏛️', label: 'Accueil' },
    { id: 'membres', icon: '👥', label: 'Membres' },
    { id: 'messages', icon: '💬', label: 'Messages', badge: 1 },
    { id: 'projets', icon: '🎯', label: 'Projets' },
    { id: 'profile', icon: '👤', label: 'Profil' },
  ],
}

export default function CircleApp({ circle, user, onLogout, onUpdateUser }) {
  const [tab, setTab] = useState('home')
  const c = circle
  const tabs = TABS[c.id] || TABS.family

  const sharedProfile = <ProfilePage c={c} user={user} onLogout={onLogout} onUpdate={onUpdateUser} />
  const sharedMessages = <FamilyMessages c={c} user={user} />

  const renderPage = () => {
    if (tab === 'profile') return sharedProfile
    if (tab === 'messages') return sharedMessages

    if (c.id === 'family') {
      if (tab === 'home') return <FamilyHome c={c} user={user} />
      if (tab === 'tree') return <FamilyTree c={c} user={user} />
      if (tab === 'groups') return <FamilyGroups c={c} user={user} />
    }
    if (c.id === 'faith') {
      if (tab === 'home') return <FaithHome c={c} user={user} />
      if (tab === 'membres') return <FaithMembers c={c} user={user} />
      if (tab === 'events') return <FaithEvents c={c} user={user} />
    }
    if (c.id === 'org') {
      if (tab === 'home') return <OrgHome c={c} user={user} />
      if (tab === 'equipes') return <OrgTeams c={c} user={user} />
      if (tab === 'projets') return <OrgProjects c={c} user={user} />
    }
    if (c.id === 'club') {
      if (tab === 'home') return <ClubHome c={c} user={user} />
      if (tab === 'membres') return <ClubMembers c={c} user={user} />
      if (tab === 'projets') return <ClubProjects c={c} user={user} />
    }
    return <div style={{ color: c.text, padding: 20 }}>Page en construction…</div>
  }

  return (
    <AppShell c={c} user={user} tabs={tabs} activeTab={tab} onTabChange={setTab}>
      {renderPage()}
    </AppShell>
  )
}
