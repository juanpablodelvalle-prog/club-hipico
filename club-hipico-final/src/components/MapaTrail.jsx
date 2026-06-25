// MapaTrail.jsx — mapa dinámico con disposiciones específicas por número de obstáculos

// Posiciones optimizadas para cada número de obstáculos (5-20)
// Cada layout distribuye los obstáculos de forma realista en la pista 60x40m
const LAYOUTS = {
  5:  [
    {x:149,y:120}, {x:340,y:80},  {x:530,y:120},
    {x:530,y:250}, {x:149,y:250},
  ],
  6:  [
    {x:149,y:120}, {x:340,y:80},  {x:530,y:120},
    {x:530,y:250}, {x:340,y:290}, {x:149,y:250},
  ],
  7:  [
    {x:149,y:100}, {x:340,y:75},  {x:530,y:100},
    {x:560,y:197}, {x:530,y:290}, {x:340,y:310},
    {x:149,y:290},
  ],
  8:  [
    {x:149,y:100}, {x:290,y:75},  {x:430,y:75},  {x:530,y:140},
    {x:530,y:260}, {x:430,y:310}, {x:290,y:310}, {x:149,y:260},
  ],
  9:  [
    {x:149,y:100}, {x:290,y:75},  {x:430,y:75},  {x:530,y:140},
    {x:340,y:197}, {x:530,y:260}, {x:430,y:310}, {x:290,y:310},
    {x:149,y:260},
  ],
  10: [
    {x:149,y:100}, {x:290,y:75},  {x:430,y:75},  {x:530,y:140},
    {x:530,y:197}, {x:530,y:260}, {x:430,y:310}, {x:290,y:310},
    {x:149,y:260}, {x:149,y:197},
  ],
  11: [
    {x:149,y:90},  {x:270,y:75},  {x:390,y:75},  {x:510,y:90},
    {x:540,y:197}, {x:510,y:300}, {x:390,y:315}, {x:270,y:315},
    {x:149,y:300}, {x:120,y:197}, {x:340,y:197},
  ],
  12: [
    {x:149,y:90},  {x:270,y:75},  {x:390,y:75},  {x:510,y:90},
    {x:540,y:155}, {x:540,y:240}, {x:510,y:300}, {x:390,y:315},
    {x:270,y:315}, {x:149,y:300}, {x:120,y:240}, {x:120,y:155},
  ],
  13: [
    {x:149,y:90},  {x:255,y:75},  {x:340,y:75},  {x:430,y:75},
    {x:530,y:110}, {x:545,y:197}, {x:530,y:280}, {x:430,y:310},
    {x:340,y:315}, {x:255,y:310}, {x:149,y:280}, {x:120,y:197},
    {x:340,y:197},
  ],
  14: [
    {x:149,y:90},  {x:240,y:75},  {x:340,y:75},  {x:440,y:75},
    {x:530,y:110}, {x:545,y:197}, {x:530,y:280}, {x:440,y:310},
    {x:340,y:315}, {x:240,y:310}, {x:149,y:280}, {x:120,y:197},
    {x:240,y:197}, {x:440,y:197},
  ],
  15: [
    {x:149,y:90},  {x:230,y:75},  {x:310,y:75},  {x:390,y:75},
    {x:470,y:75},  {x:530,y:120}, {x:545,y:197}, {x:530,y:270},
    {x:470,y:310}, {x:390,y:315}, {x:310,y:315}, {x:230,y:310},
    {x:149,y:270}, {x:120,y:197}, {x:340,y:197},
  ],
  16: [
    {x:149,y:90},  {x:220,y:75},  {x:295,y:75},  {x:370,y:75},
    {x:445,y:75},  {x:520,y:110}, {x:540,y:197}, {x:520,y:280},
    {x:445,y:310}, {x:370,y:315}, {x:295,y:315}, {x:220,y:310},
    {x:149,y:280}, {x:120,y:197}, {x:260,y:197}, {x:420,y:197},
  ],
  17: [
    {x:149,y:90},  {x:215,y:75},  {x:285,y:75},  {x:355,y:75},
    {x:425,y:75},  {x:500,y:90},  {x:535,y:155}, {x:545,y:197},
    {x:535,y:240}, {x:500,y:305}, {x:425,y:315}, {x:355,y:315},
    {x:285,y:315}, {x:215,y:305}, {x:149,y:240}, {x:120,y:197},
    {x:149,y:155},
  ],
  18: [
    {x:149,y:90},  {x:210,y:75},  {x:275,y:75},  {x:340,y:75},
    {x:405,y:75},  {x:470,y:75},  {x:525,y:110}, {x:540,y:197},
    {x:525,y:280}, {x:470,y:310}, {x:405,y:315}, {x:340,y:315},
    {x:275,y:315}, {x:210,y:310}, {x:149,y:280}, {x:120,y:197},
    {x:260,y:197}, {x:420,y:197},
  ],
  19: [
    {x:149,y:90},  {x:205,y:75},  {x:265,y:75},  {x:325,y:75},
    {x:390,y:75},  {x:455,y:75},  {x:515,y:100}, {x:540,y:155},
    {x:540,y:197}, {x:540,y:240}, {x:515,y:295}, {x:455,y:310},
    {x:390,y:315}, {x:325,y:315}, {x:265,y:315}, {x:205,y:310},
    {x:149,y:295}, {x:120,y:197}, {x:340,y:197},
  ],
  20: [
    {x:149,y:90},  {x:200,y:75},  {x:255,y:75},  {x:310,y:75},
    {x:370,y:75},  {x:430,y:75},  {x:490,y:75},  {x:530,y:115},
    {x:540,y:155}, {x:545,y:197}, {x:540,y:240}, {x:530,y:280},
    {x:490,y:310}, {x:430,y:315}, {x:370,y:315}, {x:310,y:315},
    {x:255,y:315}, {x:200,y:310}, {x:149,y:280}, {x:120,y:197},
  ],
}

