# PRD – Sistema de Cargas con QR, Bluetooth y Offline

## 1. Objetivo

Desarrollar un sistema **web + aplicación móvil** para registrar **cargas llenas** realizadas por pipas propiedad de la empresa, identificando **vehículos del cliente mediante QR**, leyendo **cuentalitros LCQI vía Bluetooth**, operando **100% offline en mina**, y generando **evidencia completa** (horómetro/odómetro, fotos, firma).

---

## 2. Alcance

### Incluye

* App móvil Android (offline-first)
* Sistema web administrativo
* Integración Bluetooth con LCQI
* Lectura QR offline
* Evidencia (fotos + firma)
* Sincronización diferida

### No incluye (v1)

* Login de operador
* GPS en tiempo real
* Facturación
* Ruteo/GPS de pipas

---

## 3. Usuarios

* **Operador de pipa**: ejecuta cargas desde la app (sin login)
* **Administrador interno**: gestiona pipas, LCQI, clientes y reportes
* **Cliente** (opcional web): registra sus vehículos y genera QR

---

## 4. Flujo Funcional – App Móvil

### 4.1 Inicio

* App abre directamente
* Botón único: **CARGAS**

### 4.2 Lectura QR (offline)

* Cámara se abre automáticamente
* Se lee QR del **vehículo del cliente**
* Validación contra catálogo local

### 4.3 Datos del Vehículo

* Mostrar: cliente, tipo (maquinaria/camión), ID del vehículo
* Captura: **horómetro u odómetro** (configurable)

### 4.4 Evidencia Fotográfica

* Mínimo 1 foto, máximo configurable
* Fotos sugeridas por tipo (vehículo, horómetro, LCQI)
* Guardado local con compresión

### 4.5 Inicio de Carga

* Conexión Bluetooth al LCQI
* Validación de dispositivo
* Lectura inicial automática

### 4.6 Carga en Proceso

* Visualización de litros/estado
* Bloqueo de navegación

### 4.7 Fin de Carga (automático)

* Detección por flujo = 0
* Lectura final
* Cálculo de litros
* Validación de tolerancia

### 4.8 Firma

* Captura de firma táctil
* Campo nombre del responsable

### 4.9 Resumen y Cierre

* Resumen completo
* Estado: OK / Observación / Anómalo
* Guardado local como **Pendiente de sincronizar**

---

## 5. Reglas de Negocio

* Todas las cargas son **carga llena**
* No se puede iniciar carga sin QR válido
* Fotos y firma son obligatorias
* Tolerancia de litros configurable
* Anomalías requieren comentario
* No se permite edición posterior

---

## 6. Offline & Sincronización

* Base local (SQLite)
* Cola de sincronización
* Reintentos automáticos
* Indicador visual de pendientes

---

## 7. Sistema Web

### 7.1 Administración

* Alta de pipas
* Alta de LCQI
* Alta de clientes
* Alta de vehículos del cliente
* Generación de QR por vehículo

### 7.2 Reportes

* Cargas por cliente
* Cargas por vehículo
* Litros por periodo
* Anomalías
* Exportación (CSV/PDF)

---

## 8. Modelo de Datos (simplificado)

* Pipa
* LCQI
* Cliente
* VehiculoCliente
* Carga
* Evidencia (fotos, firma)

---

## 9. Arquitectura del Sistema

### 9.1 Enfoque Arquitectónico

El sistema será un **monolito centralizado**, con una sola base de código de backend y una sola base de datos, consumido por **tres clientes separados**:

* Frontend Web (administración)
* Aplicación Móvil (operación en campo)
* API Backend (núcleo del sistema)

No se utilizará arquitectura de microservicios en v1.

---

### 9.2 Backend (Monolito)

* Backend único con capas internas:

  * Controladores (API REST)
  * Servicios (lógica de negocio)
  * Dominio (reglas y validaciones)
  * Persistencia (ORM / queries)
* Una sola base de datos relacional
* Un solo sistema de autenticación (aunque la app no use login)

Funciones del backend:

* Gestión de pipas, LCQI, clientes y vehículos
* Validaciones de negocio
* Recepción de cargas sincronizadas
* Generación de reportes
* Almacenamiento de evidencias

---

### 9.3 Frontend Web

* Aplicación web independiente
* Consume el backend vía API REST
* Funciones:

  * Administración
  * Catálogos
  * Generación de QR
  * Reportes y exportaciones

---

### 9.4 Aplicación Móvil

