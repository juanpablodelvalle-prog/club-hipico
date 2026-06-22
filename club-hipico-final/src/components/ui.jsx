// ── Estilos base ─────────────────────────────────────────────
export const S = {
  fi: { width:'100%', padding:'13px 12px', fontSize:16, background:'#1c1f2a', border:'1.5px solid #2d3142', borderRadius:9, color:'#f0ead6', outline:'none', WebkitAppearance:'none', fontFamily:'inherit' },
  fl: { fontSize:11, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'.04em', display:'block', marginBottom:5 },
  card: { background:'#161820', border:'1px solid #1e2130', borderRadius:10, padding:'14px', marginBottom:12 },
  bp: { display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'13px 18px', fontSize:14, fontWeight:600, background:'#c9a96e', color:'#0f1117', border:'none', borderRadius:9, cursor:'pointer', minHeight:48, whiteSpace:'nowrap', fontFamily:'inherit' },
  bs: { display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'13px 16px', fontSize:14, background:'transparent', border:'1.5px solid #2d3142', borderRadius:9, color:'#9ca3af', cursor:'pointer', minHeight:48, fontFamily:'inherit' },
  bd: { display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'9px 13px', fontSize:13, background:'transparent', border:'1.5px solid #7f1d1d', borderRadius:8, color:'#f87171', cursor:'pointer', fontFamily:'inherit' },
}

const ML = { barrel:'Barrel Racing', pole_bending:'Pole Bending', trail:'Trail' }
export const modalLabel = m => ML[m] || m

export function Badge({ type, children }) {
  const colors = {
    abierta:    ['#0f2a1a','#4ade80'], en_curso:   ['#2a1e0a','#fbbf24'],
    finalizada: ['#1a1010','#f87171'], bloqueada:  ['#1a1010','#f87171'],
    borrador:   ['#1e2130','#6b7280'], barrel:     ['#0f2a1a','#4ade80'],
    pole_bending:['#1a1440','#a78bfa'], trail:     ['#2a1e0a','#fbbf24'],
    competidor: ['#3b1d6e','#c4b5fd'], juez:       ['#14532d','#86efac'],
    admin:      ['#1e3a5f','#93c5fd'], provisional:['#2a1e0a','#fbbf24'],
    definitiva: ['#0f2a1a','#4ade80'],
  }
  const [bg, color] = colors[type] || ['#1e2130','#9ca3af']
  return (
    <span style={{ fontSize:10, padding:'3px 8px', borderRadius:20, fontWeight:500, display:'inline-block', whiteSpace:'nowrap', background:bg, color }}>
      {children || (ML[type] || type?.replace('_',' '))}
    </span>
  )
}

export function Field({ label, children, style }) {
  return <div style={{ marginBottom:14, ...style }}><label style={S.fl}>{label}</label>{children}</div>
}

export function Card({ children, style }) {
  return <div style={{ ...S.card, ...style }}>{children}</div>
}

export function CardTitle({ children }) {
  return <div style={{ fontSize:14, fontWeight:500, color:'#f0ead6', marginBottom:12 }}>{children}</div>
}

export function Row({ children, style }) {
  return <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:'1px solid #1e2130', fontSize:13, gap:8, ...style }}>{children}</div>
}

export function Spinner() {
  return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:120, color:'#6b7280', fontSize:14 }}>Cargando…</div>
}

export function Empty({ msg = 'Sin datos' }) {
  return <div style={{ color:'#6b7280', fontSize:13, padding:'20px 0' }}>{msg}</div>
}

export function Flash({ msg }) {
  return msg ? <span style={{ fontSize:12, color:'#4ade80' }}>{msg}</span> : null
}

