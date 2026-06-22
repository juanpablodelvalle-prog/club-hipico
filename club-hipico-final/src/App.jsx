import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Panel from './pages/Panel'
import Competidores from './pages/Competidores'
import Competiciones from './pages/Competiciones'
import Puntuaciones from './pages/Puntuaciones'
import Resultados from './pages/Resultados'
import CompetidorInicio from './pages/CompetidorInicio'
import CompetidorClasif from './pages/CompetidorClasif'
import CompetidorMis from './pages/CompetidorMis'

function Inner() {
  const { perfil, loading, esAdmin, esJuez } = useAuth()
  const [seccion, setSeccion] = useState(null)

  useEffect(() => {
    if (!perfil) return
    if (perfil.rol === 'admin' || perfil.rol === 'juez') setSeccion('panel')
    else setSeccion('cv-inicio')
  }, [perfil])

  const nav = (sec) => {
    setSeccion(sec)
    document.getElementById('main-content')?.scrollTo(0, 0)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'#0f1117', color:'#6b7280', fontSize:14 }}>
      Cargando…
    </div>
  )
  if (!perfil) return <Login />

  const pages = {
    panel:          <Panel />,
    competidores:   <Competidores />,
    competiciones:  <Competiciones />,
    puntuaciones:   <Puntuaciones />,
    resultados:     <Resultados />,
    'cv-inicio':    <CompetidorInicio />,
    'cv-clasif':    <CompetidorClasif />,
    'cv-mis':       <CompetidorMis />,
  }

  return (
    <Layout seccion={seccion} onNav={nav}>
      {pages[seccion] || null}
    </Layout>
  )
}

export default function App() {
  return <AuthProvider><Inner /></AuthProvider>
}
