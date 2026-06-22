// ─── CompetidorInicio.jsx ────────────────────────────────────
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getCompeticiones, getInscripcionesUsuario } from '../lib/supabase'
import { Card, CardTitle, Badge, Spinner, Row } from '../components/ui'

export function CompetidorInicio() {
  const { perfil } = useAuth()
  const [comps, setComps]   = useState([])
  const [mis, setMis]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfil) return
    Promise.all([
      getCompeticiones().then(({ data }) => setComps(data ?? [])),
      getInscripcionesUsuario(perfil.id).then(({ data }) => setMis(data ?? [])),
    ]).finally(() => setLoading(false))
  }, [perfil])

  if (loading) return <Spinner />

  const proximas = comps.filter(c => c.estado !== 'bloqueada' && c.estado !== 'finalizada')
  const misComps = [...new Set(mis.map(i => i.competicion_id))]

  return (
    <div>
      <div style={{ background:'linear-gradient(135deg,#2a1e0a,#1a1c28)', border:'1px solid #2d3142', borderRadius:10, padding:16, marginBottom:12 }}>
        <div style={{ fontSize:20, fontWeight:600, color:'#f0ead6', marginBottom:2 }}>Hola, {perfil?.nombre} 👋</div>
        <div style={{ fontSize:13, color:'#9ca3af' }}>{perfil?.email}</div>
      </div>
      <Card>
        <CardTitle>📅 Próximas competiciones</CardTitle>
        {proximas.length === 0 ? <div style={{ color:'#6b7280', fontSize:13 }}>Sin competiciones próximas</div> :
          proximas.map(c => (
            <Row key={c.id}>
              <div>
                <div style={{ fontWeight:500 }}>{c.nombre}</div>
                <div style={{ fontSize:11, color:'#6b7280' }}>{c.fecha}{c.lugar ? ' · ' + c.lugar : ''}</div>
              </div>
              <Badge type={c.modalidad}/>
            </Row>
          ))}
      </Card>
      <Card>
        <CardTitle>🐴 Mis inscripciones</CardTitle>
        {mis.length === 0 ? <div style={{ color:'#6b7280', fontSize:13 }}>No estás inscrito en ninguna competición</div> :
          misComps.map(cid => {
            const comp = comps.find(c => c.id === cid)
            const myCabs = mis.filter(i => i.competicion_id === cid)
            return (
              <div key={cid} style={{ marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:500, color:'#f0ead6', marginBottom:6 }}>{comp?.nombre}</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {myCabs.map(i => (
                    <span key={i.id} style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#1c1f2a', border:'1px solid #2d3142', borderRadius:20, padding:'4px 10px', fontSize:12, color:'#9ca3af' }}>
                      🐴 {i.caballos?.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
      </Card>
    </div>
  )
}

export default CompetidorInicio
