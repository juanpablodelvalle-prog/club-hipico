import { useAuth } from '../hooks/useAuth'
import { signOut } from '../lib/supabase'

const ADMIN_NAV = [
  { id:'panel',         icon:'📊', label:'Panel' },
  { id:'competidores',  icon:'🧑‍🤝‍🧑', label:'Competidores' },
  { id:'competiciones', icon:'🏆', label:'Competiciones' },
  { id:'puntuaciones',  icon:'⏱', label:'Puntuaciones' },
  { id:'resultados',    icon:'🥇', label:'Resultados' },
]
const COMP_NAV = [
  { id:'cv-inicio',  icon:'🏠', label:'Inicio' },
  { id:'cv-clasif',  icon:'🥇', label:'Clasificación' },
  { id:'cv-mis',     icon:'📋', label:'Mis puntos' },
]

export default function Layout({ seccion, onNav, children }) {
  const { perfil, esAdmin, esJuez } = useAuth()
  const nav = (esAdmin || esJuez) ? ADMIN_NAV : COMP_NAV

  return (
    <div style={{ display:'flex', height:'100%', flexDirection:'column' }}>
      <style>{`
        @media(min-width:768px){
          .app-shell{flex-direction:row!important}
          .topbar{display:none!important}
          .bottomnav{display:none!important}
          .sidebar{display:flex!important}
          .main-content{padding:28px 32px 28px!important}
        }
        @media(max-width:767px){
          .sidebar{display:none!important}
          .main-content{padding:14px 12px 82px!important}
        }
      `}</style>
      <div className="app-shell" style={{ display:'flex', flex:1, flexDirection:'column', overflow:'hidden' }}>

        {/* Sidebar desktop */}
        <aside className="sidebar" style={{ display:'none', width:220, flexShrink:0, background:'#161820', borderRight:'1px solid #1e2130', flexDirection:'column', height:'100%' }}>
          <div style={{ padding:'20px 16px 18px', borderBottom:'1px solid #1e2130', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#c9a96e,#8b6914)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🐴</div>
            <div><div style={{ fontSize:14, fontWeight:600, color:'#f0ead6' }}>Club Hípico</div><div style={{ fontSize:10, color:'#6b7280' }}>Gestión deportiva</div></div>
          </div>
          <nav style={{ flex:1, padding:10, overflowY:'auto' }}>
            {nav.map(item => (
              <button key={item.id} onClick={() => onNav(item.id)}
                style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'10px 11px', fontSize:13, borderRadius:8, border:'none', cursor:'pointer', marginBottom:2, textAlign:'left', background: seccion===item.id ? '#c9a96e18' : 'transparent', color: seccion===item.id ? '#c9a96e' : '#9ca3af', fontWeight: seccion===item.id ? 600 : 400, fontFamily:'inherit' }}>
                <span style={{ fontSize:16, width:18, textAlign:'center' }}>{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
          <div style={{ padding:'14px 16px', borderTop:'1px solid #1e2130', fontSize:11, color:'#6b7280' }}>
            <div style={{ color:'#9ca3af', fontSize:12, marginBottom:2 }}>{perfil?.nombre} {perfil?.apellidos}</div>
            <div style={{ marginBottom:8 }}>{perfil?.email}</div>
            <button onClick={signOut} style={{ padding:'8px 12px', fontSize:12, background:'transparent', border:'1px solid #2d3142', borderRadius:7, color:'#9ca3af', cursor:'pointer', width:'100%', fontFamily:'inherit' }}>Cerrar sesión</button>
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, height:'100%', overflow:'hidden' }}>

          {/* Topbar mobile */}
          <div className="topbar" style={{ height:56, background:'#161820', borderBottom:'1px solid #1e2130', display:'flex', alignItems:'center', padding:'0 16px', gap:12, flexShrink:0 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#c9a96e,#8b6914)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>🐴</div>
            <span style={{ fontSize:15, fontWeight:600, color:'#f0ead6' }}>Club Hípico</span>
            <span style={{ fontSize:13, color:'#9ca3af', marginLeft:'auto' }}>{nav.find(n=>n.id===seccion)?.label}</span>
            <button onClick={signOut} style={{ background:'transparent', border:'1px solid #2d3142', borderRadius:7, color:'#9ca3af', fontSize:12, padding:'6px 10px', cursor:'pointer', flexShrink:0, fontFamily:'inherit' }}>Salir</button>
          </div>

          {/* Content */}
          <div className="main-content" id="main-content" style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'14px 12px 82px' }}>
            {children}
          </div>

          {/* Bottom nav mobile */}
          <nav className="bottomnav" style={{ height:68, background:'#161820', borderTop:'1px solid #1e2130', display:'flex', flexShrink:0 }}>
            {nav.map(item => (
              <button key={item.id} onClick={() => onNav(item.id)}
                style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, border:'none', background:'transparent', cursor:'pointer', color: seccion===item.id ? '#c9a96e' : '#6b7280', fontSize:10, padding:'6px 2px', position:'relative', minHeight:60, fontFamily:'inherit', touchAction:'manipulation' }}>
                {seccion===item.id && <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:28, height:3, background:'#c9a96e', borderRadius:'0 0 3px 3px' }}/>}
                <span style={{ fontSize:20, lineHeight:1 }}>{item.icon}</span>
                <span style={{ fontSize:10 }}>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
