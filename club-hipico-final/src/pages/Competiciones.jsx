import { useState, useEffect } from 'react'
import {
  getCompeticiones, crearCompeticion, actualizarCompeticion,
  getRondas, crearRonda, actualizarRonda,
  getInscripciones, crearInscripcion, eliminarInscripcion,
  getUsuarios, supabase
} from '../lib/supabase'
import { S, Badge, Card, CardTitle, Field, Row, Spinner, Empty, BtnRow, Grid2, modalLabel } from '../components/ui'

export default function Competiciones() {
  const [comps, setComps]           = useState([])
  const [selId, setSelId]           = useState(null)
  const [rondas, setRondas]         = useState([])
  const [inscripciones, setInscrips] = useState([])
  const [usuarios, setUsuarios]     = useState([])
  const [caballos, setCaballos]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editId, setEditId]         = useState(null)
  const [ok, setOk]                 = useState('')
  const [guardando, setGuardando]   = useState(false)
  const [showIns, setShowIns]       = useState(false)

  const [form, setForm] = useState({ nombre:'', modalidad:'barrel', fecha:'', lugar:'', max_participantes:20, num_obstaculos:6, tiempo_referencia:130 })
  const [formI, setFormI] = useState({ usuario_id:'', caballo_id:'', dorsal:'' })

  const flash = (msg) => { setOk(msg); setTimeout(() => setOk(''), 3000) }

  const cargar = async () => {
    setLoading(true)
    const [{ data: c }, { data: u }, { data: cab }] = await Promise.all([
      getCompeticiones(),
      getUsuarios(),
      supabase.from('caballos').select('*'),
    ])
    setComps(c ?? [])
    setUsuarios(u ?? [])
    setCaballos(cab ?? [])
    setLoading(false)
  }
  useEffect(() => { cargar() }, [])

  const selComp = async (id) => {
    setSelId(id)
    const [{ data: r }, { data: i }] = await Promise.all([getRondas(id), getInscripciones(id)])
    setRondas(r ?? [])
    setInscrips(i ?? [])
    setTimeout(() => document.getElementById('det-cp')?.scrollIntoView({ behavior:'smooth', block:'start' }), 100)
  }

  const compSel = comps.find(c => c.id === selId)
  const bloq = compSel?.estado === 'bloqueada' || compSel?.estado === 'finalizada'

  const abrirNueva = () => {
    setEditId(null)
    setForm({ nombre:'', modalidad:'barrel', fecha:'', lugar:'', max_participantes:20, num_obstaculos:6, tiempo_referencia:130 })
    setShowForm(true)
  }

  const abrirEditar = () => {
    if (!compSel) return
    setEditId(compSel.id)
    setForm({ nombre:compSel.nombre, modalidad:compSel.modalidad, fecha:compSel.fecha, lugar:compSel.lugar||'', max_participantes:compSel.max_participantes, num_obstaculos:compSel.num_obstaculos||6, tiempo_referencia:compSel.tiempo_referencia||130 })
    setShowForm(true)
  }

  const guardarComp = async () => {
    if (!form.nombre) return
    setGuardando(true)
    const datos = {
      nombre: form.nombre, modalidad: form.modalidad, fecha: form.fecha,
      lugar: form.lugar, max_participantes: parseInt(form.max_participantes)||20,
      num_obstaculos: form.modalidad==='trail' ? parseInt(form.num_obstaculos) : null,
      tiempo_referencia: form.modalidad==='trail' ? parseFloat(form.tiempo_referencia) : null,
    }
    if (editId) await actualizarCompeticion(editId, datos)
    else await crearCompeticion(datos)
    await cargar()
    setShowForm(false)
    flash(editId ? 'Competición actualizada ✓' : 'Competición creada ✓')
    setGuardando(false)
  }

  const cambiarEstado = async (estado) => {
    if (estado === 'bloqueada' && !confirm('¿Bloquear? Ya no se podrán añadir ni eliminar participantes.')) return
    await actualizarCompeticion(selId, { estado })
    await cargar()
    selComp(selId)
    flash('Estado actualizado ✓')
  }

  const addRon = async () => {
    const n = rondas.length + 1
    await crearRonda({ competicion_id: selId, numero_ronda: n })
    const { data: r } = await getRondas(selId)
    setRondas(r ?? [])
  }

  const cambiarEstRon = async (id, estado) => {
    await actualizarRonda(id, { estado })
    setRondas(p => p.map(r => r.id===id ? {...r, estado} : r))
  }

  const cabsDisponibles = () => {
    if (!formI.usuario_id) return []
    const yaIns = inscripciones.filter(i => i.usuario_id === formI.usuario_id).map(i => i.caballo_id)
    return caballos.filter(c => c.propietario_id === formI.usuario_id && !yaIns.includes(c.id))
  }

  const inscribir = async () => {
    if (!formI.usuario_id || !formI.caballo_id) return
    const yaIns = inscripciones.filter(i => i.usuario_id === formI.usuario_id).length
    if (yaIns >= 3) { alert('Máximo 3 caballos por competidor en una competición'); return }
    setGuardando(true)
    await crearInscripcion({ competicion_id: selId, usuario_id: formI.usuario_id, caballo_id: formI.caballo_id, dorsal: formI.dorsal ? parseInt(formI.dorsal) : null })
    const { data: i } = await getInscripciones(selId)
    setInscrips(i ?? [])
    setShowIns(false)
    setFormI({ usuario_id:'', caballo_id:'', dorsal:'' })
    flash('Inscrito ✓')
    setGuardando(false)
  }

  const eliminarIns = async (id) => {
    if (!confirm('¿Eliminar esta inscripción?')) return
    await eliminarInscripcion(id)
    setInscrips(p => p.filter(i => i.id !== id))
    flash('Inscripción eliminada')
  }

  if (loading) return <Spinner />

  return (
    <div>
      {/* Modal form competición */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:'#161820', borderRadius:'16px 16px 0 0', padding:'12px 16px 36px', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ width:36, height:4, background:'#2d3142', borderRadius:2, margin:'0 auto 16px' }}/>
            <h3 style={{ fontSize:18, fontWeight:600, color:'#f0ead6', marginBottom:18 }}>{editId ? 'Editar competición' : 'Nueva competición'}</h3>
            <Field label="Nombre"><input style={S.fi} value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} placeholder="Nombre"/></Field>
            <Grid2>
              <Field label="Modalidad">
                <select style={S.fi} value={form.modalidad} onChange={e=>setForm(p=>({...p,modalidad:e.target.value}))}>
                  <option value="barrel">Barrel Racing</option>
                  <option value="pole_bending">Pole Bending</option>
                  <option value="trail">Trail</option>
                </select>
              </Field>
              <Field label="Fecha"><input style={S.fi} type="date" value={form.fecha} onChange={e=>setForm(p=>({...p,fecha:e.target.value}))}/></Field>
            </Grid2>
            <Field label="Lugar"><input style={S.fi} value={form.lugar} onChange={e=>setForm(p=>({...p,lugar:e.target.value}))} placeholder="Ciudad"/></Field>
            <Field label="Máx. participantes"><input style={S.fi} type="number" inputMode="numeric" value={form.max_participantes} onChange={e=>setForm(p=>({...p,max_participantes:e.target.value}))}/></Field>
            {form.modalidad === 'trail' && (
              <Grid2>
                <Field label="Nº obstáculos"><input style={S.fi} type="number" inputMode="numeric" value={form.num_obstaculos} min={1} max={20} onChange={e=>setForm(p=>({...p,num_obstaculos:e.target.value}))}/></Field>
                <Field label="Tiempo ref. (s)"><input style={S.fi} type="number" step="0.1" inputMode="decimal" value={form.tiempo_referencia} onChange={e=>setForm(p=>({...p,tiempo_referencia:e.target.value}))}/></Field>
              </Grid2>
            )}
            <BtnRow>
              <button style={S.bs} onClick={() => setShowForm(false)}>Cancelar</button>
              <button style={{ ...S.bp, opacity: guardando ? 0.7 : 1 }} onClick={guardarComp} disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
            </BtnRow>
          </div>
        </div>
      )}

      {/* Modal inscripción */}
      {showIns && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:'#161820', borderRadius:'16px 16px 0 0', padding:'12px 16px 36px', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ width:36, height:4, background:'#2d3142', borderRadius:2, margin:'0 auto 16px' }}/>
            <h3 style={{ fontSize:18, fontWeight:600, color:'#f0ead6', marginBottom:18 }}>Inscribir competidor</h3>
            <Field label="Competidor">
              <select style={S.fi} value={formI.usuario_id} onChange={e=>setFormI(p=>({...p,usuario_id:e.target.value,caballo_id:''}))}>
                <option value="">— Seleccionar —</option>
                {usuarios.filter(u=>u.rol==='competidor').map(u=><option key={u.id} value={u.id}>{u.nombre} {u.apellidos}</option>)}
              </select>
            </Field>
            <Field label="Caballo">
              <select style={S.fi} value={formI.caballo_id} onChange={e=>setFormI(p=>({...p,caballo_id:e.target.value}))}>
                <option value="">— Seleccionar —</option>
                {cabsDisponibles().map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Field>
            <Field label="Dorsal (opcional)"><input style={S.fi} type="number" inputMode="numeric" value={formI.dorsal} onChange={e=>setFormI(p=>({...p,dorsal:e.target.value}))}/></Field>
            <BtnRow>
              <button style={S.bs} onClick={() => setShowIns(false)}>Cancelar</button>
              <button style={{ ...S.bp, opacity:(!formI.usuario_id||!formI.caballo_id)?0.45:1 }} onClick={inscribir} disabled={!formI.usuario_id||!formI.caballo_id||guardando}>Inscribir</button>
            </BtnRow>
          </div>
        </div>
      )}

      {/* Cabecera */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, paddingBottom:14, borderBottom:'1px solid #1e2130', flexWrap:'wrap', gap:10 }}>
        <h1 style={{ fontSize:19, fontWeight:600, color:'#f0ead6' }}>Competiciones</h1>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {ok && <span style={{ fontSize:12, color:'#4ade80' }}>{ok}</span>}
          <button style={S.bp} onClick={abrirNueva}>+ Nueva</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns: selId ? '220px 1fr' : '1fr', gap:14 }}>
        {/* Lista */}
        <div>
          {comps.map(c => (
            <div key={c.id} onClick={() => selComp(c.id)}
              style={{ background: selId===c.id ? '#1a1c28' : '#161820', border:`1.5px solid ${selId===c.id?'#c9a96e50':'#1e2130'}`, borderRadius:10, padding:'12px 14px', marginBottom:8, cursor:'pointer' }}>
              <div style={{ fontSize:14, fontWeight:500, color:'#f0ead6', marginBottom:3 }}>{c.nombre}</div>
              <div style={{ fontSize:12, color:'#6b7280', marginBottom:7 }}>{modalLabel(c.modalidad)} · {c.fecha}</div>
              <Badge type={c.estado}/>
            </div>
          ))}
          {!comps.length && <div style={{ color:'#6b7280', fontSize:13, padding:'10px 0' }}>Sin competiciones</div>}
        </div>

        {/* Detalle */}
        {compSel && (
          <div id="det-cp">
            <Card>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8, marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:17, fontWeight:600, color:'#f0ead6', marginBottom:3 }}>{compSel.nombre}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>{compSel.fecha}{compSel.lugar ? ' · '+compSel.lugar : ''}</div>
                </div>
                <select style={{ ...S.fi, width:'auto', fontSize:13, padding:'8px 30px 8px 10px' }} value={compSel.estado} onChange={e => cambiarEstado(e.target.value)}>
                  {['borrador','abierta','en_curso','finalizada','bloqueada'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Badge type={compSel.modalidad}/>
              {compSel.modalidad === 'trail' && (
                <div style={{ display:'flex', gap:16, fontSize:12, color:'#9ca3af', marginTop:10 }}>
                  <span>Obstáculos: <strong style={{ color:'#f0ead6' }}>{compSel.num_obstaculos}</strong></span>
                  <span>Ref.: <strong style={{ color:'#f0ead6' }}>{compSel.tiempo_referencia} s</strong></span>
                </div>
              )}
              {!bloq && (
                <div style={{ marginTop:12, display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button style={{ ...S.bs, fontSize:12, padding:'8px 12px' }} onClick={abrirEditar}>✏️ Editar</button>
                  <button style={{ fontSize:12, padding:'8px 12px', border:'1.5px solid #7f1d1d', borderRadius:9, background:'transparent', color:'#f87171', cursor:'pointer', fontFamily:'inherit' }} onClick={() => cambiarEstado('bloqueada')}>🔒 Bloquear</button>
                </div>
              )}
              {bloq && <div style={{ marginTop:10, padding:'8px 12px', background:'#1a1010', borderRadius:8, fontSize:12, color:'#f87171' }}>🔒 Bloqueada — no se pueden modificar participantes</div>}
            </Card>

            <Card>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontSize:14, fontWeight:500, color:'#f0ead6' }}>Rondas ({rondas.length})</div>
                <button style={{ ...S.bs, fontSize:12, padding:'8px 12px' }} onClick={addRon}>+ Añadir</button>
              </div>
              {rondas.length === 0 && <div style={{ color:'#6b7280', fontSize:13 }}>Sin rondas</div>}
              {rondas.map(r => (
                <Row key={r.id}>
                  <span style={{ color:'#9ca3af' }}>Ronda {r.numero_ronda}</span>
                  <select style={{ ...S.fi, width:'auto', fontSize:12, padding:'7px 28px 7px 8px' }} value={r.estado} onChange={e => cambiarEstRon(r.id, e.target.value)}>
                    {['pendiente','en_curso','completada'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </Row>
              ))}
            </Card>

            <Card>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontSize:14, fontWeight:500, color:'#f0ead6' }}>Inscritos ({inscripciones.length}/{compSel.max_participantes})</div>
                {!bloq && <button style={S.bp} onClick={() => { setFormI({ usuario_id:'', caballo_id:'', dorsal:'' }); setShowIns(true) }}>+ Inscribir</button>}
              </div>
              {inscripciones.length === 0 && <div style={{ color:'#6b7280', fontSize:13 }}>Sin inscritos</div>}
              {inscripciones.map(ins => (
                <Row key={ins.id}>
                  <span>
                    {ins.usuarios?.nombre} {ins.usuarios?.apellidos}
                    <span style={{ color:'#6b7280' }}> — {ins.caballos?.nombre}</span>
                  </span>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                    <span style={{ color:'#6b7280', fontSize:12 }}>{ins.dorsal ? '#'+ins.dorsal : '—'}</span>
                    {!bloq && (
                      <button style={{ background:'transparent', border:'1.5px solid #7f1d1d', borderRadius:7, color:'#f87171', cursor:'pointer', padding:'5px 9px', fontSize:12, fontFamily:'inherit' }} onClick={() => eliminarIns(ins.id)}>✕</button>
                    )}
                  </div>
                </Row>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
