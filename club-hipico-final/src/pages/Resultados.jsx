import { useState, useEffect } from 'react'
import { getCompeticiones, getResultados, generarResultados } from '../lib/supabase'
import { Card, Badge, Spinner, Empty, TableWrap, Th, Td, S } from '../components/ui'
import { useAuth } from '../hooks/useAuth'

const MEDAL = ['🥇','🥈','🥉']

export default function Resultados() {
  const { esAdmin } = useAuth()
  const [comps, setComps]       = useState([])
  const [compId, setCompId]     = useState('')
  const [compSel, setCompSel]   = useState(null)
  const [resultados, setResultados] = useState([])
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState('')

  useEffect(() => {
    getCompeticiones().then(({ data }) => setComps(data ?? []))
  }, [])

  const cargar = async (id) => {
    setLoading(true)
    const { data } = await getResultados(id)
    setResultados(data ?? [])
    setLoading(false)
  }

  const onComp = (id) => {
    setCompId(id)
    const c = comps.find(x => x.id === id)
    setCompSel(c)
    if (id) cargar(id)
    else setResultados([])
  }

  const handleGenerar = async () => {
    setLoading(true)
    await generarResultados(compId, compSel.modalidad)
    await cargar(compId)
    setMsg('Clasificación actualizada ✓')
    setTimeout(() => setMsg(''), 3000)
  }

  const esDefinitiva = compSel?.estado === 'bloqueada' || compSel?.estado === 'finalizada'

  return (
    <div>
      <div style={{ marginBottom:16, paddingBottom:14, borderBottom:'1px solid #1e2130' }}>
        <h1 style={{ fontSize:19, fontWeight:600, color:'#f0ead6' }}>Resultados</h1>
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={S.fl}>Competición</label>
        <select className="fi" style={S.fi} value={compId} onChange={e => onComp(e.target.value)}>
          <option value="">— Seleccionar —</option>
          {comps.map(c => <option key={c.id} value={c.id}>{c.nombre} · {c.fecha}</option>)}
        </select>
      </div>

      {compSel && (
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:16, flexWrap:'wrap' }}>
          <Badge type={compSel.modalidad}/>
          <Badge type={esDefinitiva ? 'definitiva' : 'provisional'}>{esDefinitiva ? 'Clasificación definitiva' : 'Provisional'}</Badge>
          {esAdmin && (
            <>
              <button style={{ ...S.bs, fontSize:12, padding:'7px 12px' }} onClick={handleGenerar}>
                ↻ Recalcular
              </button>
              {msg && <span style={{ fontSize:12, color:'#4ade80' }}>{msg}</span>}
            </>
          )}
        </div>
      )}

      {loading && <Spinner />}

      {!loading && compSel && resultados.length === 0 && (
        <Card><Empty msg="Sin resultados aún. Usa 'Recalcular' tras registrar puntuaciones."/></Card>
      )}

      {!loading && resultados.length > 0 && (
        <Card>
          <TableWrap>
            <thead>
              <tr>
                <Th>Pos.</Th>
                <Th>Competidor</Th>
                <Th>Caballo</Th>
                <Th>{compSel?.modalidad === 'trail' ? 'Puntuación' : 'Mejor tiempo'}</Th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((r, i) => (
                <tr key={r.id} style={{ background: i === 0 ? '#1a1500' : 'transparent' }}>
                  <Td>
                    {i < 3
                      ? <span style={{ fontSize:16 }}>{MEDAL[i]}</span>
                      : <span style={{ color:'#6b7280' }}>{r.posicion_final}</span>
                    }
                  </Td>
                  <Td style={{ fontWeight: i === 0 ? 600 : 400 }}>
                    {r.inscripciones?.usuarios?.nombre} {r.inscripciones?.usuarios?.apellidos}
                  </Td>
                  <Td style={{ color:'#9ca3af' }}>{r.inscripciones?.caballos?.nombre}</Td>
                  <Td style={{ fontWeight:600, color: i === 0 ? '#c9a96e' : '#f0ead6' }}>
                    {compSel?.modalidad === 'trail'
                      ? `${r.puntuacion_total} pts`
                      : `${r.mejor_tiempo?.toFixed(3)} s`
                    }
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <div style={{ marginTop:10, fontSize:11, color:'#6b7280' }}>
            {compSel?.modalidad === 'trail'
              ? 'Mayor puntuación gana · Penalización de tiempo incluida'
              : 'Menor tiempo gana · +5 s por elemento derribado'
            }
          </div>
        </Card>
      )}
    </div>
  )
}