// Imagen genérica para menos de 5 o más de 20
function MapaGenerico({ numObs }) {
  return (
    <div style={{ borderRadius:8, overflow:'hidden', border:'1px solid #2d3142' }}>
      <svg width="100%" viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
        <rect width="680" height="420" fill="#2a3520"/>
        <rect x="30" y="30" width="620" height="350" rx="4" fill="#3a5c30"/>
        <rect x="55" y="48" width="560" height="310" rx="2" fill="#c8a966"/>
        <rect x="55" y="48" width="560" height="310" rx="2" fill="none" stroke="#6b4c1a" strokeWidth="3.5"/>
        <rect x="55" y="10" width="560" height="22" rx="3" fill="#1a1a0a" opacity=".6"/>
        <text x="335" y="25" textAnchor="middle" style={{ fill:'#f0ead6', fontFamily:'sans-serif', fontSize:12, fontWeight:500 }}>
          Recorrido Trail — {numObs} obstáculos · Pista 60×40 m
        </text>
        <text x="335" y="197" textAnchor="middle" style={{ fill:'#6b4c1a', fontFamily:'sans-serif', fontSize:14 }}>
          Plano personalizado ({numObs} obstáculos)
        </text>
        <text x="335" y="220" textAnchor="middle" style={{ fill:'#6b4c1a', fontFamily:'sans-serif', fontSize:11 }}>
          Usa el panel de puntuación para registrar cada obstáculo
        </text>
      </svg>
    </div>
  )
}

