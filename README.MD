# GlowPic Gallery Application

Aplicación web moderna para almacenamiento y gestión de archivos multimedia, construida con FastAPI y Angular. Este proyecto implementa una arquitectura de microservicios que separa el backend y frontend en contenedores independientes.

## Descripción General

GlowPic Gallery es una plataforma que permite a los usuarios:
- Gestionar archivos multimedia en la nube
- Organizar contenido en álbumes y carpetas
- Compartir contenido de forma segura
- Administrar perfiles de usuario y configuraciones

La aplicación está construida usando:
- Backend: FastAPI (Python)
- Frontend: Angular
- Base de datos: SQLite (Turso)
- Almacenamiento: Cloudinary
- Cache: Redis

## Requisitos Previos

### Software Necesario
- Docker Engine 20.10.x o superior
- Docker Compose v2.x o superior
- Git

### Verificación de Requisitos
```bash
# Verificar versión de Docker
docker --version

# Verificar versión de Docker Compose
docker compose version
```

## Componentes del Proyecto

El proyecto está dividido en dos componentes principales, cada uno con su propia documentación detallada y para levantar individualmente:

- [Backend API Documentation](./backend/README.md)
  - FastAPI REST API
  - Gestión de usuarios y autenticación
  - Almacenamiento en la nube
  - rate limiting

- [Frontend Application Documentation](./frontend/README.md)
  - Interfaz de usuario en Angular
  - Gestión de estado
  - Componentes reutilizables
  - Rutas y navegación

## Despliegue con Docker Compose

1. Clonar el repositorio
```bash
git clone https://github.com/KadirQuintero03/glowpic-gallery-app.git
cd glowpic-gallery-app
```

2. Construir y levantar los servicios
```bash
docker compose up --build -d
```

## Puertos y Endpoints

### Puertos por Defecto
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- Documentación API: http://localhost:8080/docs

### Pruebas Rápidas

1. Verificar que el backend está funcionando:
```bash
curl http://localhost:8080/health
```

2. Verificar que el frontend está funcionando:
```bash
curl http://localhost:4200
```

3. Probar el registro de usuario:
```bash
curl -X POST http://localhost:8080/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'
```

## Detener los Servicios

Para detener todos los servicios:
```bash
docker compose down
```

Para detener y eliminar volúmenes:
```bash
docker compose down -v
```

## Mantenimiento

### Logs de los Servicios
```bash
# Ver logs del backend
docker compose logs backend

# Ver logs del frontend
docker compose logs frontend

# Ver logs en tiempo real
docker compose logs -f
```

### Reiniciar Servicios
```bash
# Reiniciar un servicio específico
docker compose restart backend
docker compose restart frontend

# Reiniciar todos los servicios
docker compose restart
```

## Problemas Comunes

1. **Los puertos están en uso**
   - Verificar que los puertos 4200 y 8080 estén disponibles
   - Modificar los puertos en docker-compose.yml si es necesario

2. **Problemas de permisos con Docker**
   - Asegurarse de que el usuario actual pertenece al grupo docker
   - Ejecutar los comandos con sudo si es necesario

3. **Problemas de red**
   - Verificar que la red de Docker está funcionando correctamente
   - Comprobar que no hay conflictos con VPNs o firewalls
