# TODO API v2 - Backend NestJS + PostgreSQL

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Descripción del Proyecto

API REST completa para gestión de tareas (To-Do List) desarrollada con **NestJS** y **PostgreSQL**.

Este proyecto implementa una arquitectura limpia con consultas SQL nativas (sin ORM) utilizando el driver `pg` 
y un pool de conexiones para optimizar el rendimiento.

### Características Principales

- **Framework:** NestJS (Node.js + TypeScript)
- **Base de Datos:** PostgreSQL con consultas SQL nativas
- **Pool de Conexiones:** Gestión eficiente con `pg.Pool`
- **Autenticación:** JWT + Bcrypt (próximamente en Fase 2)
- **Validación:** class-validator y class-transformer
- **Documentación:** Swagger/OpenAPI (próximamente en Fase 6)
- **Variables de Entorno:** @nestjs/config

### Modelo de Datos (MER v2)

El sistema gestiona las siguientes entidades:
- **USER:** Usuarios del sistema
- **TASK:** Tareas con estados (pending, in_progress, completed, cancelled)
- **CATEGORY:** Categorías con colores HEX
- **COMMENTARY:** Comentarios en las tareas
- **TASK_CATEGORY:** Relación N:M entre tareas y categorías

### Progreso de Implementación

✅ **FASE 1 - Configuración e Infraestructura (Checkpoint 1.5 completado)**
- [x] Proyecto NestJS inicializado
- [x] Dependencias instaladas (pg, config, validators, swagger)
- [x] Base de datos PostgreSQL (`todo_udo`)
- [x] Variables de entorno configuradas
- [x] DatabaseService con Pool implementado
- [ ] Schema DDL (Checkpoint 1.6 - Próximo)

⏳ **Próximas Fases:**
- Fase 2: Usuarios y Autenticación
- Fase 3: Categorías
- Fase 4: Tareas (Módulo Central)
- Fase 5: Comentarios
- Fase 6: Swagger
- Fase 7: Testing con Postman
- Fase 8: Refinamiento

## Estructura del Proyecto

```
todo_api-rest/
├── src/
│   ├── main.ts                    # Punto de entrada de la aplicación
│   ├── app.module.ts              # Módulo raíz
│   ├── app.controller.ts          # Controlador principal con endpoints de prueba
│   ├── app.service.ts             # Servicio principal
│   └── database/
│       ├── database.module.ts     # Módulo de base de datos (Global)
│       └── database.service.ts    # Servicio con Pool y métodos helper
├── .env                           # Variables de entorno (NO subir a Git)
├── package.json                   # Dependencias del proyecto
└── README.md                      # Este archivo
```

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v18 o superior)
- **npm** (v9 o superior)
- **PostgreSQL** (v14 o superior)
- **NestJS CLI** (instalado globalmente)

```bash
# Instalar NestJS CLI globalmente
npm i -g @nestjs/cli
```

## Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Base de Datos

**Opción A - Desde pgAdmin:**
1. Abre pgAdmin y conéctate a tu servidor PostgreSQL
2. Click derecho en "Databases" → "Create" → "Database"
3. Nombre: `todo_udo`
4. Owner: `postgres`
5. Guardar

**Opción B - Desde Terminal:**
```bash
createdb -U postgres todo_udo
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_DATABASE=todo_udo

# JWT (para autenticación - Fase 2)
JWT_SECRET=tu_clave_secreta_super_larga_y_aleatoria
JWT_EXPIRES_IN=24h

# Puerto del servidor
PORT=3000
```

**IMPORTANTE:** 
- Reemplaza `tu_contraseña_aqui` con tu contraseña real de PostgreSQL
- Genera una clave segura para `JWT_SECRET`
- Este archivo `.env` NO debe subirse a Git (ya está en `.gitignore`)

## Ejecutar la Aplicación

```bash
# Modo desarrollo (con hot-reload)
npm run start:dev

# Modo desarrollo normal
npm run start

# Modo producción
npm run start:prod
```

