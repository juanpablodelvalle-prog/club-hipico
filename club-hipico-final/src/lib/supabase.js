import { createClient } from '@supabase/supabase-js'


export const supabase = createClient(
  'https://ejpaejblrsjgbvcvyoog.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqcGFlamJscnNqZ2J2Y3Z5b29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTU3OTIsImV4cCI6MjA5NzM3MTc5Mn0.3-BiUXPleC3OKk7AyUaJHQxQsYAPH6mIUIgVAmugtbc'
)
export const supabase = createClient(
  'https://ejpaejblrsjgbvcvyoog.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqcGFlamJscnNqZ2J2Y3Z5b29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3OTU3OTIsImV4cCI6MjA5NzM3MTc5Mn0.3-BiUXPleC3OKk7AyUaJHQxQsYAPH6mIUIgVAmugtbc'
)
// ─── AUTH ────────────────────────────────────────────────────
export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()

// ─── PERFIL USUARIO ──────────────────────────────────────────
export const getPerfil = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('usuarios').select('*').eq('auth_id', user.id).single()
  return data
}

export const getUsuarios = () =>
  supabase.from('usuarios').select('*, caballos(*)').order('apellidos')

export const crearUsuario = (datos) =>
  supabase.from('usuarios').insert(datos).select().single()

export const actualizarUsuario = (id, datos) =>
  supabase.from('usuarios').update(datos).eq('id', id).select().single()

// ─── CABALLOS ────────────────────────────────────────────────
export const crearCaballo = (datos) =>
  supabase.from('caballos').insert(datos).select().single()

export const eliminarCaballo = (id) =>
  supabase.from('caballos').delete().eq('id', id)

export const actualizarCaballo = (id, datos) =>
  supabase.from('caballos').update(datos).eq('id', id).select().single()

// ─── COMPETICIONES ───────────────────────────────────────────
export const getCompeticiones = () =>
  supabase.from('competiciones').select('*').order('fecha')

export const crearCompeticion = (datos) =>
  supabase.from('competiciones').insert(datos).select().single()

export const actualizarCompeticion = (id, datos) =>
  supabase.from('competiciones').update(datos).eq('id', id).select().single()

// ─── INSCRIPCIONES ───────────────────────────────────────────
export const getInscripciones = (competicion_id) =>
  supabase
    .from('inscripciones')
    .select(`*, usuarios(id,nombre,apellidos,licencia_num), caballos(id,nombre,raza)`)
    .eq('competicion_id', competicion_id)
    .order('dorsal')

export const crearInscripcion = (datos) =>
  supabase.from('inscripciones').insert(datos).select().single()

export const eliminarInscripcion = (id) =>
  supabase.from('inscripciones').delete().eq('id', id)

export const getInscripcionesUsuario = (usuario_id) =>
  supabase
    .from('inscripciones')
    .select(`*, competiciones(*), caballos(*)`)
    .eq('usuario_id', usuario_id)

// ─── RONDAS ──────────────────────────────────────────────────
export const getRondas = (competicion_id) =>
  supabase.from('rondas').select('*').eq('competicion_id', competicion_id).order('numero_ronda')

export const crearRonda = (datos) =>
  supabase.from('rondas').insert(datos).select().single()

export const actualizarRonda = (id, datos) =>
  supabase.from('rondas').update(datos).eq('id', id)

// ─── PUNTUACIONES TIEMPO (barrel/pole) ───────────────────────
export const getPuntuacionesTiempo = (ronda_id) =>
  supabase
    .from('puntuaciones_tiempo')
    .select(`*, inscripciones(*, usuarios(nombre,apellidos), caballos(nombre))`)
    .eq('ronda_id', ronda_id)

export const upsertPuntuacionTiempo = (datos) =>
  supabase
    .from('puntuaciones_tiempo')
    .upsert(datos, { onConflict: 'ronda_id,inscripcion_id' })
    .select().single()

// ─── PUNTUACIONES TRAIL ──────────────────────────────────────
export const getPuntuacionesTrail = (ronda_id) =>
  supabase
    .from('puntuaciones_trail')
    .select(`*, puntuaciones_trail_obstaculos(*), inscripciones(*, usuarios(nombre,apellidos), caballos(nombre))`)
    .eq('ronda_id', ronda_id)
    .order('puntuacion_final', { ascending: false })

export const upsertPuntuacionTrail = async ({ ronda_id, inscripcion_id, tiempo_real_seg, tiempo_referencia, obstaculos, juez_id }) => {
  const exceso = Math.max(0, tiempo_real_seg - tiempo_referencia)
  const penalizacion_tiempo = Math.floor(exceso / 3)
  const suma_obstaculos = obstaculos.reduce((s, o) => s + o.puntuacion, 0)

  const { data: punt, error } = await supabase
    .from('puntuaciones_trail')
    .upsert({
      ronda_id, inscripcion_id,
      tiempo_real_seg, penalizacion_tiempo, suma_obstaculos,
      juez_id,
    }, { onConflict: 'ronda_id,inscripcion_id' })
    .select().single()

  if (error) return { error }

  const detalle = obstaculos.map(o => ({
    puntuacion_trail_id: punt.id,
    numero_obstaculo: o.numero,
    puntuacion: o.puntuacion,
  }))
  const { error: obsErr } = await supabase
    .from('puntuaciones_trail_obstaculos')
    .upsert(detalle, { onConflict: 'puntuacion_trail_id,numero_obstaculo' })

  return { data: punt, error: obsErr }
}

// ─── RESULTADOS ──────────────────────────────────────────────
export const getResultados = (competicion_id) =>
  supabase
    .from('resultados')
    .select(`*, inscripciones(dorsal, usuarios(nombre,apellidos), caballos(nombre))`)
    .eq('competicion_id', competicion_id)
    .order('posicion_final')

export const generarResultados = (competicion_id, modalidad) =>
  supabase.rpc(
    modalidad === 'trail' ? 'generar_resultado_trail' : 'generar_resultado_tiempo',
    { p_competicion_id: competicion_id }
  )

// ─── ALIAS compatibilidad ────────────────────────────────────
export const getCaballos = () =>
  supabase.from('caballos').select('*, usuarios(nombre, apellidos)').eq('activo', true)
