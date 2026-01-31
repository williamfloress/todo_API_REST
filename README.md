# TODO API v2

API REST para gestión de tareas desarrollada con NestJS y PostgreSQL. Este proyecto usa consultas SQL nativas con el driver `pg` en lugar de un ORM.

## Sobre el proyecto

Estoy desarrollando esta API siguiendo una arquitectura modular con NestJS. La idea es tener un backend completo para un sistema de tareas con usuarios, categorías y comentarios. Por ahora llevo implementada la configuración base y la conexión a la base de datos.

**Stack:**
- NestJS + TypeScript
- PostgreSQL (consultas SQL nativas)
- JWT para autenticación (pendiente)
- Swagger para documentación (pendiente)

**Estado actual:** Checkpoint 1.5 completado - Conexión a BD funcionando

## Instalación

Clonar el proyecto e instalar dependencias:

```bash
npm install
```

Crear base de datos en PostgreSQL:
```bash
createdb -U postgres todo_udo
```

Configurar archivo `.env` en la raíz:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=todo_udo

JWT_SECRET=clave_secreta_larga
JWT_EXPIRES_IN=24h

PORT=3000
```

## Uso

Ejecutar en modo desarrollo:
```bash
npm run start:dev
```

El servidor arranca en `http://localhost:3000`

Puedes probar que funcione con:
```bash
curl http://localhost:3000/test-db
```

Debería devolver la hora actual y la versión de PostgreSQL.

## Estructura básica

```
src/
├── main.ts                     # Entry point
├── app.module.ts               # Módulo principal
├── app.controller.ts           # Controlador con endpoints de prueba
└── database/
    ├── database.module.ts      # Módulo de BD (global)
    └── database.service.ts     # Pool de conexiones y queries
```

El `DatabaseService` tiene métodos para:
- `query()` - ejecutar consultas SQL parametrizadas
- `transaction()` - manejar transacciones
- `getClient()` - obtener un cliente del pool

## Problemas comunes

Si falla la conexión a la BD, revisar:
1. PostgreSQL está corriendo
2. Las credenciales en `.env` son correctas
3. La base de datos `todo_udo` existe

Si el puerto 3000 está ocupado, cambiar `PORT` en `.env`

## Siguiente paso

Crear el schema DDL con todas las tablas (usuarios, tareas, categorías, comentarios).

