# Zcal - Guía Completa de Desarrollo con Claude Code

## Descripción del Proyecto

Zcal es una aplicación de scheduling/booking similar a Calendly, con integración profunda con Google Workspace. La aplicación permite a usuarios autorizados por Google acceder vía web (similar a compartir un Google Sheets).

---

## 1. Requisitos y Configuración del Entorno

### Requisitos del Sistema

```bash
# Node.js 18+ (requerido)
node --version  # Debe ser >= 18.0.0

# npm o pnpm
npm --version   # >= 9.0.0
pnpm --version  # >= 8.0.0 (recomendado)

# Git
git --version

# Docker (para desarrollo local)
docker --version
docker-compose --version
```

### Herramientas de Desarrollo Necesarias

```bash
# Instalar pnpm globalmente (recomendado)
npm install -g pnpm

# Instalar Prisma CLI
npm install -g prisma

# Instalar TypeScript globalmente
npm install -g typescript ts-node
```

### Variables de Entorno Requeridas

Crear archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/zcal_db"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-key-generado-con-openssl"

# App
APP_URL="http://localhost:3000"
API_URL="http://localhost:3001"

# Redis (opcional, para caché)
REDIS_URL="redis://localhost:6379"
```

---

## 2. Instalación de Claude Code

### macOS

```bash
# Usando Homebrew
brew install anthropic/tap/claude-code

# O usando npm
npm install -g @anthropic-ai/claude-code
```

### Linux (Ubuntu/Debian)

```bash
# Usando npm (recomendado)
npm install -g @anthropic-ai/claude-code

# O descarga directa
curl -fsSL https://claude.ai/install-claude-code.sh | bash
```

### Windows

```powershell
# Usando npm en PowerShell
npm install -g @anthropic-ai/claude-code

# O usando winget
winget install Anthropic.ClaudeCode
```

### Verificar Instalación

```bash
claude --version
claude --help
```

### Autenticación

```bash
# Iniciar sesión con tu cuenta de Anthropic
claude login

