import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  getCompeticiones, getRondas, getInscripciones,
  getPuntuacionesTiempo, upsertPuntuacionTiempo,
  getPuntuacionesTrail, upsertPuntuacionTrail,
} from '../lib/supabase'
import { S, Card, CardTitle, Badge, Spinner, Empty, Field, Confirm, SummaryBar, modalLabel } from '../components/ui'

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

  // Trail
  const inscActual  = inscripciones[trailIdx]
  const numObs      = compSel?.num_obstaculos ?? 6
  const tRef        = compSel?.tiempo_referencia ?? 130
  const suma        = Object.values(obsVals).reduce((s, v) => s + (v ?? 0), 0)
  const exceso      = Math.max(0, parseFloat(tReal || 0) - tRef)
  const pen         = Math.floor(exceso / 3)
  const total       = suma - pen
  const obsOk       = Object.keys(obsVals).length === numObs
  const prevTrail   = trailPunts.find(p => p.inscripcion_id === inscActual?.id)

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

      {compSel && (
        <div style={{ marginBottom:14 }}>
          <Badge type={compSel.modalidad}/>
        </div>
      )}

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
                {/* Nombre y estado */}
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
                {/* Inputs */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                  <div>
                    <div style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 }}>Tiempo (s)</div>
                    <input
                      style={{ ...S.fi, padding:'11px', fontSize:15, opacity: v.saved ? 0.6 : 1 }}
                      type="number" step="0.001" inputMode="decimal"
                      value={v.tiempo} placeholder="0.000"
                      readOnly={v.saved}
                      onChange={e => updatePunt(ins.id, 'tiempo', e.target.value)}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 }}>
                      {compSel.modalidad === 'barrel' ? 'Barriles' : 'Palos'}
                    </div>
                    <input
                      style={{ ...S.fi, padding:'11px', fontSize:15, opacity: v.saved ? 0.6 : 1 }}
                      type="number" step="1" min="0" inputMode="numeric"
                      value={v.elem}
                      readOnly={v.saved}
                      onChange={e => updatePunt(ins.id, 'elem', e.target.value)}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 }}>Total</div>
                    <div style={{ fontSize:18, fontWeight:600, color:'#c9a96e', padding:'11px 0' }}>{tot}</div>
                  </div>
                </div>
                {v.saved && (
                  <button
                    style={{ ...S.bs, fontSize:12, padding:'7px 12px', marginTop:10 }}
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
          {/* Mapa recorrido */}
          <Card style={{ marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <CardTitle style={{ margin:0 }}>Plano del recorrido</CardTitle>
              <Badge type="trail">60×40 m</Badge>
            </div>
            <div style={{ borderRadius:8, overflow:'hidden', border:'1px solid #2d3142' }}>
              <svg width="100%" viewBox="0 0 680 400" xmlns="http://www.w3.org/2000/svg">
                <style>{`.dim{fill:#c9a96e;font-family:sans-serif;font-size:11px}.ttl{fill:#f0ead6;font-family:sans-serif;font-size:12px;font-weight:500}.num{fill:#f0ead6;font-family:sans-serif;font-size:10px;font-weight:700}.lbl{fill:#1a1a0a;font-family:sans-serif;font-size:10px}`}</style>
                <defs>
                  <marker id="ai" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/></marker>
                  <marker id="ao" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/></marker>
                  <marker id="at" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="#f0ead6" strokeWidth="1.5" strokeLinecap="round"/></marker>
                  <marker id="ad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round"/></marker>
                </defs>
                <rect width="680" height="400" fill="#2a3520"/>
                <rect x="30" y="30" width="620" height="330" rx="4" fill="#3a5c30"/>
                <rect x="55" y="48" width="560" height="298" rx="2" fill="#c8a966"/>
                <line x1="55" y1="88" x2="615" y2="88" stroke="#b89850" strokeWidth=".5" opacity=".5"/>
                <line x1="55" y1="128" x2="615" y2="128" stroke="#b89850" strokeWidth=".5" opacity=".5"/>
                <line x1="55" y1="168" x2="615" y2="168" stroke="#b89850" strokeWidth=".5" opacity=".5"/>
                <line x1="55" y1="208" x2="615" y2="208" stroke="#b89850" strokeWidth=".5" opacity=".5"/>
                <line x1="55" y1="248" x2="615" y2="248" stroke="#b89850" strokeWidth=".5" opacity=".5"/>
                <line x1="55" y1="288" x2="615" y2="288" stroke="#b89850" strokeWidth=".5" opacity=".5"/>
                <line x1="148" y1="48" x2="148" y2="346" stroke="#b89850" strokeWidth=".5" opacity=".4"/>
                <line x1="241" y1="48" x2="241" y2="346" stroke="#b89850" strokeWidth=".5" opacity=".4"/>
                <line x1="334" y1="48" x2="334" y2="346" stroke="#b89850" strokeWidth=".5" opacity=".4"/>
                <line x1="427" y1="48" x2="427" y2="346" stroke="#b89850" strokeWidth=".5" opacity=".4"/>
                <line x1="520" y1="48" x2="520" y2="346" stroke="#b89850" strokeWidth=".5" opacity=".4"/>
                <rect x="55" y="48" width="560" height="298" rx="2" fill="none" stroke="#6b4c1a" strokeWidth="3.5"/>
                <rect x="55" y="155" width="22" height="30" fill="#2a1e0a" stroke="#4ade80" strokeWidth="1.5"/>
                <text x="66" y="175" textAnchor="middle" className="num" fontSize="8">ENT</text>
                <line x1="42" y1="170" x2="57" y2="170" stroke="#4ade80" strokeWidth="2" markerEnd="url(#ai)"/>
                <rect x="55" y="210" width="22" height="30" fill="#2a1e0a" stroke="#f87171" strokeWidth="1.5"/>
                <text x="66" y="230" textAnchor="middle" className="num" fontSize="8">SAL</text>
                <line x1="77" y1="225" x2="42" y2="225" stroke="#f87171" strokeWidth="2" markerEnd="url(#ao)"/>
                <polyline points="77,170 148,170 148,80 290,80 290,165 420,165 420,80 540,80 540,225 420,225 420,290 290,290 290,225 148,225 148,225 77,225" fill="none" stroke="#f0ead6" strokeWidth="2" strokeDasharray="8 5" opacity=".65" markerEnd="url(#at)"/>
                <rect x="130" y="136" width="38" height="18" rx="2" fill="#7c5c2a" stroke="#c9a96e" strokeWidth="1.5"/>
                <circle cx="124" cy="145" r="8" fill="#1e3a5f" stroke="#93c5fd" strokeWidth="1.5"/><text x="124" y="149" textAnchor="middle" className="num">1</text><text x="149" y="167" textAnchor="middle" className="lbl">Puente</text>
                <rect x="268" y="64" width="44" height="10" rx="2" fill="#8b5e2a" stroke="#c9a96e" strokeWidth="1.5"/>
                <circle cx="262" cy="69" r="8" fill="#1e3a5f" stroke="#93c5fd" strokeWidth="1.5"/><text x="262" y="73" textAnchor="middle" className="num">2</text><text x="290" y="95" textAnchor="middle" className="lbl">Valla</text>
                <circle cx="418" cy="156" r="8" fill="#1e3a5f" stroke="#93c5fd" strokeWidth="1.5"/><text x="418" y="160" textAnchor="middle" className="num">3</text><text x="418" y="198" textAnchor="middle" className="lbl">Serp.</text>
                <rect x="520" y="186" width="40" height="24" rx="2" fill="#d4aa60" stroke="#c9a96e" strokeWidth="1.5"/>
                <circle cx="515" cy="198" r="8" fill="#1e3a5f" stroke="#93c5fd" strokeWidth="1.5"/><text x="515" y="202" textAnchor="middle" className="num">4</text><text x="540" y="222" textAnchor="middle" className="lbl">Cajón</text>
                <circle cx="390" cy="263" r="8" fill="#1e3a5f" stroke="#93c5fd" strokeWidth="1.5"/><text x="390" y="267" textAnchor="middle" className="num">5</text><text x="426" y="290" textAnchor="middle" className="lbl">Compuerta</text>
                <circle cx="214" cy="258" r="8" fill="#1e3a5f" stroke="#93c5fd" strokeWidth="1.5"/><text x="214" y="262" textAnchor="middle" className="num">6</text><text x="241" y="294" textAnchor="middle" className="lbl">Barras L</text>
                <line x1="55" y1="368" x2="615" y2="368" stroke="#c9a96e" strokeWidth="1" markerStart="url(#ad)" markerEnd="url(#ad)"/>
                <text x="335" y="382" textAnchor="middle" className="dim">60 m</text>
                <rect x="55" y="10" width="560" height="22" rx="3" fill="#1a1a0a" opacity=".6"/>
                <text x="335" y="25" textAnchor="middle" className="ttl">Recorrido Trail — {compSel.num_obstaculos} obstáculos · 60×40 m</text>
              </svg>
            </div>
          </Card>

          {/* Grid trail: entrada + marcador */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:14 }}>
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

                {/* Obstáculos */}
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

                {/* Tiempos */}
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
        </div>
      )}

      {compSel && isTrail && inscripciones.length === 0 && (
        <Card><Empty msg="Sin inscritos en esta competición"/></Card>
      )}
    </div>
  )
}
