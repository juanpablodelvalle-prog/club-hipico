import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  getCompeticiones, getRondas, getInscripciones,
  getPuntuacionesTiempo, upsertPuntuacionTiempo,
  getPuntuacionesTrail, upsertPuntuacionTrail,
} from '../lib/supabase'
import { S, Card, CardTitle, Badge, Spinner, Empty, Field, Confirm, SummaryBar } from '../components/ui'
import MapaTrail from '../components/MapaTrail'

const SCORES = [-1, 0, 1, 2, 3]

export default function Puntuaciones() {
  const { perfil } = useAuth()
  const [comps, setComps]         = useState([])
  const [compId, setCompId]       = useState('')
  const [compSel, setCompSel]     = useState(null)
  const [rondas, setRondas]       = useState([])
  const [rondaId, setRondaId]     = useState('')
  const [inscripciones, setIns]   = useState([])
  const [punts, setPunts]         = useState({})
  const [confirm, setConfirm]     = useState(null)
  const [okMsg, setOkMsg]         = useState('')
  const [trailIdx, setTrailIdx]   = useState(0)
  const [obsVals, setObsVals]     = useState({})
  const [tReal, setTReal]         = useState('')
  const [trailPunts, setTrailPunts] = useState([])
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    getCompeticiones().then(({ data }) => setComps(data ?? []))
  }, [])

  const flash = (msg) => { setOkMsg(msg); setTimeout(() => setOkMsg(''), 3000) }

  const onComp = async (id) => {
    setCompId(id)
    const c = comps.find(x => x.id === id)
    setCompSel(c)
    setPunts({}); setObsVals({}); setTReal(''); setTrailIdx(0); setTrailPunts([])
    if (!id) { setRondas([]); setIns([]); return }
    const [{ data: r }, { data: i }] = await Promise.all([getRondas(id), getInscripciones(id)])
    setRondas(r ?? []); setRondaId(r?.[0]?.id ?? '')
    setIns(i ?? [])
    if (c?.modalidad !== 'trail' && r?.[0]?.id) cargarPunts(r[0].id, i ?? [])
    if (c?.modalidad === 'trail' && r?.[0]?.id) cargarTrail(r[0].id)
  }

  const onRonda = async (rid) => {
    setRondaId(rid)
    if (compSel?.modalidad !== 'trail') cargarPunts(rid, inscripciones)
    else cargarTrail(rid)
  }

  const cargarPunts = async (rid, ins) => {
    const { data } = await getPuntuacionesTiempo(rid)
    const map = {}
    ins.forEach(i => {
      const p = data?.find(x => x.inscripcion_id === i.id)
      map[i.id] = p
        ? { tiempo: p.tiempo_seg, elem: p.elementos_derribados, saved: true }
        : { tiempo: '', elem: 0, saved: false }
    })
    setPunts(map)
  }

  const cargarTrail = async (rid) => {
    const { data } = await getPuntuacionesTrail(rid)
    setTrailPunts(data ?? [])
  }

  const updatePunt = (iid, field, val) => {
    const prev = punts[iid]
    if (prev?.saved) {
      setConfirm({
        msg: `Ya hay una puntuación guardada. ¿Deseas modificarla?`,
        cb: () => {
          setPunts(p => ({ ...p, [iid]: { ...p[iid], saved: false, [field]: val } }))
          setConfirm(null)
        }
      })
    } else {
      setPunts(p => ({ ...p, [iid]: { ...p[iid], [field]: val } }))
    }
  }

  const guardarTiempo = async () => {
    setGuardando(true)
    let count = 0
    for (const [iid, v] of Object.entries(punts)) {
      if (!v.tiempo || v.saved) continue
      await upsertPuntuacionTiempo({
        ronda_id: rondaId,
        inscripcion_id: iid,
        tiempo_seg: parseFloat(v.tiempo),
        elementos_derribados: parseInt(v.elem) || 0,
        juez_id: perfil?.id,
      })
      count++
    }
    await cargarPunts(rondaId, inscripciones)
    setGuardando(false)
    flash(`${count} puntuación(es) guardada(s) ✓`)
  }

  const inscActual = inscripciones[trailIdx]
  const numObs     = compSel?.num_obstaculos ?? 6
  const tRef       = compSel?.tiempo_referencia ?? 130
  const suma       = Object.values(obsVals).reduce((s, v) => s + (v ?? 0), 0)
  const exceso     = Math.max(0, parseFloat(tReal || 0) - tRef)
  const pen        = Math.floor(exceso / 3)
  const total      = suma - pen
  const obsOk      = Object.keys(obsVals).length === numObs
  const prevTrail  = trailPunts.find(p => p.inscripcion_id === inscActual?.id)

  const guardarTrail = async () => {
    if (!obsOk || !tReal || !inscActual) return
    const doSave = async () => {
      setGuardando(true)
      const obs = Array.from({ length: numObs }, (_, i) => ({ numero: i + 1, puntuacion: obsVals[i + 1] }))
      await upsertPuntuacionTrail({
        ronda_id: rondaId,
        inscripcion_id: inscActual.id,
        tiempo_real_seg: parseFloat(tReal),
        tiempo_referencia: tRef,
        obstaculos: obs,
        juez_id: perfil?.id,
      })
      await cargarTrail(rondaId)
      setObsVals({}); setTReal('')
      if (trailIdx < inscripciones.length - 1) setTrailIdx(i => i + 1)
      setGuardando(false)
      flash('Guardado ✓')
    }
    if (prevTrail) {
      setConfirm({
        msg: `Ya existe puntuación para ${inscActual.usuarios?.nombre} — ${inscActual.caballos?.nombre}. ¿Modificar?`,
        cb: () => { setConfirm(null); doSave() }
      })
    } else doSave()
  }

  const isTrail = compSel?.modalidad === 'trail'

  return (
    <div>
      <Confirm open={!!confirm} msg={confirm?.msg} onOk={confirm?.cb} onCancel={() => setConfirm(null)}/>

      <div style={{ marginBottom:16, paddingBottom:14, borderBottom:'1px solid #1e2130' }}>
        <h1 style={{ fontSize:19, fontWeight:600, color:'#f0ead6' }}>Puntuaciones</h1>
      </div>

      {/* Selectores */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        <Field label="Competición" style={{ margin:0 }}>
          <select style={S.fi} value={compId} onChange={e => onComp(e.target.value)}>
            <option value="">— Seleccionar —</option>
            {comps.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </Field>
        <Field label="Ronda" style={{ margin:0 }}>
          <select style={S.fi} value={rondaId} onChange={e => onRonda(e.target.value)} disabled={!rondas.length}>
            {rondas.length === 0
              ? <option>Sin rondas</option>
              : rondas.map(r => <option key={r.id} value={r.id}>Ronda {r.numero_ronda} — {r.estado}</option>)
            }
          </select>
        </Field>
      </div>

      {!compSel && <Card><Empty msg="Selecciona una competición para empezar"/></Card>}

      {compSel && <div style={{ marginBottom:14 }}><Badge type={compSel.modalidad}/></div>}

      {/* ── BARREL / POLE ── */}
      {compSel && !isTrail && (
        <Card>
          <CardTitle>
            {compSel.modalidad === 'barrel' ? 'Barrel Racing · +5 s por barril derribado' : 'Pole Bending · +5 s por palo derribado'}
          </CardTitle>
          {inscripciones.length === 0 && <Empty msg="Sin inscritos en esta competición"/>}
          {inscripciones.map(ins => {
            const v = punts[ins.id] || { tiempo: '', elem: 0, saved: false }
            const tot = v.tiempo ? (parseFloat(v.tiempo) + (parseInt(v.elem)||0) * 5).toFixed(3) : '—'
            return (
              <div key={ins.id} style={{ padding:'14px 0', borderBottom:'1px solid #1e2130' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:8 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, color:'#f0ead6' }}>
                      {ins.usuarios?.nombre} {ins.usuarios?.apellidos}
                    </div>
                    <div style={{ fontSize:11, color:'#6b7280' }}>
                      🐴 {ins.caballos?.nombre}{ins.dorsal ? ` · Dorsal #${ins.dorsal}` : ''}
                    </div>
                  </div>
                  {v.saved && (
                    <span style={{ fontSize:10, padding:'3px 8px', borderRadius:20, background:'#2a1e0a', color:'#fbbf24', fontWeight:500 }}>
                      ✓ Registrado
                    </span>
                  )}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                  <div>
                    <div style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 }}>Tiempo (s)</div>
                    <input style={{ ...S.fi, padding:'11px', fontSize:15, opacity: v.saved ? 0.6 : 1 }}
                      type="number" step="0.001" inputMode="decimal"
                      value={v.tiempo} placeholder="0.000" readOnly={v.saved}
                      onChange={e => updatePunt(ins.id, 'tiempo', e.target.value)}/>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 }}>
                      {compSel.modalidad === 'barrel' ? 'Barriles' : 'Palos'}
                    </div>
                    <input style={{ ...S.fi, padding:'11px', fontSize:15, opacity: v.saved ? 0.6 : 1 }}
                      type="number" step="1" min="0" inputMode="numeric"
                      value={v.elem} readOnly={v.saved}
                      onChange={e => updatePunt(ins.id, 'elem', e.target.value)}/>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 }}>Total</div>
                    <div style={{ fontSize:18, fontWeight:600, color:'#c9a96e', padding:'11px 0' }}>{tot}</div>
                  </div>
                </div>
                {v.saved && (
                  <button style={{ ...S.bs, fontSize:12, padding:'7px 12px', marginTop:10 }}
                    onClick={() => setConfirm({
                      msg: `¿Modificar la puntuación de ${ins.usuarios?.nombre} — ${ins.caballos?.nombre}?`,
                      cb: () => { setPunts(p => ({ ...p, [ins.id]: { ...p[ins.id], saved: false } })); setConfirm(null) }
                    })}>
                    ✏️ Modificar
                  </button>
                )}
              </div>
            )
          })}
          {inscripciones.length > 0 && (
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', alignItems:'center', marginTop:16 }}>
              {okMsg && <span style={{ fontSize:12, color:'#4ade80' }}>{okMsg}</span>}
              <button style={{ ...S.bp, opacity: guardando ? 0.7 : 1 }} onClick={guardarTiempo} disabled={guardando}>
                {guardando ? 'Guardando…' : 'Guardar puntuaciones'}
              </button>
            </div>
          )}
        </Card>
      )}

      {/* ── TRAIL ── */}
      {compSel && isTrail && inscripciones.length > 0 && (
        <div>
          {/* Mapa dinámico según numObs */}
          <Card style={{ marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <CardTitle style={{ margin:0 }}>Plano del recorrido</CardTitle>
              <Badge type="trail">{numObs} obstáculos · 60×40 m</Badge>
            </div>
            <MapaTrail numObs={numObs} titulo={compSel.nombre}/>
          </Card>

          {/* Grid trail */}
          <style>{`@media(min-width:768px){.trail-grid{grid-template-columns:1fr 1fr!important}}`}</style>
          <div className="trail-grid" style={{ display:'grid', gridTemplateColumns:'1fr', gap:14 }}>

            {/* Panel entrada */}
            <Card>
              <Field label="Competidor activo">
                <select style={S.fi} value={trailIdx} onChange={e => { setTrailIdx(+e.target.value); setObsVals({}); setTReal('') }}>
                  {inscripciones.map((ins, i) => (
                    <option key={ins.id} value={i}>
                      {ins.dorsal ? `#${ins.dorsal} ` : ''}{ins.usuarios?.nombre} {ins.usuarios?.apellidos} — {ins.caballos?.nombre}
                      {trailPunts.find(p => p.inscripcion_id === ins.id) ? ' ✓' : ''}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Obstáculos dinámicos */}
              <div style={{ marginBottom:14 }}>
                {Array.from({ length: numObs }, (_, i) => i + 1).map(n => (
                  <div key={n} style={{ display:'flex', alignItems:'center', padding:'9px 0', borderBottom:'1px solid #1e2130', gap:8 }}>
                    <span style={{ fontSize:12, color:'#9ca3af', width:90, flexShrink:0 }}>Obstáculo {n}</span>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      {SCORES.map(s => (
                        <button key={s} onClick={() => setObsVals(p => ({ ...p, [n]: s }))}
                          style={{
                            width:44, height:40, borderRadius:7, border:'none', cursor:'pointer',
                            fontSize:14, fontWeight:600, fontFamily:'inherit', touchAction:'manipulation',
                            background: obsVals[n] === s
                              ? (s<0?'#7f1d1d':s===0?'#374151':s===1?'#14532d':s===2?'#1e3a5f':'#3b1d6e')
                              : '#1c1f2a',
                            color: obsVals[n] === s
                              ? (s<0?'#fca5a5':s===0?'#d1d5db':s===1?'#86efac':s===2?'#93c5fd':'#c4b5fd')
                              : '#6b7280',
                          }}>
                          {s < 0 ? '−1' : s}
                        </button>
                      ))}
                    </div>
                    <span style={{ marginLeft:'auto', fontSize:12, color: obsVals[n] !== undefined ? '#4ade80' : '#374151' }}>
                      {obsVals[n] !== undefined ? '✓' : ''}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:4 }}>
                <Field label="Tiempo real (s)" style={{ margin:0 }}>
                  <input style={S.fi} type="number" step="0.01" inputMode="decimal" value={tReal} onChange={e => setTReal(e.target.value)} placeholder="0.00"/>
                </Field>
                <Field label="Ref. (s)" style={{ margin:0 }}>
                  <input style={{ ...S.fi, opacity:.5 }} type="number" value={tRef} readOnly/>
                </Field>
              </div>

              <SummaryBar suma={obsOk ? suma : '—'} pen={tReal ? pen : '—'} total={obsOk && tReal ? total : '—'}/>

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', alignItems:'center' }}>
                {okMsg && <span style={{ fontSize:12, color:'#4ade80' }}>{okMsg}</span>}
                <button
                  style={{ ...S.bp, opacity: (!obsOk || !tReal || guardando) ? 0.45 : 1 }}
                  disabled={!obsOk || !tReal || guardando}
                  onClick={guardarTrail}>
                  {guardando ? 'Guardando…' : 'Guardar y siguiente'}
                </button>
              </div>
            </Card>

            {/* Marcador */}
            <Card>
              <CardTitle>Marcador</CardTitle>
              {trailPunts.length === 0
                ? <Empty msg="Sin puntuaciones aún"/>
                : [...trailPunts].sort((a,b) => b.puntuacion_final - a.puntuacion_final).map((p, i) => (
                  <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid #1e2130', fontSize:13 }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, flexShrink:0, background: i===0?'#2a1e0a':i===1?'#1e2130':'#1a1a1a', color: i===0?'#fbbf24':i===1?'#9ca3af':'#6b7280' }}>{i+1}</span>
                      <div>
                        <div style={{ color:'#f0ead6' }}>{p.inscripciones?.usuarios?.nombre} {p.inscripciones?.usuarios?.apellidos}</div>
                        <div style={{ fontSize:11, color:'#6b7280' }}>🐴 {p.inscripciones?.caballos?.nombre}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontWeight:600, color:'#c9a96e' }}>{p.puntuacion_final}</div>
                      <div style={{ fontSize:10, color:'#6b7280' }}>obs:{p.suma_obstaculos} pen:{p.penalizacion_tiempo}</div>
                    </div>
                  </div>
                ))
              }
            </Card>
          </div>
        </div>
      )}

      {compSel && isTrail && inscripciones.length === 0 && (
        <Card><Empty msg="Sin inscritos en esta competición"/></Card>
      )}
    </div>
  )
}
