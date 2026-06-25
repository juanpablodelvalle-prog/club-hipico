// Componente MapaTrail — muestra los obstáculos dinámicamente según numObs
export default function MapaTrail({ numObs = 6, titulo = 'Recorrido Trail' }) {
  // Posiciones predefinidas para hasta 20 obstáculos distribuidos por la pista
  const POSICIONES = [
    { x: 149, y: 145 }, // 1
    { x: 290, y: 85  }, // 2
    { x: 420, y: 145 }, // 3
    { x: 540, y: 200 }, // 4
    { x: 420, y: 260 }, // 5
    { x: 290, y: 310 }, // 6
    { x: 149, y: 260 }, // 7
    { x: 200, y: 145 }, // 8
    { x: 350, y: 85  }, // 9
    { x: 480, y: 145 }, // 10
    { x: 560, y: 260 }, // 11
    { x: 420, y: 310 }, // 12
    { x: 240, y: 310 }, // 13
    { x: 100, y: 200 }, // 14
    { x: 200, y: 85  }, // 15
    { x: 480, y: 85  }, // 16
    { x: 560, y: 145 }, // 17
    { x: 350, y: 200 }, // 18
    { x: 149, y: 310 }, // 19
    { x: 350, y: 310 }, // 20
  ]

  const obstaculos = POSICIONES.slice(0, numObs)

  // Generar polyline del recorrido conectando los obstáculos
  const puntos = obstaculos.map(p => `${p.x},${p.y}`).join(' ')
  const puntosConInicio = `77,197 ${puntos} 77,235`

  return (
    <div style={{ borderRadius:8, overflow:'hidden', border:'1px solid #2d3142' }}>
      <svg width="100%" viewBox="0 0 680 420" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="ai" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
          <marker id="ao" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
          <marker id="at" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#f0ead6" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
          <marker id="ad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
        </defs>

        {/* Fondo */}
        <rect width="680" height="420" fill="#2a3520"/>
        <rect x="30" y="30" width="620" height="350" rx="4" fill="#3a5c30"/>
        <rect x="55" y="48" width="560" height="310" rx="2" fill="#c8a966"/>

        {/* Cuadrícula arena */}
        {[88,128,168,208,248,288,328].map(y => (
          <line key={y} x1="55" y1={y} x2="615" y2={y} stroke="#b89850" strokeWidth=".5" opacity=".5"/>
        ))}
        {[148,241,334,427,520].map(x => (
          <line key={x} x1={x} y1="48" x2={x} y2="358" stroke="#b89850" strokeWidth=".5" opacity=".4"/>
        ))}

        {/* Valla perimetral */}
        <rect x="55" y="48" width="560" height="310" rx="2" fill="none" stroke="#6b4c1a" strokeWidth="3.5"/>

        {/* Entrada */}
        <rect x="55" y="175" width="22" height="30" fill="#2a1e0a" stroke="#4ade80" strokeWidth="1.5"/>
        <text x="66" y="194" textAnchor="middle" style={{ fill:'#f0ead6', fontFamily:'sans-serif', fontSize:8, fontWeight:700 }}>ENT</text>
        <line x1="42" y1="190" x2="57" y2="190" stroke="#4ade80" strokeWidth="2" markerEnd="url(#ai)"/>
        <text x="35" y="207" textAnchor="middle" style={{ fill:'#4ade80', fontFamily:'sans-serif', fontSize:9 }}>E</text>

        {/* Salida */}
        <rect x="55" y="218" width="22" height="30" fill="#2a1e0a" stroke="#f87171" strokeWidth="1.5"/>
        <text x="66" y="237" textAnchor="middle" style={{ fill:'#f0ead6', fontFamily:'sans-serif', fontSize:8, fontWeight:700 }}>SAL</text>
        <line x1="77" y1="233" x2="42" y2="233" stroke="#f87171" strokeWidth="2" markerEnd="url(#ao)"/>
        <text x="35" y="250" textAnchor="middle" style={{ fill:'#f87171', fontFamily:'sans-serif', fontSize:9 }}>S</text>

        {/* Recorrido */}
        <polyline
          points={puntosConInicio}
          fill="none" stroke="#f0ead6" strokeWidth="2"
          strokeDasharray="8 5" opacity=".65"
          markerEnd="url(#at)"
        />

        {/* Obstáculos dinámicos */}
        {obstaculos.map((pos, i) => (
          <g key={i}>
            {/* Símbolo del obstáculo */}
            <rect
              x={pos.x - 16} y={pos.y - 10}
              width={32} height={20}
              rx="3" fill="#7c5c2a" stroke="#c9a96e" strokeWidth="1.5"
            />
            {/* Número */}
            <circle cx={pos.x - 24} cy={pos.y} r="9" fill="#1e3a5f" stroke="#93c5fd" strokeWidth="1.5"/>
            <text
              x={pos.x - 24} y={pos.y + 4}
              textAnchor="middle"
              style={{ fill:'#f0ead6', fontFamily:'sans-serif', fontSize:10, fontWeight:700 }}>
              {i + 1}
            </text>
            {/* Etiqueta */}
            <text
              x={pos.x} y={pos.y + 22}
              textAnchor="middle"
              style={{ fill:'#1a1a0a', fontFamily:'sans-serif', fontSize:10 }}>
              Obs.{i + 1}
            </text>
          </g>
        ))}

        {/* Dimensiones */}
        <line x1="55" y1="385" x2="615" y2="385" stroke="#c9a96e" strokeWidth="1" markerStart="url(#ad)" markerEnd="url(#ad)"/>
        <text x="335" y="398" textAnchor="middle" style={{ fill:'#c9a96e', fontFamily:'sans-serif', fontSize:11 }}>60 m</text>
        <line x1="636" y1="48" x2="636" y2="358" stroke="#c9a96e" strokeWidth="1" markerStart="url(#ad)" markerEnd="url(#ad)"/>
        <text x="656" y="210" textAnchor="middle" style={{ fill:'#c9a96e', fontFamily:'sans-serif', fontSize:11, writingMode:'tb' }}>40 m</text>

        {/* Título */}
        <rect x="55" y="10" width="560" height="22" rx="3" fill="#1a1a0a" opacity=".6"/>
        <text x="335" y="25" textAnchor="middle" style={{ fill:'#f0ead6', fontFamily:'sans-serif', fontSize:12, fontWeight:500 }}>
          {titulo} — {numObs} obstáculos · Pista 60×40 m
        </text>
      </svg>
    </div>
  )
}
