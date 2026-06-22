# Club Hípico — Instrucciones de instalación

## 1. Prerrequisitos
- Node.js 18+ instalado
- Cuenta en Supabase (supabase.com)

## 2. Configurar Supabase

### A) Crear proyecto
1. Ve a supabase.com → New Project
2. Anota la URL y la anon key (Settings → API)

### B) Ejecutar el SQL
En Supabase → SQL Editor → ejecuta el archivo `club_hipico_supabase.sql`

### C) Crear usuarios en Supabase Auth
Para cada usuario que quieras crear:
1. Authentication → Users → Invite user (introduce el email)
2. O usa el SQL: INSERT en auth.users (ver docs de Supabase)

## 3. Configurar variables de entorno

```bash
cp .env.example .env
```
Edita `.env` con tus credenciales:
```
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## 4. Instalar y ejecutar

```bash
npm install
npm run dev
```

## 5. Desplegar en Netlify

```bash
npm run build
```
Sube la carpeta `dist/` a Netlify.

O conecta el repositorio de GitHub a Netlify con:
- Build command: `npm run build`
- Publish directory: `dist`
- Variables de entorno: añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

## Usuarios y roles

En la tabla `usuarios` el campo `rol` puede ser:
- `admin` — acceso total
- `juez` — puede registrar puntuaciones
- `competidor` — solo ve su clasificación y puntuaciones

La contraseña de cada usuario se gestiona desde Supabase Auth.
Para que el competidor pueda entrar, su email debe estar registrado
en Supabase Auth con la contraseña generada.