export default function MapaTrail({ numObs = 6, titulo = 'Trail' }) {
  const n = parseInt(numObs) || 6

  // Fuera de rango → mapa genérico
  if (n < 5 || n > 20) return <MapaGenerico numObs={n} />

  const posiciones = LAYOUTS[n] || LAYOUTS[6]

  // Línea del recorrido
  const recorrido = [
    [77, 190],
    ...posiciones.map(p => [p.x, p.y]),
    [77, 230],
  ]
  const puntosLinea = recorrido.map(p => p.join(',')).join(' ')

  return (
    <div style={{ borderRadius:8, overflow:'hidden', border:'1px solid #2d3142' }}>
      <svg width="100%" viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="mai" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
          <marker id="mao" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
          <marker id="mat" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#f0ead6" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
          <marker id="mad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
        </defs>

        {/* Fondo */}
        <rect width="680" height="420" fill="#2a3520"/>
        <rect x="30" y="30" width="620" height="350" rx="4" fill="#3a5c30"/>
        <rect x="55" y="48" width="560" height="310" rx="2" fill="#c8a966"/>

        {/* Cuadrícula */}
        {[88,128,168,208,248,288,328].map(y => (
          <line key={y} x1="55" y1={y} x2="615" y2={y} stroke="#b89850" strokeWidth=".5" opacity=".4"/>
        ))}
        {[148,241,334,427,520].map(x => (
          <line key={x} x1={x} y1="48" x2={x} y2="358" stroke="#b89850" strokeWidth=".5" opacity=".3"/>
        ))}

        {/* Valla */}
        <rect x="55" y="48" width="560" height="310" rx="2" fill="none" stroke="#6b4c1a" strokeWidth="3.5"/>

        {/* Entrada */}
        <rect x="55" y="170" width="22" height="30" fill="#2a1e0a" stroke="#4ade80" strokeWidth="1.5"/>
        <text x="66" y="188" textAnchor="middle" style={{ fill:'#f0ead6', fontFamily:'sans-serif', fontSize:8, fontWeight:700 }}>ENT</text>
        <line x1="42" y1="185" x2="57" y2="185" stroke="#4ade80" strokeWidth="2" markerEnd="url(#mai)"/>

        {/* Salida */}
        <rect x="55" y="215" width="22" height="30" fill="#2a1e0a" stroke="#f87171" strokeWidth="1.5"/>
        <text x="66" y="233" textAnchor="middle" style={{ fill:'#f0ead6', fontFamily:'sans-serif', fontSize:8, fontWeight:700 }}>SAL</text>
        <line x1="77" y1="230" x2="42" y2="230" stroke="#f87171" strokeWidth="2" markerEnd="url(#mao)"/>

        {/* Recorrido */}
        <polyline
          points={puntosLinea}
          fill="none" stroke="#f0ead6" strokeWidth="1.8"
          strokeDasharray="7 5" opacity=".6"
          markerEnd="url(#mat)"
        />

        {/* Obstáculos */}
        {posiciones.map((pos, i) => (
          <g key={i}>
            <rect x={pos.x-14} y={pos.y-9} width={28} height={18} rx="3"
              fill="#7c5c2a" stroke="#c9a96e" strokeWidth="1.5"/>
            <circle cx={pos.x-22} cy={pos.y} r="8" fill="#1e3a5f" stroke="#93c5fd" strokeWidth="1.5"/>
            <text x={pos.x-22} y={pos.y+4} textAnchor="middle"
              style={{ fill:'#f0ead6', fontFamily:'sans-serif', fontSize: n>14?8:10, fontWeight:700 }}>
              {i+1}
            </text>
          </g>
        ))}

        {/* Dimensiones */}
        <line x1="55" y1="385" x2="615" y2="385" stroke="#c9a96e" strokeWidth="1" markerStart="url(#mad)" markerEnd="url(#mad)"/>
        <text x="335" y="398" textAnchor="middle" style={{ fill:'#c9a96e', fontFamily:'sans-serif', fontSize:11 }}>60 m</text>
        <line x1="640" y1="48" x2="640" y2="358" stroke="#c9a96e" strokeWidth="1" markerStart="url(#mad)" markerEnd="url(#mad)"/>
        <text x="660" y="207" textAnchor="middle" style={{ fill:'#c9a96e', fontFamily:'sans-serif', fontSize:11, writingMode:'tb' }}>40 m</text>

        {/* Título */}
        <rect x="55" y="10" width="560" height="22" rx="3" fill="#1a1a0a" opacity=".6"/>
        <text x="335" y="25" textAnchor="middle" style={{ fill:'#f0ead6', fontFamily:'sans-serif', fontSize:12, fontWeight:500 }}>
          {titulo} — {n} obstáculos · Pista 60×40 m
        </text>
      </svg>
    </div>
  )
}
