import { useState, useRef } from 'react'
import { Card, Badge, Button, SectionTitle } from '../../components/shared/UI'
import { LockGate } from '../subscription/SubscriptionPage'
import { getUserPlan } from '../../utils/subscriptionStore'

const STORAGE_KEY = 'familyx_gallery'

function getPhotos(circleId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return all[circleId] || getDemoPhotos()
  } catch { return getDemoPhotos() }
}

function savePhotos(circleId, photos) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    all[circleId] = photos
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {}
}

function getDemoPhotos() {
  return [
    { id: 'p1', title: 'Retrouvailles 2024', uploader: 'Grand-mère Marie', emoji: '👵', date: '15 Déc 2024', album: 'Famille', likes: 12, comments: 4, color: '#B8860B' },
    { id: 'p2', title: 'Anniversaire Papa', uploader: 'Sœur Efua', emoji: '👧🏿', date: '3 Jan 2025', album: 'Anniversaires', likes: 18, comments: 7, color: '#7c3aed' },
    { id: 'p3', title: 'Village natal', uploader: 'Papa Kofi', emoji: '👨🏿', date: '20 Jan 2025', album: 'Voyages', likes: 9, comments: 2, color: '#16a34a' },
    { id: 'p4', title: 'Noël en famille', uploader: 'Maman Ama', emoji: '👩🏿', date: '25 Déc 2024', album: 'Famille', likes: 24, comments: 11, color: '#ef4444' },
    { id: 'p5', title: 'Graduation Efua', uploader: 'Papa Kofi', emoji: '👨🏿', date: '10 Fév 2025', album: 'Événements', likes: 31, comments: 14, color: '#0891b2' },
    { id: 'p6', title: 'Cuisine grand-mère', uploader: 'Cousine Akua', emoji: '👧🏽', date: '5 Mar 2025', album: 'Quotidien', likes: 16, comments: 5, color: '#d97706' },
  ]
}

const ALBUMS = ['Tous', 'Famille', 'Anniversaires', 'Voyages', 'Événements', 'Quotidien']

