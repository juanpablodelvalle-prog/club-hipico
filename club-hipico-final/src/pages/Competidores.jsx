import { useState, useEffect } from 'react'
import { getUsuarios, crearUsuario, actualizarUsuario, crearCaballo, eliminarCaballo, supabase } from '../lib/supabase'
import { S, Badge, Card, CardTitle, Field, Row, Spinner, Empty, TableWrap, Th, Td, BtnRow, PassBox, CabChip, Grid2 } from '../components/ui'

function genPass() {
  const c = 'abcdefghijkmnpqrstuvwxyz23456789'
  return Array.from({length:6}, () => c[Math.floor(Math.random()*c.length)]).join('')
}

export default function Competidores() {
  const [usuarios, setUsuarios] = useState([])
  const [caballos, setCaballos] = useState([])
  const [tab, setTab]           = useState('u')
  const [loading, setLoading]   = useState(true)
  const [filtro, setFiltro]     = useState('')
  const [ok, setOk]             = useState('')

  // Modal nuevo usuario
  const [showNew, setShowNew]   = useState(false)
  const [formU, setFormU]       = useState({ nombre:'', apellidos:'', email:'', telefono:'', rol:'competidor', licencia_num:'' })
  const [tmpCabs, setTmpCabs]   = useState([])
  const [newCab, setNewCab]     = useState({ nombre:'', raza:'', anio_nacimiento:'' })
  const [passGen, setPassGen]   = useState('')
  const [passShown, setPassShown] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // Modal editar usuario
  const [editU, setEditU]       = useState(null)
  const [formEdit, setFormEdit] = useState({})
  const [editCabs, setEditCabs] = useState([])
  const [newEditCab, setNewEditCab] = useState({ nombre:'', raza:'', anio_nacimiento:'' })

  const flash = (msg) => { setOk(msg); setTimeout(() => setOk(''), 3000) }

  const cargar = async () => {
    setLoading(true)
    const { data: u } = await getUsuarios()
    setUsuarios(u ?? [])
    const { data: c } = await supabase.from('caballos').select('*')
    setCaballos(c ?? [])
    setLoading(false)
  }
  useEffect(() => { cargar() }, [])

  // ── Crear usuario ──────────────────────────────────────────
  const guardarNuevo = async () => {
    if (!formU.nombre || !formU.email) return
    setGuardando(true)
    const pass = genPass()
    // Crear en Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.admin
      ? supabase.auth.signUp({ email: formU.email, password: pass })
      : { data: null, error: null }

    const { data: u, error } = await crearUsuario({
      ...formU,
      pass_generada: pass,
    })
    if (!error && u) {
      if (tmpCabs.length > 0) {
        for (const c of tmpCabs) {
          await crearCaballo({ ...c, propietario_id: u.id })
        }
      }
      setPassGen(pass)
      setPassShown(true)
      setShowNew(false)
      setFormU({ nombre:'', apellidos:'', email:'', telefono:'', rol:'competidor', licencia_num:'' })
      setTmpCabs([])
      await cargar()
      flash('')
    }
    setGuardando(false)
  }

  const addTmpCab = () => {
    if (!newCab.nombre || tmpCabs.length >= 3) return
    setTmpCabs(p => [...p, { ...newCab }])
    setNewCab({ nombre:'', raza:'', anio_nacimiento:'' })
  }

  // ── Editar usuario ─────────────────────────────────────────
  const abrirEdit = (u) => {
    setEditU(u)
    setFormEdit({ nombre: u.nombre, apellidos: u.apellidos, telefono: u.telefono||'', licencia_num: u.licencia_num||'' })
    setEditCabs(caballos.filter(c => c.propietario_id === u.id))
    setNewEditCab({ nombre:'', raza:'', anio_nacimiento:'' })
  }

  const guardarEdit = async () => {
    await actualizarUsuario(editU.id, formEdit)
    await cargar()
    setEditU(null)
    flash('Cambios guardados ✓')
  }

  const addEditCab = async () => {
    if (!newEditCab.nombre || editCabs.length >= 3) return
    await crearCaballo({ ...newEditCab, propietario_id: editU.id })
    const { data: c } = await supabase.from('caballos').select('*').eq('propietario_id', editU.id)
    setEditCabs(c ?? [])
    setNewEditCab({ nombre:'', raza:'', anio_nacimiento:'' })
    await cargar()
  }

  const delEditCab = async (id) => {
    if (!confirm('¿Eliminar este caballo?')) return
    await eliminarCaballo(id)
    setEditCabs(p => p.filter(c => c.id !== id))
    await cargar()
  }

  const filtrados = usuarios.filter(u =>
    `${u.nombre} ${u.apellidos} ${u.email}`.toLowerCase().includes(filtro.toLowerCase())
  )

  if (loading) return <Spinner />

  return (
    <div>
      {/* Modal contraseña generada */}
      {passShown && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#161820', border:'1px solid #2d3142', borderRadius:14, padding:24, width:'100%', maxWidth:360 }}>
            <h3 style={{ fontSize:18, fontWeight:600, color:'#f0ead6', marginBottom:8 }}>✅ Competidor creado</h3>
            <p style={{ fontSize:13, color:'#9ca3af', marginBottom:4 }}>Comunica esta contraseña al competidor:</p>
            <PassBox pass={passGen} email={formU.email || ''}/>
            <p style={{ fontSize:11, color:'#6b7280', textAlign:'center', marginBottom:16 }}>No se volverá a mostrar.</p>
            <button style={{ ...S.bp, width:'100%' }} onClick={() => setPassShown(false)}>Entendido</button>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {editU && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:'#161820', borderRadius:'16px 16px 0 0', padding:'12px 16px 36px', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ width:36, height:4, background:'#2d3142', borderRadius:2, margin:'0 auto 16px' }}/>
            <h3 style={{ fontSize:18, fontWeight:600, color:'#f0ead6', marginBottom:18 }}>Editar competidor</h3>
            <Grid2>
              <Field label="Nombre"><input style={S.fi} value={formEdit.nombre} onChange={e=>setFormEdit(p=>({...p,nombre:e.target.value}))}/></Field>
              <Field label="Apellidos"><input style={S.fi} value={formEdit.apellidos} onChange={e=>setFormEdit(p=>({...p,apellidos:e.target.value}))}/></Field>
            </Grid2>
            <Field label="Teléfono"><input style={S.fi} value={formEdit.telefono} onChange={e=>setFormEdit(p=>({...p,telefono:e.target.value}))}/></Field>
            <Field label="Nº licencia"><input style={S.fi} value={formEdit.licencia_num} onChange={e=>setFormEdit(p=>({...p,licencia_num:e.target.value}))}/></Field>
            <Field label={`Caballos (${editCabs.length}/3)`}>
              <div style={{ marginBottom:8 }}>{editCabs.map(c => <CabChip key={c.id} nombre={c.nombre} raza={c.raza} onDel={() => delEditCab(c.id)}/>)}</div>
              {editCabs.length < 3 && (
                <div>
                  <Grid2 style={{ marginBottom:8 }}>
                    <input style={S.fi} placeholder="Nombre caballo" value={newEditCab.nombre} onChange={e=>setNewEditCab(p=>({...p,nombre:e.target.value}))}/>
                    <input style={S.fi} placeholder="Raza" value={newEditCab.raza} onChange={e=>setNewEditCab(p=>({...p,raza:e.target.value}))}/>
                  </Grid2>
                  <div style={{ display:'flex', gap:8 }}>
                    <input style={{ ...S.fi, flex:1 }} type="number" placeholder="Año nac." value={newEditCab.anio_nacimiento} onChange={e=>setNewEditCab(p=>({...p,anio_nacimiento:e.target.value}))}/>
                    <button style={{ ...S.bs, flexShrink:0 }} onClick={addEditCab}>+ Añadir</button>
                  </div>
                </div>
              )}
            </Field>
            <BtnRow>
              <button style={S.bs} onClick={() => setEditU(null)}>Cancelar</button>
              <button style={S.bp} onClick={guardarEdit}>Guardar cambios</button>
            </BtnRow>
          </div>
        </div>
      )}

      {/* Modal nuevo competidor */}
      {showNew && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <div style={{ background:'#161820', borderRadius:'16px 16px 0 0', padding:'12px 16px 36px', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ width:36, height:4, background:'#2d3142', borderRadius:2, margin:'0 auto 16px' }}/>
            <h3 style={{ fontSize:18, fontWeight:600, color:'#f0ead6', marginBottom:18 }}>Alta de competidor</h3>
            <Grid2>
              <Field label="Nombre"><input style={S.fi} value={formU.nombre} onChange={e=>setFormU(p=>({...p,nombre:e.target.value}))} placeholder="Nombre"/></Field>
              <Field label="Apellidos"><input style={S.fi} value={formU.apellidos} onChange={e=>setFormU(p=>({...p,apellidos:e.target.value}))} placeholder="Apellidos"/></Field>
            </Grid2>
            <Field label="Email"><input style={S.fi} type="email" inputMode="email" value={formU.email} onChange={e=>setFormU(p=>({...p,email:e.target.value}))} placeholder="email@ejemplo.com"/></Field>
            <Field label="Teléfono"><input style={S.fi} type="tel" value={formU.telefono} onChange={e=>setFormU(p=>({...p,telefono:e.target.value}))} placeholder="+34 600 000 000"/></Field>
            <Field label="Nº licencia"><input style={S.fi} value={formU.licencia_num} onChange={e=>setFormU(p=>({...p,licencia_num:e.target.value}))} placeholder="FEH-XXXX"/></Field>
            <Field label="Rol">
              <select style={S.fi} value={formU.rol} onChange={e=>setFormU(p=>({...p,rol:e.target.value}))}>
                <option value="competidor">Competidor</option>
                <option value="juez">Juez</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            {formU.rol === 'competidor' && (
              <Field label={`Caballos (${tmpCabs.length}/3 máx.)`}>
                <div style={{ marginBottom:8 }}>{tmpCabs.map((c,i) => <CabChip key={i} nombre={c.nombre} raza={c.raza} onDel={() => setTmpCabs(p => p.filter((_,j)=>j!==i))}/>)}</div>
                {tmpCabs.length < 3 && (
                  <div>
                    <Grid2 style={{ marginBottom:8 }}>
                      <input style={S.fi} placeholder="Nombre caballo" value={newCab.nombre} onChange={e=>setNewCab(p=>({...p,nombre:e.target.value}))}/>
                      <input style={S.fi} placeholder="Raza" value={newCab.raza} onChange={e=>setNewCab(p=>({...p,raza:e.target.value}))}/>
                    </Grid2>
                    <div style={{ display:'flex', gap:8 }}>
                      <input style={{ ...S.fi, flex:1 }} type="number" inputMode="numeric" placeholder="Año nac." value={newCab.anio_nacimiento} onChange={e=>setNewCab(p=>({...p,anio_nacimiento:e.target.value}))}/>
                      <button style={{ ...S.bs, flexShrink:0 }} onClick={addTmpCab}>+ Añadir</button>
                    </div>
                  </div>
                )}
              </Field>
            )}
            <BtnRow>
              <button style={S.bs} onClick={() => { setShowNew(false); setTmpCabs([]); setFormU({ nombre:'', apellidos:'', email:'', telefono:'', rol:'competidor', licencia_num:'' }) }}>Cancelar</button>
              <button style={{ ...S.bp, opacity: guardando ? 0.7 : 1 }} onClick={guardarNuevo} disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar y ver contraseña'}</button>
            </BtnRow>
          </div>
        </div>
      )}

      {/* Cabecera */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, paddingBottom:14, borderBottom:'1px solid #1e2130', flexWrap:'wrap', gap:10 }}>
        <h1 style={{ fontSize:19, fontWeight:600, color:'#f0ead6' }}>Competidores</h1>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {ok && <span style={{ fontSize:12, color:'#4ade80' }}>{ok}</span>}
          <button style={S.bp} onClick={() => setShowNew(true)}>+ Nuevo</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', border:'1.5px solid #2d3142', borderRadius:9, overflow:'hidden', marginBottom:14 }}>
        {[['u','Personas ('+usuarios.length+')'],['c','Caballos ('+caballos.length+')']].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex:1, padding:'12px 8px', fontSize:13, border:'none', background: tab===id ? '#c9a96e18' : 'transparent', color: tab===id ? '#c9a96e' : '#6b7280', fontWeight: tab===id ? 600 : 400, cursor:'pointer', borderRight: id==='u' ? '1px solid #2d3142' : 'none', fontFamily:'inherit' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Personas */}
      {tab === 'u' && (
        <>
          <input style={{ ...S.fi, marginBottom:12, fontSize:14 }} placeholder="Buscar por nombre o email…" value={filtro} onChange={e => setFiltro(e.target.value)}/>
          <Card>
            <TableWrap>
              <thead><tr><Th>Nombre</Th><Th>Email</Th><Th>Licencia</Th><Th>Rol</Th><Th>Caballos</Th><Th></Th></tr></thead>
              <tbody>
                {filtrados.map(u => (
                  <tr key={u.id}>
                    <Td><div style={{ fontWeight:500 }}>{u.nombre} {u.apellidos}</div><div style={{ fontSize:10, color:'#6b7280' }}>{u.telefono}</div></Td>
                    <Td style={{ color:'#9ca3af', fontSize:12 }}>{u.email}</Td>
                    <Td style={{ color:'#6b7280', fontSize:11, fontFamily:'monospace' }}>{u.licencia_num||'—'}</Td>
                    <Td><Badge type={u.rol}/></Td>
                    <Td style={{ textAlign:'center', color:'#9ca3af' }}>{caballos.filter(c=>c.propietario_id===u.id).length}</Td>
                    <Td><button style={{ ...S.bs, fontSize:12, padding:'7px 11px' }} onClick={() => abrirEdit(u)}>Editar</button></Td>
                  </tr>
                ))}
                {!filtrados.length && <tr><Td colSpan={6} style={{ color:'#6b7280' }}>Sin resultados</Td></tr>}
              </tbody>
            </TableWrap>
          </Card>
        </>
      )}

      {/* Caballos */}
      {tab === 'c' && (
        <Card>
          <TableWrap>
            <thead><tr><Th>Caballo</Th><Th>Propietario</Th><Th>Raza</Th><Th>Año</Th></tr></thead>
            <tbody>
              {caballos.map(c => {
                const prop = usuarios.find(u => u.id === c.propietario_id)
                return (
                  <tr key={c.id}>
                    <Td style={{ fontWeight:500 }}>{c.nombre}</Td>
                    <Td style={{ color:'#9ca3af' }}>{prop ? prop.nombre+' '+prop.apellidos : '—'}</Td>
                    <Td style={{ color:'#6b7280' }}>{c.raza||'—'}</Td>
                    <Td style={{ color:'#6b7280' }}>{c.anio_nacimiento||'—'}</Td>
                  </tr>
                )
              })}
              {!caballos.length && <tr><Td colSpan={4} style={{ color:'#6b7280' }}>Sin caballos</Td></tr>}
            </tbody>
          </TableWrap>
        </Card>
      )}
    </div>
  )
}
