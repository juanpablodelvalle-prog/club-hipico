import { useState, useEffect } from 'react'
import { getCompeticiones, getResultados, getUsuarios, supabase } from '../lib/supabase'
import { Card, CardTitle, Badge, Spinner, Empty, TableWrap, Th, Td, S } from '../components/ui'

const MEDAL = ['🥇','🥈','🥉']
const MODALIDADES = ['barrel', 'pole_bending', 'trail']

export default function Panel() {
  const [comps, setComps]         = useState([])
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [resultados, setResultados] = useState({}) // { modalidad: [resultados] }
  const [selComp, setSelComp]     = useState({})   // { modalidad: compId }
  const [loadingRes, setLoadingRes] = useState({})

  useEffect(() => {
    Promise.all([
      getCompeticiones().then(({ data }) => setComps(data ?? [])),
      getUsuarios().then(({ data }) => setUsers(data ?? [])),
    ]).finally(() => setLoading(false))
  }, [])

  // Cuando cargan las competiciones, inicializar selección con la última de cada modalidad
  useEffect(() => {
    if (!comps.length) return
    const inicialesId = {}
    MODALIDADES.forEach(m => {
      const finalizadas = comps
        .filter(c => c.modalidad === m && (c.estado === 'finalizada' || c.estado === 'bloqueada'))
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      if (finalizadas.length) inicialesId[m] = finalizadas[0].id
    })
    setSelComp(inicialesId)
  }, [comps])

  // Cargar resultados cuando cambia la selección
  useEffect(() => {
    Object.entries(selComp).forEach(([modalidad, compId]) => {
      if (!compId) return
      setLoadingRes(p => ({ ...p, [modalidad]: true }))
      getResultados(compId).then(({ data }) => {
        setResultados(p => ({ ...p, [modalidad]: data ?? [] }))
        setLoadingRes(p => ({ ...p, [modalidad]: false }))
      })
    })
  }, [selComp])

  if (loading) return <Spinner />

  const competidores = users.filter(u => u.rol === 'competidor').length
  const enCurso      = comps.filter(c => c.estado === 'en_curso').length
  const caballos     = users.reduce((s, u) => s + (u.caballos?.length || 0), 0)

  // Competiciones por modalidad finalizadas o bloqueadas
  const compsPorModalidad = (m) =>
    comps
      .filter(c => c.modalidad === m && (c.estado === 'finalizada' || c.estado === 'bloqueada'))
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  const labelModalidad = { barrel:'Barrel Racing', pole_bending:'Pole Bending', trail:'Trail' }

  return (
    <div>
      <div style={{ marginBottom:16, paddingBottom:14, borderBottom:'1px solid #1e2130' }}>
        <h1 style={{ fontSize:19, fontWeight:600, color:'#f0ead6' }}>Panel</h1>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:16 }}>
        {[
          ['Competidores', competidores],
          ['Competiciones', comps.length],
          ['En curso', enCurso],
          ['Caballos', caballos],
        ].map(([l, v]) => (
          <div key={l} style={{ background:'#161820', border:'1px solid #1e2130', borderRadius:10, padding:'12px 14px' }}>
            <div style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:24, fontWeight:600, color:'#f0ead6' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Competiciones activas */}
      <Card>
        <CardTitle>Competiciones activas</CardTitle>
        <TableWrap>
          <thead><tr><Th>Nombre</Th><Th>Modalidad</Th><Th>Fecha</Th><Th>Estado</Th></tr></thead>
          <tbody>
            {comps.filter(c => c.estado !== 'finalizada' && c.estado !== 'bloqueada').map(c => (
              <tr key={c.id}>
                <Td style={{ fontWeight:500 }}>{c.nombre}</Td>
                <Td><Badge type={c.modalidad}/></Td>
                <Td style={{ color:'#9ca3af' }}>{c.fecha}</Td>
                <Td><Badge type={c.estado}/></Td>
              </tr>
            ))}
            {!comps.filter(c => c.estado !== 'finalizada' && c.estado !== 'bloqueada').length &&
              <tr><Td colSpan={4} style={{ color:'#6b7280' }}>Sin competiciones activas</Td></tr>
            }
          </tbody>
        </TableWrap>
      </Card>

      {/* Resultados por disciplina */}
      <div style={{ marginBottom:8, marginTop:4 }}>
        <h2 style={{ fontSize:15, fontWeight:600, color:'#f0ead6' }}>Resultados por disciplina</h2>
      </div>

      {MODALIDADES.map(m => {
        const finalizadas = compsPorModalidad(m)
        if (!finalizadas.length) return (
          <Card key={m}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <Badge type={m}/>
            </div>
            <Empty msg="Sin competiciones finalizadas en esta disciplina"/>
          </Card>
        )

        const compIdSel = selComp[m] || finalizadas[0]?.id
        const compSelObj = finalizadas.find(c => c.id === compIdSel)
        const res = resultados[m] || []
        const esDefinitiva = compSelObj?.estado === 'bloqueada' || compSelObj?.estado === 'finalizada'

        return (
          <Card key={m} style={{ marginBottom:14 }}>
            {/* Cabecera con selector */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10, marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <Badge type={m}/>
                {esDefinitiva && <Badge type="definitiva">Clasificación definitiva</Badge>}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:4, minWidth:200 }}>
                <label style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.04em' }}>
                  Seleccionar competición
                </label>
                <select
                  style={{ ...S.fi, fontSize:12, padding:'7px 10px' }}
                  value={compIdSel}
                  onChange={e => setSelComp(p => ({ ...p, [m]: e.target.value }))}>
                  {finalizadas.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} · {c.fecha}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingRes[m] && <div style={{ color:'#6b7280', fontSize:13 }}>Cargando…</div>}

            {!loadingRes[m] && res.length === 0 && (
              <Empty msg="Sin resultados calculados aún para esta competición"/>
            )}

            {!loadingRes[m] && res.length > 0 && (
              <>
                <TableWrap>
                  <thead>
                    <tr>
                      <Th>Pos.</Th>
                      <Th>Competidor</Th>
                      <Th>Caballo</Th>
                      <Th>{m === 'trail' ? 'Puntuación' : 'Mejor tiempo'}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {res.map((r, i) => (
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
                          {m === 'trail'
                            ? `${r.puntuacion_total} pts`
                            : `${r.mejor_tiempo?.toFixed(3)} s`
                          }
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
                <div style={{ marginTop:8, fontSize:11, color:'#6b7280' }}>
                  {m === 'trail'
                    ? 'Mayor puntuación gana · Penalización de tiempo incluida'
                    : 'Menor tiempo gana · +5 s por elemento derribado'
                  }
                </div>
              </>
            )}
          </Card>
        )
      })}
    </div>
  )
}
