# Club Hípico — Documentación del Proyecto
*Última actualización: junio 2026*

---

## 1. ACCESO A LA APLICACIÓN

### URL de producción
```
https://club-hipico-final-[id].vercel.app
```
*(sustituir por la URL real asignada por Vercel)*

### Usuarios de acceso

| Nombre       | Email                    | Contraseña  | Rol         |
|--------------|--------------------------|-------------|-------------|
| Admin Club   | admin@clubhipico.es      | 12345       | Admin       |

> Los competidores y jueces se dan de alta desde la sección **Competidores** del panel de administración. Al crearlos el sistema genera automáticamente una contraseña que el administrador debe comunicar al usuario.

---

## 2. ROLES Y PERMISOS

### Admin
- Acceso completo a todas las secciones
- Dar de alta / editar competidores, jueces y admins
- Crear y gestionar competiciones
- Inscribir competidores en competiciones
- Registrar y modificar puntuaciones
- Bloquear competiciones finalizadas
- Ver resultados y clasificaciones

### Juez
- Registrar y modificar puntuaciones
- Ver competiciones y clasificaciones
- No puede crear usuarios ni gestionar competiciones

### Competidor
- Ver clasificación global (provisional y definitiva)
- Ver sus propias puntuaciones por ronda y caballo
- Ver calendario de competiciones
- No puede modificar datos ni puntuaciones

---

## 3. FUNCIONALIDADES PRINCIPALES

### Competidores
- Alta de competidores con generación automática de contraseña
- Cada competidor puede tener hasta **3 caballos** registrados
- Edición de datos personales y caballos desde el panel
- Búsqueda por nombre o email

### Competiciones
- Tres modalidades: **Barrel Racing**, **Pole Bending** y **Trail**
- Estados: borrador → abierta → en curso → finalizada → bloqueada
- Una vez **bloqueada** no se pueden añadir ni eliminar participantes
- Se pueden crear y gestionar rondas por competición
- Inscripción: hasta 3 caballos por competidor en la misma competición

### Puntuaciones
- **Barrel Racing y Pole Bending**: cronometrado con penalización de +5 segundos por elemento derribado
- **Trail**: puntuación por obstáculo (−1, 0, 1, 2, 3) más penalización por tiempo
- Mapa del recorrido dinámico: se adapta al número de obstáculos (5 a 20)
- Protección contra modificaciones accidentales: pide confirmación antes de cambiar una puntuación ya registrada

### Resultados
- Clasificación por competidor y caballo (cada combinación tiene su resultado independiente)
- Estado provisional (mientras la competición está en curso) o definitivo (bloqueada/finalizada)
- Visible para todos los roles incluidos los competidores

---

## 4. PLATAFORMAS Y TECNOLOGÍA

### Base de datos
- **Supabase** — PostgreSQL en la nube
- URL del proyecto: `https://ejpaejblrsjgbvcvyoog.supabase.co`
- Panel de administración: `https://supabase.com`
- Credenciales: guardadas en el panel de Supabase (Settings → API)

### Código fuente
- **GitHub** — repositorio privado
- URL: `https://github.com/juanpablodelvalle-prog/club-hipico`
- Rama principal: `main`
- Cada `git push` a `main` despliega automáticamente en Vercel

### Despliegue web
- **Vercel** — hosting y despliegue automático
- Panel: `https://vercel.com`
- Configuración:
  - Root Directory: `club-hipico-final`
  - Build Command: `./node_modules/.bin/vite build`
  - Output Directory: `dist`
  - Node.js: 20.x

### Tecnologías del proyecto
- **React 18** — framework de interfaz
- **Vite** — compilador y bundler
- **Supabase JS** — cliente de base de datos y autenticación
- **CSS inline + responsive** — sin librerías externas de estilos

---

## 5. ESTRUCTURA DEL PROYECTO

```
club-hipico-final/
├── src/
│   ├── components/
│   │   ├── ui.jsx          # Componentes reutilizables (Badge, Card, Modal...)
│   │   ├── Layout.jsx      # Navegación sidebar + bottom nav móvil
│   │   └── MapaTrail.jsx   # Mapa dinámico del recorrido trail
│   ├── hooks/
│   │   └── useAuth.jsx     # Contexto de autenticación
│   ├── lib/
│   │   └── supabase.js     # Cliente y funciones de acceso a datos
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Panel.jsx
│   │   ├── Competidores.jsx
│   │   ├── Competiciones.jsx
│   │   ├── Puntuaciones.jsx
│   │   ├── Resultados.jsx
│   │   ├── CompetidorInicio.jsx
│   │   ├── CompetidorClasif.jsx
│   │   └── CompetidorMis.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── package.json
└── DOCUMENTACION.md        # Este archivo
```

---

## 6. BASE DE DATOS — TABLAS PRINCIPALES

| Tabla                          | Descripción                                      |
|-------------------------------|--------------------------------------------------|
| `usuarios`                    | Competidores, jueces y admins                   |
| `caballos`                    | Caballos vinculados a cada propietario           |
| `competiciones`               | Barrel, Pole Bending y Trail                    |
| `inscripciones`               | Relación competidor+caballo en cada competición  |
| `rondas`                      | Rondas de cada competición                      |
| `puntuaciones_tiempo`         | Tiempos de Barrel y Pole Bending                |
| `puntuaciones_trail`          | Puntuaciones de Trail por ronda                 |
| `puntuaciones_trail_obstaculos` | Detalle por obstáculo en Trail               |
| `resultados`                  | Clasificación final calculada                   |

---

## 7. CÓMO ACTUALIZAR EL PROYECTO

### Modificar código
1. Editar los archivos en VS Code
2. En el terminal CMD desde la carpeta `club_hipico_proyecto`:
```
git add .
git commit -m "descripción del cambio"
git push
```
3. Vercel despliega automáticamente en 1-2 minutos

### Añadir un nuevo competidor
1. Entrar como admin en la web
2. Competidores → + Nuevo
3. Rellenar datos y añadir caballos
4. Guardar — el sistema genera la contraseña automáticamente
5. Comunicar email y contraseña al competidor

### Crear una competición
1. Competiciones → + Nueva
2. Seleccionar modalidad (Barrel / Pole / Trail)
3. Para Trail: indicar número de obstáculos (5-20) y tiempo de referencia
4. Añadir rondas y inscribir competidores
5. Cuando termine: cambiar estado a "Bloqueada" para fijar resultados

---

## 8. CONTACTO Y SOPORTE

- Repositorio GitHub: `https://github.com/juanpablodelvalle-prog/club-hipico`
- Panel Supabase: `https://supabase.com/dashboard`
- Panel Vercel: `https://vercel.com/dashboard`

---

*Documentación generada con Claude (Anthropic) — se actualiza con cada nueva funcionalidad implementada.*
