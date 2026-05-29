// Shared reusable components for all circles

export function Avatar({ name, emoji, size = 42, color1, color2, online }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, ${color1}33, ${color2}66)`,
        border: `2px solid ${color1}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.45,
      }}>
        {emoji || name?.[0]?.toUpperCase()}
      </div>
      {online !== undefined && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.25, height: size * 0.25,
          borderRadius: '50%',
          background: online ? '#22c55e' : '#555',
          border: '2px solid #050505',
        }} />
      )}
    </div>
  )
}

export function Card({ children, c, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: c.surface,
      border: `1px solid ${c.border}22`,
      borderRadius: 16,
      padding: '16px',
      transition: 'border-color 0.2s, transform 0.2s',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = `${c.border}55`; e.currentTarget.style.transform = 'translateY(-1px)' } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.borderColor = `${c.border}22`; e.currentTarget.style.transform = 'translateY(0)' } }}
    >
      {children}
    </div>
  )
}

export function Badge({ label, color1, small }) {
  return (
    <span style={{
      display: 'inline-block',
      background: `${color1}18`,
      border: `1px solid ${color1}44`,
      color: color1,
      borderRadius: 20,
      padding: small ? '2px 8px' : '4px 12px',
      fontSize: small ? 10 : 12,
      fontFamily: 'monospace',
      whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

export function Button({ children, c, variant = 'primary', onClick, full, small, style: s = {} }) {
  const base = {
    border: 'none', borderRadius: 12,
    padding: small ? '8px 16px' : '13px 20px',
    fontSize: small ? 13 : 15,
    fontWeight: 600, cursor: 'pointer',
    width: full ? '100%' : 'auto',
    transition: 'transform 0.15s, box-shadow 0.15s',
    fontFamily: c?.font || 'inherit',
    ...s,
  }
  const styles = {
    primary: {
      ...base,
      background: `linear-gradient(135deg, ${c.color1}, ${c.color2})`,
      color: '#fff',
      boxShadow: `0 4px 20px ${c.color1}44`,
    },
    ghost: {
      ...base,
      background: c.surface,
      border: `1px solid ${c.border}33`,
      color: c.text,
      boxShadow: 'none',
    },
    danger: {
      ...base,
      background: '#7f1d1d',
      border: '1px solid #ef444433',
      color: '#fca5a5',
      boxShadow: 'none',
    }
  }
  return (
    <button style={styles[variant]} onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 28px ${c.color1}55` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = variant === 'primary' ? `0 4px 20px ${c.color1}44` : 'none' }}
    >
      {children}
    </button>
  )
}

export function Input({ label, placeholder, type = 'text', value, onChange, c }) {
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: c.textMuted, marginBottom: 6, fontFamily: 'monospace', letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          width: '100%', background: c.bg,
          border: `1px solid ${c.border}33`,
          borderRadius: 12, padding: '12px 16px',
          color: c.text, fontSize: 14, outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = c.color1}
        onBlur={e => e.target.style.borderColor = `${c.border}33`}
      />
    </div>
  )
}

export function StatBox({ label, value, icon, c }) {
  return (
    <div style={{
      background: c.surface, border: `1px solid ${c.border}22`,
      borderRadius: 14, padding: '14px', textAlign: 'center', flex: 1,
    }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: c.color1, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: c.textMuted, marginTop: 2 }}>{label}</div>
    </div>
  )
}

export function Divider({ c }) {
  return <div style={{ height: 1, background: `${c.border}18`, margin: '4px 0' }} />
}

export function SectionTitle({ children, c, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: c.color1, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'monospace' }}>
        {children}
      </div>
      {action}
    </div>
  )
}