La aplicación estará disponible en: `http://localhost:3000`

## Endpoints Disponibles (Checkpoint 1.5)

### Endpoints de Prueba

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Mensaje de bienvenida |
| GET | `/test-db` | Verifica conexión a PostgreSQL |

**Ejemplo de prueba:**
```bash
# Verificar que el servidor está corriendo
curl http://localhost:3000

# Verificar conexión a la base de datos
curl http://localhost:3000/test-db
```

Respuesta esperada de `/test-db`:
```json
{
  "status": "success",
  "message": "Conexión a base de datos exitosa",
  "data": {
    "current_time": "2024-01-31T...",
    "db_version": "PostgreSQL 14.x..."
  }
}
```

## Scripts Disponibles

```bash
# Desarrollo
npm run start:dev        # Inicia servidor con hot-reload
npm run start:debug      # Inicia en modo debug

# Build
npm run build            # Compila el proyecto

# Formateo y Linting
npm run format           # Formatea el código con Prettier
npm run lint             # Ejecuta ESLint y corrige errores

# Testing (próximamente)
npm run test             # Ejecuta tests unitarios
npm run test:watch       # Tests en modo watch
npm run test:cov         # Tests con cobertura
npm run test:e2e         # Tests end-to-end
```

## Arquitectura del Código

### DatabaseService

El corazón del acceso a datos. Proporciona:

```typescript
// Consultas SQL parametrizadas (previene SQL injection)
await databaseService.query('SELECT * FROM users WHERE email = $1', [email]);

// Transacciones (garantiza atomicidad)
await databaseService.transaction(async (client) => {
  await client.query('INSERT INTO users ...');
  await client.query('INSERT INTO tasks ...');
});

// Cliente individual del pool
const client = await databaseService.getClient();
```

**Características:**
- Pool de conexiones (max: 20 conexiones simultáneas)
- Logging de consultas con tiempos de ejecución
- Manejo automático de errores
- Lifecycle hooks (inicialización y cierre)

### Módulos y Servicios

Todos los archivos del proyecto están **comentados al detalle** incluyendo:
- Descripción del propósito del archivo
- Explicación de cada función/método importante
- Notas sobre decisiones de diseño
- Ejemplos de uso donde sea relevante

## Solución de Problemas

### Error: "Database connection failed"

1. Verifica que PostgreSQL esté corriendo
2. Confirma las credenciales en el archivo `.env`
3. Asegúrate de que la base de datos `todo_udo` existe

```bash
# Verificar si PostgreSQL está corriendo (Windows)
Get-Service postgresql*

# Verificar desde psql
psql -U postgres -d todo_udo
```

### Error: "Port 3000 is already in use"

Cambia el puerto en el archivo `.env`:
```env
PORT=3001
```

### Error: "Cannot find module '@nestjs/config'"

Reinstala las dependencias:
```bash
npm install
```

## Próximos Pasos (Roadmap)

Consulta el archivo `documentacion-v2/IMPLEMENTATION_GUIDE_V2.md` para ver:
- Guía detallada paso a paso de cada checkpoint
- Código completo de cada fase
- Instrucciones de testing
- Mejores prácticas

**Próximo checkpoint:** 1.6 - Crear archivo DDL (`schema.sql`) con todas las tablas

## Recursos y Documentación

### Documentación Oficial

- [NestJS Documentation](https://docs.nestjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg)](https://node-postgres.com/)

### Stack Tecnológico

- **NestJS:** Framework progresivo de Node.js
- **TypeScript:** Superset de JavaScript con tipado estático
- **PostgreSQL:** Base de datos relacional robusta
- **pg:** Driver de PostgreSQL para Node.js
- **JWT:** JSON Web Tokens para autenticación
- **Bcrypt:** Hash seguro de contraseñas
- **Swagger:** Documentación automática de API

## Contribución

Este proyecto sigue la guía de implementación oficial V2.
Cada checkpoint debe completarse en orden para garantizar la correcta construcción del sistema.

## Licencia

Este proyecto es privado y con fines educativos.
