import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, getPerfil } from '../lib/supabase'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [perfil, setPerfil]   = useState(null)
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    setLoading(true)
    const p = await getPerfil()
    setPerfil(p)
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) cargar(); else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) cargar(); else { setPerfil(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [cargar])

  return (
    <AuthCtx.Provider value={{
      perfil, loading,
      esAdmin: perfil?.rol === 'admin',
      esJuez:  perfil?.rol === 'juez' || perfil?.rol === 'admin',
      esComp:  perfil?.rol === 'competidor',
      recargar: cargar,
    }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