export default function GalleryPage({ c, user }) {
  const [photos, setPhotos] = useState(() => getPhotos(user?.circleId))
  const [album, setAlbum] = useState('Tous')
  const [view, setView] = useState('grid') // grid | list
  const [lightbox, setLightbox] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const fileRef = useRef()
  const plan = getUserPlan(user?.id)

  const usedMb = Math.round(photos.length * 0.8) // Demo estimate
  const maxMb = plan.limits.storagesMb
  const storagePercent = Math.min(100, (usedMb / maxMb) * 100)

  const filtered = album === 'Tous' ? photos : photos.filter(p => p.album === album)

  const handleUpload = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    Promise.all(files.map(f => new Promise(res => {
      const reader = new FileReader()
      reader.onload = ev => res({ id: 'p' + Date.now() + Math.random(), src: ev.target.result, title: f.name.replace(/\.[^/.]+$/, ''), uploader: user?.name, emoji: user?.roleEmoji, date: new Date().toLocaleDateString('fr-FR'), album: album === 'Tous' ? 'Famille' : album, likes: 0, comments: 0, color: c.color1 })
      reader.readAsDataURL(f)
    }))).then(newPhotos => {
      const updated = [...newPhotos, ...photos]
      setPhotos(updated)
      savePhotos(user?.circleId, updated)
      setUploading(false)
      setShowUpload(false)
    })
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: c.text }}>Galerie 📸</div>
          <div style={{ fontSize: 12, color: c.textMuted }}>{photos.length} photos · {usedMb} Mo utilisés</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setView(view === 'grid' ? 'list' : 'grid')} style={{ background: c.surface, border: `1px solid ${c.border}22`, borderRadius: 10, width: 36, height: 36, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {view === 'grid' ? '☰' : '⊞'}
          </button>
          <Button c={c} small onClick={() => setShowUpload(true)}>+ Ajouter</Button>
        </div>
      </div>

      {/* Storage bar */}
      <Card c={c} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: c.textMuted }}>Stockage utilisé</span>
          <span style={{ color: storagePercent > 80 ? '#ef4444' : c.color1, fontWeight: 700 }}>
            {usedMb} Mo / {maxMb >= 1000 ? `${maxMb / 1000} Go` : `${maxMb} Mo`}
          </span>
        </div>
        <div style={{ height: 6, background: `${c.border}22`, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${storagePercent}%`, background: storagePercent > 80 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : `linear-gradient(90deg, ${c.color1}, ${c.color2})`, borderRadius: 3, transition: 'width 0.8s ease' }} />
        </div>
        {storagePercent > 70 && (
          <div style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>
            ⚠️ Stockage presque plein — <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Passer au Premium</span>
          </div>
        )}
      </Card>

      {/* Upload zone */}
      {showUpload && (
        <Card c={c} style={{ marginBottom: 16, border: `1px solid ${c.color1}44`, animation: 'slideUp 0.3s ease' }}>
          <div style={{ fontSize: 12, color: c.color1, fontFamily: 'monospace', marginBottom: 12 }}>AJOUTER DES PHOTOS</div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
          <div onClick={() => fileRef.current.click()} style={{
            border: `2px dashed ${c.border}44`, borderRadius: 12,
            padding: '30px', textAlign: 'center', cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = c.color1}
            onMouseLeave={e => e.currentTarget.style.borderColor = `${c.border}44`}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>📤</div>
            <div style={{ fontSize: 14, color: c.text, marginBottom: 4 }}>Cliquez pour sélectionner des photos</div>
            <div style={{ fontSize: 12, color: c.textMuted }}>JPG, PNG, WEBP · Max 5Mo par photo</div>
          </div>
          {uploading && <div style={{ textAlign: 'center', color: c.color1, fontSize: 13, marginTop: 10 }}>⏳ Traitement en cours…</div>}
          <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', color: c.textMuted, fontSize: 12, cursor: 'pointer', marginTop: 8, fontFamily: c.font }}>Annuler</button>
        </Card>
      )}

      {/* Album tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4, scrollbarWidth: 'none' }}>
        {ALBUMS.map(a => (
          <button key={a} onClick={() => setAlbum(a)} style={{
            flexShrink: 0, background: album === a ? `linear-gradient(135deg, ${c.color1}, ${c.color2})` : c.surface,
            border: `1px solid ${album === a ? 'transparent' : c.border + '22'}`,
            borderRadius: 20, padding: '6px 14px', fontSize: 12,
            color: album === a ? '#fff' : c.textMuted,
            cursor: 'pointer', fontFamily: c.font,
          }}>{a}</button>
        ))}
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {filtered.map(photo => (
            <div key={photo.id} onClick={() => setLightbox(photo)} style={{
              aspectRatio: '1', borderRadius: 10, overflow: 'hidden',
              background: photo.src ? `url(${photo.src}) center/cover` : `linear-gradient(135deg, ${photo.color}44, ${photo.color}22)`,
              border: `1px solid ${c.border}18`, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              position: 'relative',
            }}>
              {!photo.src && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                  {photo.emoji}
                </div>
              )}
              <div style={{ background: 'linear-gradient(180deg, transparent, #000000aa)', padding: '20px 6px 6px' }}>
                <div style={{ fontSize: 9, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.title}</div>
                <div style={{ fontSize: 8, color: '#ffffff88' }}>❤️ {photo.likes}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(photo => (
            <Card key={photo.id} c={c} onClick={() => setLightbox(photo)}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                  background: photo.src ? `url(${photo.src}) center/cover` : `linear-gradient(135deg, ${photo.color}44, ${photo.color}22)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>
                  {!photo.src && photo.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{photo.title}</div>
                  <div style={{ fontSize: 11, color: c.textMuted }}>{photo.uploader} · {photo.date}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <Badge label={photo.album} color1={c.color1} small />
                    <span style={{ fontSize: 11, color: c.textMuted }}>❤️ {photo.likes} · 💬 {photo.comments}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: c.textMuted }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 6 }}>Aucune photo</div>
          <div style={{ fontSize: 13 }}>Ajoutez des photos pour commencer votre galerie.</div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: '#000000ee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, maxWidth: 430, margin: '0 auto' }}>
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 16, right: 16, background: '#ffffff22', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', fontSize: 18, cursor: 'pointer' }}>✕</button>

          <div style={{
            width: '100%', maxWidth: 380, aspectRatio: '4/3', borderRadius: 16,
            background: lightbox.src ? `url(${lightbox.src}) center/cover` : `linear-gradient(135deg, ${lightbox.color}44, ${lightbox.color}22)`,
            marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60,
          }}>
            {!lightbox.src && lightbox.emoji}
          </div>

          <div style={{ textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{lightbox.title}</div>
            <div style={{ fontSize: 12, color: '#ffffff88', marginBottom: 12 }}>Par {lightbox.uploader} · {lightbox.date}</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button style={{ background: '#ffffff22', border: 'none', borderRadius: 20, padding: '8px 16px', color: '#fff', fontSize: 13, cursor: 'pointer' }}>❤️ {lightbox.likes}</button>
              <button style={{ background: '#ffffff22', border: 'none', borderRadius: 20, padding: '8px 16px', color: '#fff', fontSize: 13, cursor: 'pointer' }}>💬 {lightbox.comments}</button>
              <button style={{ background: '#ffffff22', border: 'none', borderRadius: 20, padding: '8px 16px', color: '#fff', fontSize: 13, cursor: 'pointer' }}>↗ Partager</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