# Verificar autenticación
claude whoami
```

---

## 3. Arquitectura del Proyecto

### Estructura de Carpetas Recomendada

```
zcal/
├── apps/
│   ├── web/                          # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/                  # App Router (Next.js 14+)
│   │   │   │   ├── (auth)/          # Rutas de autenticación
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── (dashboard)/     # Dashboard protegido
│   │   │   │   │   ├── bookings/
│   │   │   │   │   ├── availability/
│   │   │   │   │   ├── event-types/
│   │   │   │   │   └── settings/
│   │   │   │   ├── [username]/      # Páginas públicas de booking
│   │   │   │   │   └── [eventSlug]/
│   │   │   │   ├── api/
│   │   │   │   │   ├── auth/
│   │   │   │   │   └── trpc/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/              # Componentes base (shadcn/ui)
│   │   │   │   ├── booking/
│   │   │   │   ├── calendar/
│   │   │   │   ├── dashboard/
│   │   │   │   └── forms/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── prisma.ts
│   │   │   │   └── utils.ts
│   │   │   ├── styles/
│   │   │   └── types/
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── api/                          # Backend Node.js/Express (opcional)
│       ├── src/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── routes/
│       │   ├── services/
│       │   │   ├── google/
│       │   │   │   ├── calendar.service.ts
│       │   │   │   ├── drive.service.ts
│       │   │   │   └── gmail.service.ts
│       │   │   ├── booking.service.ts
│       │   │   └── availability.service.ts
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   ├── database/                     # Prisma schema y migraciones
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── package.json
│   │
│   ├── config/                       # Configuraciones compartidas
│   │   ├── eslint/
│   │   └── typescript/
│   │
│   └── types/                        # Tipos TypeScript compartidos
│       ├── src/
│       └── package.json
│
├── .claude/                          # Configuración MCP para Claude Code
│   └── settings.json
│
├── docker-compose.yml
├── turbo.json                        # Turborepo config
├── pnpm-workspace.yaml
└── package.json
```

---

## 4. Configuración de Servidores MCP para Google Suite

### Archivo de Configuración: `.claude/settings.json`

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-google-calendar"],
      "env": {
        "GOOGLE_CLIENT_ID": "${GOOGLE_CLIENT_ID}",
        "GOOGLE_CLIENT_SECRET": "${GOOGLE_CLIENT_SECRET}",
        "GOOGLE_REDIRECT_URI": "${GOOGLE_REDIRECT_URI}"
      }
    },
    "google-drive": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-google-drive"],
      "env": {
        "GOOGLE_CLIENT_ID": "${GOOGLE_CLIENT_ID}",
        "GOOGLE_CLIENT_SECRET": "${GOOGLE_CLIENT_SECRET}"
      }
    },
    "google-workspace": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-google-workspace"],
      "env": {
        "GOOGLE_CLIENT_ID": "${GOOGLE_CLIENT_ID}",
        "GOOGLE_CLIENT_SECRET": "${GOOGLE_CLIENT_SECRET}",
        "GOOGLE_SCOPES": "calendar.readonly,calendar.events,drive.readonly,gmail.send"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

### Alternativa: Google Calendar MCP con servidor local

```json
{
  "mcpServers": {
    "google-calendar-local": {
      "command": "node",
      "args": ["./mcp-servers/google-calendar/index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "./credentials/service-account.json",
        "CALENDAR_ID": "primary"
      }
    }
  }
}
```

### Configuración MCP Combinada Completa

```json
{
  "mcpServers": {
    "google-suite": {
      "command": "npx",
      "args": ["-y", "mcp-google-suite"],
      "env": {
        "GOOGLE_CLIENT_ID": "${GOOGLE_CLIENT_ID}",
        "GOOGLE_CLIENT_SECRET": "${GOOGLE_CLIENT_SECRET}",
        "GOOGLE_SCOPES": [
          "https://www.googleapis.com/auth/calendar",
          "https://www.googleapis.com/auth/calendar.events",
          "https://www.googleapis.com/auth/drive.readonly",
          "https://www.googleapis.com/auth/gmail.send",
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/userinfo.profile"
        ]
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

---

## 5. Funcionalidades a Implementar

### Fase 1: MVP (Producto Mínimo Viable)

- [ ] **Autenticación Google OAuth 2.0**
  - Login/logout con cuenta Google
  - Manejo de tokens y refresh tokens
  - Protección de rutas

- [ ] **Gestión de Disponibilidad**
  - Configurar horarios disponibles por día
  - Bloquear fechas específicas
  - Zonas horarias

- [ ] **Tipos de Eventos (Event Types)**
  - Crear/editar/eliminar tipos de reunión
  - Duración configurable (15, 30, 45, 60 min)
  - Buffer entre reuniones

- [ ] **Páginas de Booking Públicas**
  - URL personalizada: `zcal.app/usuario/evento`
  - Calendario para seleccionar fecha/hora
  - Formulario de datos del invitado

- [ ] **Integración Google Calendar**
  - Verificar disponibilidad real
  - Crear eventos automáticamente
  - Sincronización bidireccional

- [ ] **Notificaciones por Email**
  - Confirmación de booking
  - Recordatorios
  - Cancelaciones

### Fase 2: Funcionalidades Avanzadas

- [ ] **Múltiples Calendarios**
  - Conectar varios calendarios Google
  - Prioridad de verificación de disponibilidad

- [ ] **Workflows y Automatizaciones**
  - Emails de seguimiento automáticos
  - Cuestionarios pre-reunión
  - Integración con Google Forms

- [ ] **Personalización Avanzada**
  - Branding personalizado
  - Colores y logos
  - Mensajes customizados

- [ ] **Analytics y Reportes**
  - Dashboard de métricas
  - Exportar a Google Sheets
  - Historial de bookings

- [ ] **Equipos y Organizaciones**
  - Múltiples usuarios
  - Round-robin scheduling
  - Calendarios de equipo

### Fase 3: Premium

- [ ] **Integraciones Externas**
  - Zoom/Google Meet automático
  - Stripe para pagos
  - Webhooks

- [ ] **API Pública**
  - REST API completa
  - Webhooks para eventos
  - SDK para desarrolladores

- [ ] **Funciones Enterprise**
  - SSO/SAML
  - Audit logs
  - Admin console

---

## 6. Esquema de Base de Datos (Prisma)

### Archivo: `packages/database/prisma/schema.prisma`

```prisma
// Generador y datasource
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// MODELOS DE USUARIO Y AUTENTICACIÓN
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  username      String?   @unique
  timezone      String    @default("America/New_York")

  // OAuth
  emailVerified DateTime?
  accounts      Account[]
  sessions      Session[]

  // Relaciones principales
  eventTypes    EventType[]
  bookings      Booking[]     @relation("UserBookings")
  availability  Availability[]
  schedules     Schedule[]

  // Equipos
  teamMemberships TeamMember[]
  ownedTeams      Team[]        @relation("TeamOwner")

  // Configuración
  settings      UserSettings?

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@index([username])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model UserSettings {
  id                    String  @id @default(cuid())
  userId                String  @unique
  user                  User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Preferencias de booking
  defaultEventDuration  Int     @default(30)
  bufferBefore          Int     @default(0)
  bufferAfter           Int     @default(0)
  minimumNotice         Int     @default(60) // minutos

  // Personalización
  brandColor            String  @default("#0066FF")
  logo                  String?

  // Notificaciones
  emailNotifications    Boolean @default(true)
  reminderEmail         Boolean @default(true)
  reminderMinutes       Int     @default(60)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

// ============================================
// MODELOS DE DISPONIBILIDAD
// ============================================

model Schedule {
  id          String   @id @default(cuid())
  name        String
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  isDefault   Boolean  @default(false)

  availability Availability[]
  eventTypes   EventType[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

model Availability {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  scheduleId  String?
  schedule    Schedule? @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  // Día de la semana (0 = Domingo, 6 = Sábado)
  dayOfWeek   Int

  // Horarios (en minutos desde medianoche)
  startTime   Int      // ej: 540 = 9:00 AM
  endTime     Int      // ej: 1020 = 5:00 PM

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([scheduleId])
}

model DateOverride {
  id          String   @id @default(cuid())
  userId      String
  date        DateTime @db.Date

  // null = día bloqueado completamente
  startTime   Int?
  endTime     Int?

  createdAt   DateTime @default(now())

  @@unique([userId, date])
  @@index([userId])
}

// ============================================
// MODELOS DE EVENTOS Y BOOKING
// ============================================

model EventType {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Información básica
  title           String
  slug            String
  description     String?  @db.Text

  // Configuración de duración
  duration        Int      @default(30) // minutos

  // Configuración de buffer
  bufferBefore    Int      @default(0)
  bufferAfter     Int      @default(0)

  // Límites
  minimumNotice   Int      @default(60)  // minutos antes
  maxBookingsPerDay Int?

  // Disponibilidad
  scheduleId      String?
  schedule        Schedule? @relation(fields: [scheduleId], references: [id])

  // Ubicación
  locationType    LocationType @default(GOOGLE_MEET)
  locationValue   String?

  // Estado
  isActive        Boolean  @default(true)
  isPrivate       Boolean  @default(false)

  // Personalización
  color           String   @default("#0066FF")

  // Preguntas para el invitado
  questions       EventQuestion[]

  // Bookings
  bookings        Booking[]

  // Equipos
  teamId          String?
  team            Team?    @relation(fields: [teamId], references: [id])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, slug])
  @@index([userId])
  @@index([teamId])
}

enum LocationType {
  GOOGLE_MEET
  ZOOM
  PHONE
  IN_PERSON
  CUSTOM
}

model EventQuestion {
  id          String    @id @default(cuid())
  eventTypeId String
  eventType   EventType @relation(fields: [eventTypeId], references: [id], onDelete: Cascade)

  question    String
  type        QuestionType @default(TEXT)
  required    Boolean   @default(false)
  options     String[]  // Para SELECT/MULTISELECT
  order       Int       @default(0)

  @@index([eventTypeId])
}

enum QuestionType {
  TEXT
  TEXTAREA
  SELECT
  MULTISELECT
  CHECKBOX
  PHONE
  EMAIL
}

model Booking {
  id              String   @id @default(cuid())

  // Relación con usuario (host)
  userId          String
  user            User     @relation("UserBookings", fields: [userId], references: [id], onDelete: Cascade)

  // Relación con tipo de evento
  eventTypeId     String
  eventType       EventType @relation(fields: [eventTypeId], references: [id])

  // Información del invitado
  guestName       String
  guestEmail      String
  guestTimezone   String
  guestNotes      String?  @db.Text

  // Respuestas a preguntas
  responses       Json?

  // Fecha y hora
  startTime       DateTime
  endTime         DateTime

  // Estado
  status          BookingStatus @default(PENDING)

  // Google Calendar
  googleEventId   String?
  googleMeetLink  String?

  // Metadata
  metadata        Json?

  // Cancelación
  cancelledAt     DateTime?
  cancellationReason String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([eventTypeId])
  @@index([startTime])
  @@index([guestEmail])
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}

// ============================================
// MODELOS DE EQUIPOS
// ============================================

model Team {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique

  ownerId     String
  owner       User     @relation("TeamOwner", fields: [ownerId], references: [id])

  members     TeamMember[]
  eventTypes  EventType[]

  // Personalización
  logo        String?
  brandColor  String   @default("#0066FF")

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([ownerId])
}

model TeamMember {
  id        String   @id @default(cuid())
  teamId    String
  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  role      TeamRole @default(MEMBER)

  createdAt DateTime @default(now())

  @@unique([teamId, userId])
  @@index([teamId])
  @@index([userId])
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
}

// ============================================
// MODELOS DE INTEGRACIÓN
// ============================================

model CalendarConnection {
  id              String   @id @default(cuid())
  userId          String

  provider        CalendarProvider
  externalId      String   // ID del calendario en el proveedor
  name            String

  // Tokens (encriptados)
  accessToken     String   @db.Text
  refreshToken    String?  @db.Text
  expiresAt       DateTime?

  // Configuración
  isPrimary       Boolean  @default(false)
  checkConflicts  Boolean  @default(true)
  createEvents    Boolean  @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, provider, externalId])
  @@index([userId])
}

enum CalendarProvider {
  GOOGLE
  OUTLOOK
  APPLE
}

model Webhook {
  id          String   @id @default(cuid())
  userId      String

  url         String
  events      String[] // booking.created, booking.cancelled, etc.
  secret      String
  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}
```

---

## 7. Endpoints API

### Estructura de Rutas

```typescript
// apps/web/src/app/api/

// ============================================
// AUTENTICACIÓN
// ============================================

// POST /api/auth/[...nextauth]
// Maneja todo el flujo de NextAuth.js con Google OAuth

// ============================================
// USUARIOS
// ============================================

// GET /api/users/me
// Obtener usuario actual
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      settings: true,
      accounts: {
        select: { provider: true }
      }
    }
  });

  return Response.json(user);
}

// PATCH /api/users/me
// Actualizar perfil de usuario
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, username, timezone } = body;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name, username, timezone }
  });

  return Response.json(user);
}

// ============================================
// DISPONIBILIDAD
// ============================================

// GET /api/availability
// Obtener disponibilidad del usuario
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const availability = await prisma.availability.findMany({
    where: { userId: session.user.id },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
  });

  return Response.json(availability);
}

// POST /api/availability
// Crear/actualizar disponibilidad
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { scheduleId, slots } = body;

  // Eliminar slots existentes y crear nuevos
  await prisma.$transaction([
    prisma.availability.deleteMany({
      where: {
        userId: session.user.id,
        scheduleId
      }
    }),
    prisma.availability.createMany({
      data: slots.map((slot: any) => ({
        userId: session.user.id,
        scheduleId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime
      }))
    })
  ]);

  return Response.json({ success: true });
}

// GET /api/availability/slots
// Obtener slots disponibles para una fecha
// Query params: eventTypeId, date, timezone
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventTypeId = searchParams.get('eventTypeId');
  const date = searchParams.get('date');
  const timezone = searchParams.get('timezone') || 'UTC';

  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    include: {
      user: {
        include: {
          availability: true,
          accounts: {
            where: { provider: 'google' }
          }
        }
      }
    }
  });

  if (!eventType) {
    return Response.json({ error: 'Event type not found' }, { status: 404 });
  }

  // Calcular slots disponibles
  const slots = await calculateAvailableSlots(eventType, date, timezone);

  return Response.json({ slots });
}

// ============================================
// TIPOS DE EVENTO
// ============================================

// GET /api/event-types
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { bookings: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return Response.json(eventTypes);
}

// POST /api/event-types
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, slug, description, duration, locationType } = body;

  // Verificar que el slug sea único para el usuario
  const existingSlug = await prisma.eventType.findUnique({
    where: {
      userId_slug: {
        userId: session.user.id,
        slug
      }
    }
  });

  if (existingSlug) {
    return Response.json(
      { error: 'Slug already exists' },
      { status: 400 }
    );
  }

  const eventType = await prisma.eventType.create({
    data: {
      userId: session.user.id,
      title,
      slug,
      description,
      duration,
      locationType
    }
  });

  return Response.json(eventType, { status: 201 });
}

// GET /api/event-types/[id]
// PATCH /api/event-types/[id]
// DELETE /api/event-types/[id]

// ============================================
// BOOKINGS
// ============================================

// GET /api/bookings
// Obtener bookings del usuario
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const where: any = { userId: session.user.id };

  if (status) {
    where.status = status;
  }

  if (from || to) {
    where.startTime = {};
    if (from) where.startTime.gte = new Date(from);
    if (to) where.startTime.lte = new Date(to);
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      eventType: {
        select: { title: true, duration: true }
      }
    },
    orderBy: { startTime: 'asc' }
  });

  return Response.json(bookings);
}

// POST /api/bookings
// Crear un nuevo booking (público)
export async function POST(request: Request) {
  const body = await request.json();
  const {
    eventTypeId,
    guestName,
    guestEmail,
    guestTimezone,
    guestNotes,
    startTime,
    responses
  } = body;

  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    include: {
      user: {
        include: {
          accounts: {
            where: { provider: 'google' }
          }
        }
      }
    }
  });

  if (!eventType) {
    return Response.json(
      { error: 'Event type not found' },
      { status: 404 }
    );
  }

  // Verificar disponibilidad
  const isAvailable = await checkAvailability(
    eventType.userId,
    new Date(startTime),
    eventType.duration
  );

  if (!isAvailable) {
    return Response.json(
      { error: 'Time slot not available' },
      { status: 409 }
    );
  }

  // Calcular hora de fin
  const start = new Date(startTime);
  const end = new Date(start.getTime() + eventType.duration * 60000);

  // Crear booking
  const booking = await prisma.booking.create({
    data: {
      userId: eventType.userId,
      eventTypeId,
      guestName,
      guestEmail,
      guestTimezone,
      guestNotes,
      startTime: start,
      endTime: end,
      responses,
      status: 'CONFIRMED'
    }
  });

  // Crear evento en Google Calendar
  const googleAccount = eventType.user.accounts[0];
  if (googleAccount) {
    const calendarService = new GoogleCalendarService(googleAccount);
    const googleEvent = await calendarService.createEvent({
      summary: `${eventType.title} con ${guestName}`,
      description: guestNotes,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      attendees: [{ email: guestEmail }],
      conferenceData: eventType.locationType === 'GOOGLE_MEET' ? {
        createRequest: { requestId: booking.id }
      } : undefined
    });

    // Actualizar booking con info de Google
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        googleEventId: googleEvent.id,
        googleMeetLink: googleEvent.hangoutLink
      }
    });
  }

  // Enviar emails de confirmación
  await sendBookingConfirmation(booking);

  return Response.json(booking, { status: 201 });
}

// PATCH /api/bookings/[id]/cancel
// Cancelar un booking
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { reason } = body;

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      user: {
        include: {
          accounts: { where: { provider: 'google' } }
        }
      }
    }
  });

  if (!booking) {
    return Response.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Actualizar estado
  await prisma.booking.update({
    where: { id: params.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: reason
    }
  });

  // Cancelar en Google Calendar
  if (booking.googleEventId) {
    const calendarService = new GoogleCalendarService(
      booking.user.accounts[0]
    );
    await calendarService.deleteEvent(booking.googleEventId);
  }

  // Enviar email de cancelación
  await sendCancellationEmail(booking);

  return Response.json({ success: true });
}

// ============================================
// GOOGLE CALENDAR
// ============================================

// GET /api/google/calendars
// Listar calendarios conectados
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: 'google'
    }
  });

  if (!account) {
    return Response.json(
      { error: 'Google account not connected' },
      { status: 400 }
    );
  }

  const calendarService = new GoogleCalendarService(account);
  const calendars = await calendarService.listCalendars();

  return Response.json(calendars);
}

// POST /api/google/calendars/sync
// Sincronizar eventos de Google Calendar

// ============================================
// PÚBLICO (Sin autenticación)
// ============================================

// GET /api/public/[username]
// Obtener perfil público de un usuario
export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      name: true,
      username: true,
      image: true,
      timezone: true,
      eventTypes: {
        where: { isActive: true, isPrivate: false },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          duration: true,
          color: true
        }
      }
    }
  });

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return Response.json(user);
}

// GET /api/public/[username]/[eventSlug]
// Obtener detalles de un tipo de evento público
```

---

## 8. Componentes Frontend

### Componente: Dashboard Principal

```typescript
// apps/web/src/components/dashboard/DashboardLayout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Calendar,
  Clock,
  Settings,
  Users,
  Link as LinkIcon,
  BarChart,
  Menu,
  X,
  LogOut
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart },
  { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
  { name: 'Event Types', href: '/dashboard/event-types', icon: LinkIcon },
  { name: 'Availability', href: '/dashboard/availability', icon: Clock },
  { name: 'Teams', href: '/dashboard/teams', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <span className="text-xl font-bold text-blue-600">Zcal</span>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-4 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 mb-1 transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center px-6">
            <span className="text-2xl font-bold text-blue-600">Zcal</span>
          </div>
          <nav className="flex-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 mb-1 transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <img
                src={session?.user?.image || '/default-avatar.png'}
                alt=""
                className="h-10 w-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-8">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Componente: Calendario de Disponibilidad

```typescript
// apps/web/src/components/availability/AvailabilityEditor.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';

const DAYS = [
  { id: 0, name: 'Domingo', short: 'Dom' },
  { id: 1, name: 'Lunes', short: 'Lun' },
  { id: 2, name: 'Martes', short: 'Mar' },
  { id: 3, name: 'Miércoles', short: 'Mié' },
  { id: 4, name: 'Jueves', short: 'Jue' },
  { id: 5, name: 'Viernes', short: 'Vie' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
];

interface TimeSlot {
  startTime: number; // minutos desde medianoche
  endTime: number;
}

interface DayAvailability {
  dayOfWeek: number;
  slots: TimeSlot[];
  enabled: boolean;
}

// Convertir minutos a formato HH:MM
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Convertir HH:MM a minutos
function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

export function AvailabilityEditor() {
  const [availability, setAvailability] = useState<DayAvailability[]>(
    DAYS.map((day) => ({
      dayOfWeek: day.id,
      slots: day.id >= 1 && day.id <= 5
        ? [{ startTime: 540, endTime: 1020 }] // 9:00 - 17:00 default weekdays
        : [],
      enabled: day.id >= 1 && day.id <= 5,
    }))
  );
  const [saving, setSaving] = useState(false);

  const toggleDay = (dayIndex: number) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayIndex
          ? {
              ...day,
              enabled: !day.enabled,
              slots: !day.enabled ? [{ startTime: 540, endTime: 1020 }] : [],
            }
          : day
      )
    );
  };

  const addSlot = (dayIndex: number) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayIndex
          ? {
              ...day,
              slots: [...day.slots, { startTime: 540, endTime: 1020 }],
            }
          : day
      )
    );
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayIndex
          ? {
              ...day,
              slots: day.slots.filter((_, i) => i !== slotIndex),
              enabled: day.slots.length > 1,
            }
          : day
      )
    );
  };

  const updateSlot = (
    dayIndex: number,
    slotIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayIndex
          ? {
              ...day,
              slots: day.slots.map((slot, i) =>
                i === slotIndex
                  ? { ...slot, [field]: timeToMinutes(value) }
                  : slot
              ),
            }
          : day
      )
    );
  };

  const copyToAll = (sourceDayIndex: number) => {
    const sourceDay = availability.find((d) => d.dayOfWeek === sourceDayIndex);
    if (!sourceDay) return;

    setAvailability((prev) =>
      prev.map((day) =>
        day.dayOfWeek !== sourceDayIndex
          ? {
              ...day,
              slots: [...sourceDay.slots],
              enabled: sourceDay.enabled,
            }
          : day
      )
    );
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      const slots = availability
        .filter((day) => day.enabled)
        .flatMap((day) =>
          day.slots.map((slot) => ({
            dayOfWeek: day.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }))
        );

      await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots }),
      });
    } catch (error) {
      console.error('Error saving availability:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Horarios Disponibles</h2>
        <button
          onClick={saveAvailability}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y">
        {DAYS.map((day) => {
          const dayAvailability = availability.find(
            (a) => a.dayOfWeek === day.id
          )!;

          return (
            <div key={day.id} className="p-4">
              <div className="flex items-center gap-4">
                {/* Toggle del día */}
                <label className="flex items-center gap-3 w-32">
                  <input
                    type="checkbox"
                    checked={dayAvailability.enabled}
                    onChange={() => toggleDay(day.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="font-medium">{day.name}</span>
                </label>

                {/* Slots de tiempo */}
                <div className="flex-1 space-y-2">
                  {dayAvailability.enabled ? (
                    dayAvailability.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={minutesToTime(slot.startTime)}
                          onChange={(e) =>
                            updateSlot(day.id, slotIndex, 'startTime', e.target.value)
                          }
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="time"
                          value={minutesToTime(slot.endTime)}
                          onChange={(e) =>
                            updateSlot(day.id, slotIndex, 'endTime', e.target.value)
                          }
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        />
                        {dayAvailability.slots.length > 1 && (
                          <button
                            onClick={() => removeSlot(day.id, slotIndex)}
                            className="p-1.5 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">No disponible</span>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  {dayAvailability.enabled && (
                    <>
                      <button
                        onClick={() => addSlot(day.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-600"
                        title="Agregar horario"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => copyToAll(day.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-600"
                        title="Copiar a todos los días"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Componente: Editor de Booking Pages

```typescript
// apps/web/src/components/event-types/EventTypeEditor.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Video, Phone, MapPin, Link as LinkIcon } from 'lucide-react';

interface EventTypeFormData {
  title: string;
  slug: string;
  description: string;
  duration: number;
  locationType: 'GOOGLE_MEET' | 'ZOOM' | 'PHONE' | 'IN_PERSON' | 'CUSTOM';
  locationValue: string;
  color: string;
  bufferBefore: number;
  bufferAfter: number;
  minimumNotice: number;
}

const DURATIONS = [15, 30, 45, 60, 90, 120];

const LOCATION_TYPES = [
  { id: 'GOOGLE_MEET', name: 'Google Meet', icon: Video },
  { id: 'ZOOM', name: 'Zoom', icon: Video },
  { id: 'PHONE', name: 'Llamada telefónica', icon: Phone },
  { id: 'IN_PERSON', name: 'En persona', icon: MapPin },
  { id: 'CUSTOM', name: 'Personalizado', icon: LinkIcon },
];

const COLORS = [
  '#0066FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export function EventTypeEditor({
  eventType,
  username
}: {
  eventType?: EventTypeFormData;
  username: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<EventTypeFormData>({
    title: eventType?.title || '',
    slug: eventType?.slug || '',
    description: eventType?.description || '',
    duration: eventType?.duration || 30,
    locationType: eventType?.locationType || 'GOOGLE_MEET',
    locationValue: eventType?.locationValue || '',
    color: eventType?.color || '#0066FF',
    bufferBefore: eventType?.bufferBefore || 0,
    bufferAfter: eventType?.bufferAfter || 0,
    minimumNotice: eventType?.minimumNotice || 60,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/event-types', {
        method: eventType ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/dashboard/event-types');
      }
    } catch (error) {
      console.error('Error saving event type:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Vista previa del enlace */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-500 mb-1">Tu enlace de reserva:</p>
        <p className="font-mono text-blue-600">
          zcal.app/{username}/{formData.slug || 'tu-evento'}
        </p>
      </div>

      {/* Información básica */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Información básica</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título del evento
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ej: Reunión de 30 minutos"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL personalizada
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">zcal.app/{username}/</span>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe brevemente de qué trata esta reunión..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Duración */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Duración</h3>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => setFormData({ ...formData, duration })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                formData.duration === duration
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Clock className="h-4 w-4" />
              {duration} min
            </button>
          ))}
        </div>
      </div>

      {/* Ubicación */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Ubicación</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {LOCATION_TYPES.map((location) => (
            <button
              key={location.id}
              type="button"
              onClick={() => setFormData({
                ...formData,
                locationType: location.id as any
              })}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                formData.locationType === location.id
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <location.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{location.name}</span>
            </button>
          ))}
        </div>

        {formData.locationType === 'CUSTOM' && (
          <input
            type="text"
            value={formData.locationValue}
            onChange={(e) => setFormData({ ...formData, locationValue: e.target.value })}
            placeholder="Ingresa la ubicación o enlace personalizado"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>

      {/* Color */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`w-10 h-10 rounded-full transition-transform ${
                formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Configuración avanzada */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Configuración avanzada</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buffer antes (min)
            </label>
            <select
              value={formData.bufferBefore}
              onChange={(e) => setFormData({ ...formData, bufferBefore: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {[0, 5, 10, 15, 30, 45, 60].map((min) => (
                <option key={min} value={min}>{min} minutos</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buffer después (min)
            </label>
            <select
              value={formData.bufferAfter}
              onChange={(e) => setFormData({ ...formData, bufferAfter: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {[0, 5, 10, 15, 30, 45, 60].map((min) => (
                <option key={min} value={min}>{min} minutos</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aviso mínimo (min)
            </label>
            <select
              value={formData.minimumNotice}
              onChange={(e) => setFormData({ ...formData, minimumNotice: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {[0, 30, 60, 120, 240, 480, 1440].map((min) => (
                <option key={min} value={min}>
                  {min < 60 ? `${min} minutos` :
                   min < 1440 ? `${min / 60} horas` :
                   `${min / 1440} día(s)`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
```

### Componente: Página Pública de Booking

```typescript
// apps/web/src/components/booking/BookingCalendar.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Globe } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface BookingCalendarProps {
  eventType: {
    id: string;
    title: string;
    description: string;
    duration: number;
    user: {
      name: string;
      image: string;
      timezone: string;
    };
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export function BookingCalendar({ eventType }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Obtener días del mes
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Cargar slots disponibles cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate, timezone]);

  const loadAvailableSlots = async (date: Date) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/availability/slots?eventTypeId=${eventType.id}&date=${format(date, 'yyyy-MM-dd')}&timezone=${timezone}`
      );
      const data = await res.json();
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    if (isBefore(date, startOfDay(new Date()))) return;
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      // Navegar al formulario de confirmación
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      window.location.href = `/booking/confirm?eventTypeId=${eventType.id}&date=${dateStr}&time=${selectedTime}&timezone=${timezone}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Panel izquierdo: Info del evento */}
          <div className="p-6 border-r border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <img
                src={eventType.user.image}
                alt={eventType.user.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="text-sm text-gray-500">{eventType.user.name}</p>
                <h1 className="text-xl font-bold">{eventType.title}</h1>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <span>{eventType.duration} minutos</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Globe className="h-5 w-5" />
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="text-sm border-none bg-transparent focus:ring-0 p-0"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Madrid">Madrid</option>
                </select>
              </div>
            </div>

            {eventType.description && (
              <p className="text-gray-600 text-sm">{eventType.description}</p>
            )}
          </div>

          {/* Panel derecho: Calendario y horarios */}
          <div className="p-6">
            {/* Navegación del mes */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="font-semibold capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h2>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendario */}
            <div className="grid grid-cols-7 gap-1 mb-6">
              {/* Espacios vacíos para alinear el primer día */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {days.map((day) => {
                const isPast = isBefore(day, startOfDay(new Date()));
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateSelect(day)}
                    disabled={isPast}
                    className={`
                      aspect-square flex items-center justify-center rounded-full text-sm
                      transition-colors
                      ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50'}
                      ${isToday(day) ? 'font-bold' : ''}
                      ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {/* Horarios disponibles */}
            {selectedDate && (
              <div>
                <h3 className="font-medium mb-3">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                </h3>

                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Cargando horarios...
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => handleTimeSelect(slot.time)}
                        disabled={!slot.available}
                        className={`
                          py-2 px-3 text-sm rounded-lg border transition-colors
                          ${selectedTime === slot.time
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : slot.available
                            ? 'border-gray-300 hover:border-blue-600 hover:text-blue-600'
                            : 'border-gray-200 text-gray-300 cursor-not-allowed'
                          }
                        `}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    No hay horarios disponibles para este día
                  </p>
                )}
              </div>
            )}

            {/* Botón de confirmación */}
            {selectedDate && selectedTime && (
              <button
                onClick={handleConfirm}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Confirmar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 9. Integraciones Google Detalladas

### Google Calendar Service

```typescript
// apps/api/src/services/google/calendar.service.ts

import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface CalendarEvent {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  attendees?: { email: string }[];
  conferenceData?: {
    createRequest?: { requestId: string };
  };
}

interface FreeBusyQuery {
  timeMin: string;
  timeMax: string;
  calendarIds: string[];
}

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar: calendar_v3.Calendar;

  constructor(account: { access_token: string; refresh_token?: string }) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    // Auto-refresh token
    this.oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        // Guardar nuevo refresh_token en la base de datos
        console.log('New refresh token received');
      }
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Listar todos los calendarios del usuario
   */
  async listCalendars(): Promise<calendar_v3.Schema$CalendarListEntry[]> {
    const response = await this.calendar.calendarList.list();
    return response.data.items || [];
  }

  /**
   * Obtener eventos de un calendario
   */
  async getEvents(
    calendarId: string = 'primary',
    timeMin: Date,
    timeMax: Date
  ): Promise<calendar_v3.Schema$Event[]> {
    const response = await this.calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    return response.data.items || [];
  }

  /**
   * Verificar disponibilidad (Free/Busy)
   */
  async checkFreeBusy(query: FreeBusyQuery): Promise<calendar_v3.Schema$FreeBusyResponse> {
    const response = await this.calendar.freebusy.query({
      requestBody: {
        timeMin: query.timeMin,
        timeMax: query.timeMax,
        items: query.calendarIds.map((id) => ({ id })),
      },
    });
    return response.data;
  }

  /**
   * Verificar si un slot específico está disponible
   */
  async isSlotAvailable(
    startTime: Date,
    endTime: Date,
    calendarIds: string[] = ['primary']
  ): Promise<boolean> {
    const freeBusy = await this.checkFreeBusy({
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      calendarIds,
    });

    // Verificar si hay conflictos en alguno de los calendarios
    for (const calendarId of calendarIds) {
      const calendar = freeBusy.calendars?.[calendarId];
      if (calendar?.busy && calendar.busy.length > 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Crear un nuevo evento
   */
  async createEvent(
    event: CalendarEvent,
    calendarId: string = 'primary'
  ): Promise<calendar_v3.Schema$Event> {
    const response = await this.calendar.events.insert({
      calendarId,
      conferenceDataVersion: event.conferenceData ? 1 : 0,
      sendUpdates: 'all',
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        attendees: event.attendees,
        conferenceData: event.conferenceData,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 10 },
          ],
        },
      },
    });
    return response.data;
  }

  /**
   * Actualizar un evento existente
   */
  async updateEvent(
    eventId: string,
    event: Partial<CalendarEvent>,
    calendarId: string = 'primary'
  ): Promise<calendar_v3.Schema$Event> {
    const response = await this.calendar.events.patch({
      calendarId,
      eventId,
      sendUpdates: 'all',
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        attendees: event.attendees,
      },
    });
    return response.data;
  }

  /**
   * Eliminar/cancelar un evento
   */
  async deleteEvent(
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<void> {
    await this.calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'all',
    });
  }

  /**
   * Configurar webhook para recibir notificaciones de cambios
   */
  async watchCalendar(
    calendarId: string,
    webhookUrl: string,
    channelId: string
  ): Promise<calendar_v3.Schema$Channel> {
    const response = await this.calendar.events.watch({
      calendarId,
      requestBody: {
        id: channelId,
        type: 'web_hook',
        address: webhookUrl,
      },
    });
    return response.data;
  }

  /**
   * Obtener slots disponibles para un día
   */
  async getAvailableSlots(
    date: Date,
    duration: number, // minutos
    availability: { startTime: number; endTime: number }[],
    timezone: string
  ): Promise<string[]> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Obtener eventos ocupados del día
    const events = await this.getEvents('primary', dayStart, dayEnd);

    const busySlots = events.map((event) => ({
      start: new Date(event.start?.dateTime || event.start?.date!),
      end: new Date(event.end?.dateTime || event.end?.date!),
    }));

    const availableSlots: string[] = [];

    // Para cada bloque de disponibilidad
    for (const block of availability) {
      let currentTime = block.startTime; // minutos desde medianoche

      while (currentTime + duration <= block.endTime) {
        const slotStart = new Date(date);
        slotStart.setHours(Math.floor(currentTime / 60), currentTime % 60, 0, 0);

        const slotEnd = new Date(slotStart.getTime() + duration * 60000);

        // Verificar si el slot está libre
        const isOccupied = busySlots.some(
          (busy) => slotStart < busy.end && slotEnd > busy.start
        );

        if (!isOccupied) {
          availableSlots.push(
            slotStart.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: timezone,
            })
          );
        }

        currentTime += 15; // Incrementos de 15 minutos
      }
    }

    return availableSlots;
  }
}
```

### Google Drive Service

```typescript
// apps/api/src/services/google/drive.service.ts

import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Readable } from 'stream';

export class GoogleDriveService {
  private oauth2Client: OAuth2Client;
  private drive: drive_v3.Drive;

  constructor(account: { access_token: string; refresh_token?: string }) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Listar archivos y carpetas
   */
  async listFiles(
    folderId?: string,
    pageSize: number = 20,
    pageToken?: string
  ): Promise<{
    files: drive_v3.Schema$File[];
    nextPageToken?: string;
  }> {
    const query = folderId
      ? `'${folderId}' in parents and trashed = false`
      : 'trashed = false';

    const response = await this.drive.files.list({
      pageSize,
      pageToken,
      q: query,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, iconLink)',
      orderBy: 'folder,name',
    });

    return {
      files: response.data.files || [],
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  /**
   * Crear una carpeta
   */
  async createFolder(
    name: string,
    parentId?: string
  ): Promise<drive_v3.Schema$File> {
    const response = await this.drive.files.create({
      requestBody: {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
      },
      fields: 'id, name, webViewLink',
    });
    return response.data;
  }

  /**
   * Subir un archivo
   */
  async uploadFile(
    name: string,
    content: Buffer | Readable,
    mimeType: string,
    folderId?: string
  ): Promise<drive_v3.Schema$File> {
    const response = await this.drive.files.create({
      requestBody: {
        name,
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType,
        body: content instanceof Buffer ? Readable.from(content) : content,
      },
      fields: 'id, name, webViewLink',
    });
    return response.data;
  }

  /**
   * Descargar un archivo
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    const response = await this.drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    return Buffer.from(response.data as ArrayBuffer);
  }

  /**
   * Compartir un archivo/carpeta
   */
  async shareFile(
    fileId: string,
    email: string,
    role: 'reader' | 'writer' | 'commenter' = 'reader'
  ): Promise<void> {
    await this.drive.permissions.create({
      fileId,
      sendNotificationEmail: true,
      requestBody: {
        type: 'user',
        role,
        emailAddress: email,
      },
    });
  }

  /**
   * Eliminar un archivo/carpeta
   */
  async deleteFile(fileId: string): Promise<void> {
    await this.drive.files.delete({ fileId });
  }

  /**
   * Buscar archivos
   */
  async searchFiles(
    query: string,
    pageSize: number = 20
  ): Promise<drive_v3.Schema$File[]> {
    const response = await this.drive.files.list({
      pageSize,
      q: `name contains '${query}' and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink)',
    });
    return response.data.files || [];
  }
}
```

### Gmail Service

```typescript
// apps/api/src/services/google/gmail.service.ts

import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: boolean;
  attachments?: {
    filename: string;
    content: Buffer;
    mimeType: string;
  }[];
}

export class GmailService {
  private oauth2Client: OAuth2Client;
  private gmail: gmail_v1.Gmail;

  constructor(account: { access_token: string; refresh_token?: string }) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Enviar un email
   */
  async sendEmail(options: EmailOptions): Promise<string> {
    const { to, subject, body, html = true } = options;

    // Construir el mensaje MIME
    const messageParts = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: ${html ? 'text/html' : 'text/plain'}; charset=utf-8`,
      '',
      body,
    ];

    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return response.data.id || '';
  }

  /**
   * Enviar email de confirmación de booking
   */
  async sendBookingConfirmation(booking: {
    guestName: string;
    guestEmail: string;
    eventTitle: string;
    startTime: Date;
    endTime: Date;
    hostName: string;
    meetingLink?: string;
    timezone: string;
  }): Promise<void> {
    const { guestName, guestEmail, eventTitle, startTime, endTime, hostName, meetingLink, timezone } = booking;

    const formattedDate = startTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    });

    const formattedTime = `${startTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    })} - ${endTime.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    })}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0066FF; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; margin-bottom: 10px; }
          .detail-label { font-weight: bold; width: 100px; }
          .button { display: inline-block; background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Reunión Confirmada!</h1>
          </div>
          <div class="content">
            <p>Hola ${guestName},</p>
            <p>Tu reunión con <strong>${hostName}</strong> ha sido confirmada.</p>

            <div class="event-details">
              <h3>${eventTitle}</h3>
              <div class="detail-row">
                <span class="detail-label">📅 Fecha:</span>
                <span>${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🕐 Hora:</span>
                <span>${formattedTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🌍 Zona:</span>
                <span>${timezone}</span>
              </div>
            </div>

            ${meetingLink ? `
              <p>Únete a la reunión con el siguiente enlace:</p>
              <a href="${meetingLink}" class="button">Unirse a Google Meet</a>
            ` : ''}

            <p style="margin-top: 30px;">
              ¿Necesitas cancelar o reprogramar?
              <a href="${process.env.APP_URL}/booking/cancel/${booking}">Haz clic aquí</a>
            </p>
          </div>
          <div class="footer">
            <p>Este email fue enviado por Zcal</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: guestEmail,
      subject: `Confirmado: ${eventTitle} con ${hostName}`,
      body: html,
      html: true,
    });
  }

  /**
   * Enviar email de recordatorio
   */
  async sendReminder(booking: {
    guestName: string;
    guestEmail: string;
    eventTitle: string;
    startTime: Date;
    hostName: string;
    meetingLink?: string;
    timezone: string;
  }): Promise<void> {
    const { guestName, guestEmail, eventTitle, startTime, hostName, meetingLink, timezone } = booking;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; }
          .button { display: inline-block; background: #0066FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⏰ Recordatorio de reunión</h2>
          </div>
          <div class="content">
            <p>Hola ${guestName},</p>
            <p>Te recordamos que tienes una reunión programada:</p>
            <h3>${eventTitle} con ${hostName}</h3>
            <p><strong>Comienza en 1 hora</strong></p>
            ${meetingLink ? `<a href="${meetingLink}" class="button">Unirse ahora</a>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: guestEmail,
      subject: `Recordatorio: ${eventTitle} en 1 hora`,
      body: html,
      html: true,
    });
  }

  /**
   * Enviar email de cancelación
   */
  async sendCancellation(booking: {
    guestName: string;
    guestEmail: string;
    eventTitle: string;
    startTime: Date;
    hostName: string;
    reason?: string;
  }): Promise<void> {
    const { guestName, guestEmail, eventTitle, hostName, reason } = booking;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Reunión Cancelada</h2>
          </div>
          <div class="content">
            <p>Hola ${guestName},</p>
            <p>La reunión <strong>"${eventTitle}"</strong> con ${hostName} ha sido cancelada.</p>
            ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
            <p>Si deseas programar una nueva reunión, visita nuestra página de booking.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: guestEmail,
      subject: `Cancelado: ${eventTitle}`,
      body: html,
      html: true,
    });
  }
}
```

---

## 10. Autenticación OAuth 2.0 con Google

### Configuración de NextAuth.js

```typescript
// apps/web/src/lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/gmail.send',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Permitir acceso a cualquier usuario con cuenta Google verificada
      if (account?.provider === 'google' && profile?.email_verified) {
        return true;
      }
      return false;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        // Obtener datos adicionales del usuario
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            username: true,
            timezone: true,
          },
        });

        if (dbUser) {
          session.user.username = dbUser.username;
          session.user.timezone = dbUser.timezone;
        }
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirigir al dashboard después del login
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },

  pages: {
    signIn: '/login',
    error: '/auth/error',
    newUser: '/onboarding',
  },

  events: {
    async createUser({ user }) {
      // Generar username único basado en email
      const emailUsername = user.email?.split('@')[0] || 'user';
      let username = emailUsername;
      let counter = 1;

      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${emailUsername}${counter}`;
        counter++;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { username },
      });

      // Crear configuración por defecto
      await prisma.userSettings.create({
        data: { userId: user.id },
      });

      // Crear horario por defecto (Lun-Vie 9am-5pm)
      const defaultSchedule = await prisma.schedule.create({
        data: {
          name: 'Horario de trabajo',
          userId: user.id,
          isDefault: true,
        },
      });

      const weekdayAvailability = [1, 2, 3, 4, 5].map((day) => ({
        userId: user.id,
        scheduleId: defaultSchedule.id,
        dayOfWeek: day,
        startTime: 540, // 9:00 AM
        endTime: 1020,  // 5:00 PM
      }));

      await prisma.availability.createMany({
        data: weekdayAvailability,
      });
    },
  },

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  debug: process.env.NODE_ENV === 'development',
};
```

### Página de Login

```typescript
// apps/web/src/app/(auth)/login/page.tsx

'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const error = searchParams.get('error');

  useEffect(() => {
    if (session) {
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">Zcal</h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Bienvenido
          </h2>
          <p className="mt-2 text-gray-600">
            Inicia sesión para gestionar tus reuniones
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error === 'OAuthSignin' && 'Error al iniciar el proceso de autenticación.'}
            {error === 'OAuthCallback' && 'Error al procesar la respuesta de Google.'}
            {error === 'OAuthCreateAccount' && 'Error al crear tu cuenta.'}
            {error === 'Callback' && 'Error en la autenticación.'}
            {error === 'Default' && 'Ocurrió un error inesperado.'}
          </div>
        )}

        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="font-medium text-gray-700">
            Continuar con Google
          </span>
        </button>

        <p className="text-center text-sm text-gray-500">
          Al continuar, aceptas nuestros{' '}
          <a href="/terms" className="text-blue-600 hover:underline">
            Términos de Servicio
          </a>{' '}
          y{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  );
}
```

### Middleware de Protección de Rutas

```typescript
// apps/web/src/middleware.ts

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login');
    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
    const isOnboarding = req.nextUrl.pathname.startsWith('/onboarding');

    // Si está autenticado y trata de ir al login, redirigir al dashboard
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Si está autenticado pero no tiene username, redirigir a onboarding
    if (isDashboard && token && !token.username) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith('/login');
        const isPublicPage =
          req.nextUrl.pathname === '/' ||
          req.nextUrl.pathname.startsWith('/api/public') ||
          /^\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(req.nextUrl.pathname); // páginas de booking públicas

        // Permitir acceso a páginas públicas y de auth sin token
        if (isPublicPage || isAuthPage) {
          return true;
        }

        // Requerir token para el resto
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

---

## 11. Docker y Deployment

### docker-compose.yml

```yaml
version: '3.8'

services:
  # Base de datos PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: zcal-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-zcal}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-zcal_password}
      POSTGRES_DB: ${POSTGRES_DB:-zcal_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-zcal}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis para caché y sesiones
  redis:
    image: redis:7-alpine
    container_name: zcal-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Aplicación Next.js
  web:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    container_name: zcal-web
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${POSTGRES_USER:-zcal}:${POSTGRES_PASSWORD:-zcal_password}@postgres:5432/${POSTGRES_DB:-zcal_db}
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  # Prisma Studio (solo desarrollo)
  prisma-studio:
    build:
      context: .
      dockerfile: Dockerfile
      target: deps
    container_name: zcal-prisma-studio
    command: npx prisma studio
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER:-zcal}:${POSTGRES_PASSWORD:-zcal_password}@postgres:5432/${POSTGRES_DB:-zcal_db}
    ports:
      - "5555:5555"
    depends_on:
      postgres:
        condition: service_healthy
    profiles:
      - dev

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    name: zcal-network
```

### Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Instalar dependencias
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build de la aplicación
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Build de Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Imagen de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copiar build de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar Prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Variables de Entorno para Producción

```env
# .env.production

# Base de datos
DATABASE_URL="postgresql://user:password@host:5432/zcal_production"

# Redis
REDIS_URL="redis://host:6379"

# NextAuth
NEXTAUTH_URL="https://zcal.app"
NEXTAUTH_SECRET="your-production-secret-min-32-chars"

# Google OAuth
GOOGLE_CLIENT_ID="your-production-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-production-client-secret"
GOOGLE_REDIRECT_URI="https://zcal.app/api/auth/callback/google"

# URLs
APP_URL="https://zcal.app"
API_URL="https://api.zcal.app"
```

---

## 12. Prompts de Ejemplo para Claude Code

### Fase 1: Configuración Inicial

```
Prompt: "Inicializa un nuevo proyecto Zcal con Next.js 14, TypeScript, Tailwind CSS,
y Prisma. Configura la estructura de carpetas según la arquitectura definida en
CLAUDE_CODE_INSTRUCTIONS.md. Incluye ESLint, Prettier, y las configuraciones base."
```

### Fase 2: Base de Datos

```
Prompt: "Implementa el esquema de Prisma completo según CLAUDE_CODE_INSTRUCTIONS.md.
Ejecuta la migración inicial y genera el cliente de Prisma. Crea un archivo seed.ts
con datos de prueba para desarrollo."
```

### Fase 3: Autenticación

```
Prompt: "Configura NextAuth.js con Google OAuth según las especificaciones.
Implementa la página de login, el middleware de protección de rutas, y la página
de onboarding para nuevos usuarios. Asegúrate de que cualquier usuario con cuenta
Google verificada pueda acceder."
```

### Fase 4: Dashboard

```
Prompt: "Crea el layout del dashboard con navegación lateral y las páginas principales:
- Dashboard home con métricas
- Lista de bookings (upcoming/past)
- Gestión de event types
- Editor de disponibilidad
- Configuración del perfil"
```

### Fase 5: Event Types

```
Prompt: "Implementa el CRUD completo de Event Types con:
- Lista de event types del usuario
- Formulario de creación/edición
- Previsualización del link público
- Configuración de duración, ubicación, y buffers"
```

### Fase 6: Disponibilidad

```
Prompt: "Implementa el editor de disponibilidad con:
- Selector de días de la semana
- Múltiples bloques de tiempo por día
- Función de copiar a todos los días
- Guardado automático
- Zona horaria del usuario"
```

### Fase 7: Páginas Públicas de Booking

```
Prompt: "Crea las páginas públicas de booking:
- /[username] - perfil público con lista de event types
- /[username]/[eventSlug] - calendario de reserva
- Formulario de confirmación con datos del invitado
- Verificación de disponibilidad en tiempo real"
```

### Fase 8: Integración Google Calendar

```
Prompt: "Implementa GoogleCalendarService con:
- Verificación de free/busy
- Creación automática de eventos
- Generación de enlaces Google Meet
- Sincronización bidireccional"
```

### Fase 9: Notificaciones

```
Prompt: "Implementa el sistema de emails con GmailService:
- Email de confirmación de booking
- Email de recordatorio (1 hora antes)
- Email de cancelación
- Plantillas HTML responsivas"
```

### Fase 10: Docker y Deployment

```
Prompt: "Configura Docker para el proyecto:
- Dockerfile multi-stage optimizado
- docker-compose.yml con Postgres, Redis, y la app
- Scripts de inicio y healthchecks
- Variables de entorno para producción"
```

---

## Comandos Útiles

```bash
# Desarrollo
pnpm dev                    # Iniciar en modo desarrollo
pnpm db:push               # Push schema a la base de datos
pnpm db:studio             # Abrir Prisma Studio
pnpm db:seed               # Ejecutar seeds

# Docker
docker-compose up -d       # Iniciar servicios
docker-compose logs -f web # Ver logs de la app
docker-compose down        # Detener servicios

# Producción
pnpm build                 # Build de producción
pnpm start                 # Iniciar en producción

# Testing
pnpm test                  # Ejecutar tests
pnpm test:e2e             # Tests end-to-end
```

---

## Recursos Adicionales

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