* Aplicación independiente (React Native)
* Consume el backend vía API REST
* Funciones:

  * Operación offline
  * Bluetooth LCQI
  * Lectura QR
  * Evidencias y firma
* La lógica crítica de la carga ocurre en la app y se valida en backend al sincronizar

---

### 9.5 Comunicación

* Web ↔ Backend: HTTPS / REST
* Mobile ↔ Backend: HTTPS / REST (cuando hay señal)
* Mobile ↔ LCQI: Bluetooth

---

## 10. Stack Tecnológico y Despliegue

### 10.1 Stack

| Componente | Tecnología |
|------------|------------|
| **Backend** | Node.js + Express + TypeScript |
| **ORM** | Prisma |
| **Base de datos** | PostgreSQL (Supabase) |
| **Almacenamiento** | Supabase Storage (fotos, firmas) |
| **Auth** | Supabase Auth (admin web) |
| **Frontend Web** | React + Vite + TypeScript |
| **App Móvil** | React Native + Expo |
| **DB Local Móvil** | SQLite (expo-sqlite) |

### 10.2 Infraestructura de Despliegue

| Servicio | Plataforma | Descripción |
|----------|------------|-------------|
| **Backend API** | Railway | Despliegue del servidor Node.js |
| **Base de datos** | Supabase | PostgreSQL gestionado |
| **Storage** | Supabase Storage | Almacenamiento de archivos (fotos, firmas) |
| **Auth** | Supabase Auth | Autenticación para panel web |
| **Frontend Web** | Railway (static) | Hosting del frontend React |

### 10.3 Configuración de Entornos

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCCIÓN                              │
├─────────────────────────────────────────────────────────────┤
│  Railway                    │  Supabase                     │
│  ├── Backend API            │  ├── PostgreSQL               │
│  └── Frontend Web (static)  │  ├── Storage (evidencias)     │
│                             │  └── Auth                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DESARROLLO                              │
├─────────────────────────────────────────────────────────────┤
│  Local                      │  Supabase (proyecto dev)      │
│  ├── Backend (localhost)    │  ├── PostgreSQL               │
│  ├── Frontend (localhost)   │  ├── Storage                  │
│  └── App (Expo Go)          │  └── Auth                      │
└─────────────────────────────────────────────────────────────┘
```

### 10.4 Variables de Entorno

**Backend (Railway)**
```env
DATABASE_URL=postgresql://...@supabase.co:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...
JWT_SECRET=xxx
NODE_ENV=production
PORT=3000
```

**Frontend Web**
```env
VITE_API_URL=https://api.railway.app
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**App Móvil**
```env
API_URL=https://api.railway.app
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

### 10.5 CI/CD

* **Railway**: Despliegue automático desde rama `main`
* **Supabase**: Migraciones gestionadas con Prisma
* **App Móvil**: Build con EAS (Expo Application Services)

---

## 11. Seguridad y Auditoría

* ID único por carga (UUID)
* Identificación de dispositivo
* Registro de fechas/horas (timestamps)
* Integridad de evidencia (checksums)
* RLS (Row Level Security) en Supabase
* API Keys rotativas

---

## 12. Métricas de Éxito

* % cargas sincronizadas
* % anomalías detectadas
* Tiempo promedio por carga
* Reducción de errores vs sistema anterior

---

## 13. Roadmap

* **v1**: Flujo completo offline + web admin
* **v1.1**: PDFs automáticos
* **v2**: GPS opcional, permisos, clientes con acceso

---

## 14. Riesgos

* Inestabilidad Bluetooth
* Pérdida de datos offline
* Uso indebido de QR

### Mitigación

* Reintentos BT
* Guardado por paso
* Validaciones duras

---

## 15. Estructura del Proyecto

```
rdiesel/
├── apps/
│   ├── api/                 # Backend Node.js + Express
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── utils/
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   ├── web/                 # Frontend React + Vite
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   └── mobile/              # App React Native + Expo
│       ├── src/
│       │   ├── screens/
│       │   ├── components/
│       │   ├── services/
│       │   ├── hooks/
│       │   └── utils/
│       ├── app.json
│       └── package.json
│
├── packages/
│   └── shared/              # Tipos y utilidades compartidas
│       ├── src/
│       │   ├── types/
│       │   └── constants/
│       └── package.json
│
├── package.json             # Workspace root
├── pnpm-workspace.yaml
├── .gitignore
└── README.md
```

---

## 16. Aprobación

Este PRD define el alcance funcional y técnico del sistema para iniciar diseño y desarrollo.
