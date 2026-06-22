// CompetidorClasif.jsx
import { useState, useEffect } from 'react'
import { getCompeticiones, getResultados } from '../lib/supabase'
import { Card, Badge, Spinner, Empty, TableWrap, Th, Td, S } from '../components/ui'

const MEDAL = ['🥇','🥈','🥉']

export function CompetidorClasif() {
  const [comps, setComps]   = useState([])
  const [compId, setCompId] = useState('')
  const [compSel, setCompSel] = useState(null)
  const [res, setRes]       = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCompeticiones().then(({ data }) => setComps(data ?? []))
  }, [])

  const onComp = async (id) => {
    setCompId(id)
    setCompSel(comps.find(c => c.id === id) || null)
    if (!id) { setRes([]); return }
    setLoading(true)
    const { data } = await getResultados(id)
    setRes(data ?? [])
    setLoading(false)
  }

  const esDefinitiva = compSel?.estado === 'bloqueada' || compSel?.estado === 'finalizada'

  return (
    <div>
      <div style={{ marginBottom:16, paddingBottom:14, borderBottom:'1px solid #1e2130' }}>
        <h1 style={{ fontSize:19, fontWeight:600, color:'#f0ead6' }}>Clasificación</h1>
      </div>
      <div style={{ marginBottom:14 }}>
        <label style={S.fl}>Competición</label>
        <select style={S.fi} value={compId} onChange={e => onComp(e.target.value)}>
          <option value="">— Seleccionar —</option>
          {comps.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
      {compSel && (
        <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
          <Badge type={compSel.modalidad}/>
          <Badge type={esDefinitiva ? 'definitiva' : 'provisional'}>
            {esDefinitiva ? 'Clasificación definitiva' : 'Provisional'}
          </Badge>
        </div>
      )}
      {loading && <Spinner />}
      {!loading && compSel && res.length === 0 && <Card><Empty msg="Sin resultados aún"/></Card>}
      {!loading && res.length > 0 && (
        <Card>
          <TableWrap>
            <thead><tr><Th>Pos.</Th><Th>Competidor</Th><Th>Caballo</Th><Th>{compSel?.modalidad==='trail'?'Puntuación':'Tiempo'}</Th></tr></thead>
            <tbody>
              {res.map((r, i) => (
                <tr key={r.id} style={{ background: i===0 ? '#1a1500' : 'transparent' }}>
                  <Td>{i<3 ? <span style={{ fontSize:16 }}>{MEDAL[i]}</span> : <span style={{ color:'#6b7280' }}>{r.posicion_final}</span>}</Td>
                  <Td style={{ fontWeight: i===0 ? 600 : 400 }}>{r.inscripciones?.usuarios?.nombre} {r.inscripciones?.usuarios?.apellidos}</Td>
                  <Td style={{ color:'#9ca3af' }}>{r.inscripciones?.caballos?.nombre}</Td>
                  <Td style={{ fontWeight:600, color: i===0 ? '#c9a96e' : '#f0ead6' }}>
                    {compSel?.modalidad==='trail' ? `${r.puntuacion_total} pts` : `${r.mejor_tiempo?.toFixed(3)} s`}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </Card>
      )}
    </div>
  )
}

export default CompetidorClasif
