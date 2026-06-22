import { useState } from 'react'
import { signIn } from '../lib/supabase'
import { S } from '../components/ui'

export default function Login() {
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn(email, pass)
    if (error) setError('Credenciales incorrectas')
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0f1117', padding:24 }}>
      <div style={{ width:'100%', maxWidth:340 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#c9a96e,#8b6914)', margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>🐴</div>
          <h1 style={{ fontSize:24, fontWeight:600, color:'#f0ead6', marginBottom:4 }}>Club Hípico</h1>
          <p style={{ fontSize:14, color:'#6b7280' }}>Panel de gestión deportiva</p>
        </div>
        {error && <div style={{ background:'#2d1a1a', border:'1px solid #7f1d1d', borderRadius:8, color:'#fca5a5', fontSize:13, padding:'10px 14px', marginBottom:14 }}>{error}</div>}
        <form onSubmit={handle}>
          <div style={{ marginBottom:14 }}>
            <label style={S.fl}>Email</label>
            <input style={S.fi} type="email" value={email} onChange={e=>setEmail(e.target.value)} required inputMode="email" placeholder="tu@email.com"/>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={S.fl}>Contraseña</label>
            <input style={S.fi} type="password" value={pass} onChange={e=>setPass(e.target.value)} required placeholder="••••••••"/>
          </div>
          <button type="submit" disabled={loading} style={{ ...S.bp, width:'100%', padding:15, fontSize:16, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Entrando…' : 'Entrar →'}
          </button>
        </form>
      </div>
    </div>
  )
}
