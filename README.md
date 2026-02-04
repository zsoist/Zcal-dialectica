# Zcal - Tu App de Scheduling

App tipo Calendly con Google Calendar. **100% gratis para correr.**

## Pasos para correr en tu Mac

### 1. Instalar herramientas (solo una vez)

Abre Terminal y ejecuta:

```bash
# Instalar Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node

# Instalar pnpm
npm install -g pnpm
```

### 2. Crear base de datos gratis en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea cuenta con Google
2. Click "New Project"
3. Nombre: `zcal`, Password: inventa uno y **guardalo**
4. Espera 2 minutos a que se cree
5. Ve a **Settings** (engranaje) > **Database**
6. Busca "Connection string" > "URI"
7. Copia el string y reemplaza `[YOUR-PASSWORD]` con tu password

### 3. Configurar el proyecto

```bash
# Entra a la carpeta del proyecto
cd Zcal-dialectica

# Copia el archivo de configuracion
cp .env.example .env

# Abre el archivo .env y llena los valores:
# - DATABASE_URL: el string de Supabase
# - GOOGLE_CLIENT_SECRET: de Google Cloud Console
# - NEXTAUTH_SECRET: ve a https://generate-secret.vercel.app/32 y copia el valor
```

### 4. Instalar y correr

```bash
# Instalar dependencias
pnpm install

# Crear tablas en la base de datos
cd packages/database && pnpm db:push && cd ../..

# Correr la app
pnpm dev
```

### 5. Abrir en el navegador

Ve a [http://localhost:3000](http://localhost:3000)

---

## Resumen de cuentas necesarias (todas gratis)

| Servicio | Para que | Link |
|----------|----------|------|
| Supabase | Base de datos | [supabase.com](https://supabase.com) |
| Google Cloud | Login con Google | [console.cloud.google.com](https://console.cloud.google.com) |
| Vercel | Hosting (opcional) | [vercel.com](https://vercel.com) |

## Ayuda

Si algo falla, abre Claude Code en esta carpeta y pregunta.