export function Modal({ id, title, children, onClose }) {
  return (
    <div
      id={id}
      onClick={e => e.target.id === id && onClose?.()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:500, display:'none', alignItems:'flex-end', justifyContent:'center' }}
    >
      <div style={{ background:'#161820', borderRadius:'16px 16px 0 0', padding:'12px 16px 36px', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ width:36, height:4, background:'#2d3142', borderRadius:2, margin:'0 auto 16px' }}/>
        <h3 style={{ fontSize:18, fontWeight:600, color:'#f0ead6', marginBottom:18 }}>{title}</h3>
        {children}
      </div>
    </div>
  )
}

export function Confirm({ open, msg, onOk, onCancel }) {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.82)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#161820', border:'1px solid #2d3142', borderRadius:14, padding:24, width:'100%', maxWidth:340 }}>
        <h4 style={{ fontSize:16, fontWeight:600, color:'#f0ead6', marginBottom:8 }}>⚠️ Confirmar modificación</h4>
        <p style={{ fontSize:13, color:'#9ca3af', marginBottom:20, lineHeight:1.5 }}>{msg}</p>
        <div style={{ display:'flex', gap:10 }}>
          <button style={{ ...S.bs, flex:1 }} onClick={onCancel}>Cancelar</button>
          <button style={{ ...S.bp, flex:1 }} onClick={onOk}>Sí, modificar</button>
        </div>
      </div>
    </div>
  )
}

export function openModal(id) {
  const el = document.getElementById(id)
  if (el) { el.style.display = 'flex' }
}
export function closeModal(id) {
  const el = document.getElementById(id)
  if (el) { el.style.display = 'none' }
}

export function Grid2({ children, style }) {
  return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, ...style }}>{children}</div>
}

export function BtnRow({ children, style }) {
  return <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:16, flexWrap:'wrap', ...style }}>{children}</div>
}

export function TableWrap({ children }) {
  return <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}><table style={{ width:'100%', borderCollapse:'collapse', minWidth:300 }}>{children}</table></div>
}

export function Th({ children }) {
  return <th style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.04em', padding:'7px 8px', textAlign:'left', borderBottom:'1px solid #2d3142', whiteSpace:'nowrap', fontWeight:400 }}>{children}</th>
}
export function Td({ children, style }) {
  return <td style={{ padding:'10px 8px', fontSize:13, color:'#f0ead6', borderBottom:'1px solid #1e2130', verticalAlign:'middle', ...style }}>{children}</td>
}

export function PassBox({ pass, email }) {
  return (
    <div style={{ background:'#1c1f2a', border:'1.5px solid #c9a96e', borderRadius:10, padding:16, margin:'14px 0', textAlign:'center' }}>
      <div style={{ fontSize:28, fontWeight:700, color:'#c9a96e', letterSpacing:4, fontFamily:'monospace', marginBottom:6 }}>{pass}</div>
      <div style={{ fontSize:12, color:'#9ca3af' }}>Contraseña para: {email}<br/>Anótala y comunícasela al competidor.</div>
    </div>
  )
}

export function CabChip({ nombre, raza, onDel }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#1c1f2a', border:'1px solid #2d3142', borderRadius:20, padding:'4px 10px', fontSize:12, color:'#9ca3af', margin:3 }}>
      🐴 {nombre}{raza && raza !== '—' ? ` · ${raza}` : ''}
      {onDel && <button onClick={onDel} style={{ background:'transparent', border:'none', color:'#6b7280', cursor:'pointer', fontSize:14, padding:'0 0 0 4px', lineHeight:1 }}>×</button>}
    </span>
  )
}

export function SummaryBar({ suma, pen, total }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, background:'#0f1117', borderRadius:9, padding:10, margin:'10px 0' }}>
      {[['Suma obs.', suma, false], ['Pen.', pen, false], ['Total', total, true]].map(([l, v, acc]) => (
        <div key={l} style={{ textAlign:'center' }}>
          <div style={{ fontSize:10, color:'#6b7280', marginBottom:3 }}>{l}</div>
          <div style={{ fontSize:18, fontWeight:600, color: acc ? '#c9a96e' : '#f0ead6' }}>{v ?? '—'}</div>
        </div>
      ))}
    </div>
  )
}
