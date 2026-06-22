import { useState, useEffect } from 'react'
import { getCompeticiones, getUsuarios, getInscripciones } from '../lib/supabase'
import { Card, CardTitle, Badge, Spinner, Row, TableWrap, Th, Td } from '../components/ui'

export default function Panel() {
  const [comps, setComps]   = useState([])
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCompeticiones().then(({ data }) => setComps(data ?? [])),
      getUsuarios().then(({ data }) => setUsers(data ?? [])),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const competidores = users.filter(u => u.rol === 'competidor').length
  const enCurso = comps.filter(c => c.estado === 'en_curso').length

  return (
    <div>
      <div style={{ marginBottom:16, paddingBottom:14, borderBottom:'1px solid #1e2130' }}>
        <h1 style={{ fontSize:19, fontWeight:600, color:'#f0ead6' }}>Panel</h1>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
        {[
          ['Competidores', competidores],
          ['Competiciones', comps.length],
          ['En curso', enCurso],
          ['Caballos', users.reduce((s,u)=>s+(u.caballos?.length||0),0)],
        ].map(([l,v]) => (
          <div key={l} style={{ background:'#161820', border:'1px solid #1e2130', borderRadius:10, padding:'12px 14px' }}>
            <div style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:24, fontWeight:600, color:'#f0ead6' }}>{v}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardTitle>Competiciones activas</CardTitle>
        <TableWrap>
          <thead><tr><Th>Nombre</Th><Th>Modalidad</Th><Th>Fecha</Th><Th>Estado</Th></tr></thead>
          <tbody>
            {comps.map(c => (
              <tr key={c.id}>
                <Td style={{ fontWeight:500 }}>{c.nombre}</Td>
                <Td><Badge type={c.modalidad}/></Td>
                <Td style={{ color:'#9ca3af' }}>{c.fecha}</Td>
                <Td><Badge type={c.estado}/></Td>
              </tr>
            ))}
            {!comps.length && <tr><Td colSpan={4} style={{ color:'#6b7280' }}>Sin competiciones</Td></tr>}
          </tbody>
        </TableWrap>
      </Card>

      <Card>
        <CardTitle>Últimos competidores</CardTitle>
        <TableWrap>
          <thead><tr><Th>Nombre</Th><Th>Email</Th><Th>Rol</Th><Th>Caballos</Th></tr></thead>
          <tbody>
            {users.slice(0,5).map(u => (
              <tr key={u.id}>
                <Td style={{ fontWeight:500 }}>{u.nombre} {u.apellidos}</Td>
                <Td style={{ color:'#9ca3af', fontSize:12 }}>{u.email}</Td>
                <Td><Badge type={u.rol}/></Td>
                <Td style={{ color:'#9ca3af', textAlign:'center' }}>{u.caballos?.length || 0}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>
    </div>
  )
}
