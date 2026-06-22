import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getInscripcionesUsuario, supabase } from '../lib/supabase'
import { Card, CardTitle, Spinner, Empty, TableWrap, Th, Td } from '../components/ui'

export default function CompetidorMis() {
  const { perfil } = useAuth()
  const [inscripciones, setInscripciones] = useState([])
  const [puntuaciones, setPuntuaciones]   = useState({}) // { inscripcion_id: [punts] }
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    if (!perfil) return
    cargar()
  }, [perfil])

  const cargar = async () => {
    setLoading(true)
    const { data: ins } = await getInscripcionesUsuario(perfil.id)
    setInscripciones(ins ?? [])

    // Cargar puntuaciones para cada inscripción
    const puntsMap = {}
    for (const i of (ins ?? [])) {
      const { data: pt } = await supabase
        .from('puntuaciones_tiempo')
        .select('*, rondas(numero_ronda)')
        .eq('inscripcion_id', i.id)
      const { data: pt2 } = await supabase
        .from('puntuaciones_trail')
        .select('*, rondas(numero_ronda)')
        .eq('inscripcion_id', i.id)
      puntsMap[i.id] = [...(pt ?? []), ...(pt2 ?? [])]
    }
    setPuntuaciones(puntsMap)
    setLoading(false)
  }

  if (loading) return <Spinner />
  if (!inscripciones.length) return (
    <div>
      <div style={{ marginBottom:16, paddingBottom:14, borderBottom:'1px solid #1e2130' }}>
        <h1 style={{ fontSize:19, fontWeight:600, color:'#f0ead6' }}>Mis puntuaciones</h1>
      </div>
      <Card><Empty msg="No tienes inscripciones registradas"/></Card>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom:16, paddingBottom:14, borderBottom:'1px solid #1e2130' }}>
        <h1 style={{ fontSize:19, fontWeight:600, color:'#f0ead6' }}>Mis puntuaciones</h1>
      </div>

      {inscripciones.map(ins => {
        const comp = ins.competiciones
        const cab  = ins.caballos
        const pts  = puntuaciones[ins.id] || []
        const isTrail = comp?.modalidad === 'trail'

        return (
          <Card key={ins.id}>
            <div style={{ fontSize:14, fontWeight:500, color:'#f0ead6', marginBottom:3 }}>{comp?.nombre}</div>
            <div style={{ fontSize:12, color:'#9ca3af', marginBottom:10 }}>
              🐴 {cab?.nombre} {ins.dorsal ? `· Dorsal #${ins.dorsal}` : ''}
            </div>

            {pts.length === 0 ? (
              <div style={{ color:'#6b7280', fontSize:13 }}>Sin puntuaciones registradas aún</div>
            ) : isTrail ? (
              <>
                <TableWrap>
                  <thead><tr><Th>Ronda</Th><Th>Obs.</Th><Th>Pen.</Th><Th>Total</Th></tr></thead>
                  <tbody>
                    {pts.map(p => (
                      <tr key={p.id}>
                        <Td>R{p.rondas?.numero_ronda ?? '?'}</Td>
                        <Td>{p.suma_obstaculos}</Td>
                        <Td>{p.penalizacion_tiempo}</Td>
                        <Td style={{ fontWeight:600, color:'#c9a96e' }}>{p.puntuacion_final}</Td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
                <div style={{ marginTop:8, fontSize:13, color:'#9ca3af' }}>
                  Total: <strong style={{ color:'#c9a96e' }}>{pts.reduce((s,p) => s + (p.puntuacion_final||0), 0)} pts</strong>
                </div>
              </>
            ) : (
              <>
                <TableWrap>
                  <thead><tr><Th>Ronda</Th><Th>Tiempo</Th><Th>Elem.</Th><Th>Total</Th></tr></thead>
                  <tbody>
                    {pts.map(p => (
                      <tr key={p.id}>
                        <Td>R{p.rondas?.numero_ronda ?? '?'}</Td>
                        <Td>{p.tiempo_seg?.toFixed(3)} s</Td>
                        <Td>{p.elementos_derribados ?? 0}</Td>
                        <Td style={{ fontWeight:600, color:'#c9a96e' }}>
                          {((p.tiempo_seg || 0) + (p.elementos_derribados || 0) * 5).toFixed(3)} s
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
                <div style={{ marginTop:8, fontSize:13, color:'#9ca3af' }}>
                  Mejor tiempo: <strong style={{ color:'#c9a96e' }}>
                    {Math.min(...pts.map(p => (p.tiempo_seg||0) + (p.elementos_derribados||0)*5)).toFixed(3)} s
                  </strong>
                </div>
              </>
            )}
          </Card>
        )
      })}
    </div>
  )
}
