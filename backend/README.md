# 🎬 glowpic-gallery API

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Turso](https://img.shields.io/badge/Turso-4F46E5?style=for-the-badge&logo=sqlite&logoColor=white)](https://turso.tech/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

> **Backend moderno para gestión de usuarios y almacenamiento de archivos multimedia**

Un proyecto backend desarrollado con **FastAPI** que implementa principios de **Clean Architecture**, **SOLID** y patrones de diseño para la gestión eficiente de usuarios y archivos multimedia.

##  Características Principales

- **Gestión de usuarios** con autenticación segura
- **Almacenamiento multimedia** en la nube (Cloudinary)
- **Consultas paginadas** para optimizar rendimiento
- **Arquitectura limpia** y modular
- **Documentación automática** con Swagger/OpenAPI
- **Estructura escalable** y mantenible
- **Base de datos SQLite** en la nube con Turso

##  Stack Tecnológico

| Tecnología | Propósito | Versión |
|------------|-----------|---------|
| **FastAPI** | Framework web asíncrono | 0.110.0+ |
| **Python** | Lenguaje principal | 3.11+ |
| **Uvicorn** | Servidor ASGI | 0.29.0+ |
| **Cloudinary** | Almacenamiento multimedia | - |
| **Turso** | Base de datos SQLite en la nube | - |

##  Patrones de Diseño y Características Avanzadas

### Patrones de Diseño Implementados

- **Repository Pattern**: Abstracción del acceso a datos, permitiendo cambiar la fuente de datos sin afectar la lógica de negocio.
- **Factory Pattern**: Implementado en `response_factory.py` para la creación de respuestas HTTP estandarizadas.
- **Adapter Pattern**: Utilizado en `cloudinary_adapter.py` para integrar el servicio de Cloudinary.
- **Strategy Pattern**: Aplicado en el sistema de autenticación para soportar diferentes métodos.
- **Singleton Pattern**: Utilizado en las conexiones a bases de datos y servicios externos.

### Middleware y Características Avanzadas

| Característica | Descripción | Ubicación |
|---------------|-------------|------------|
| **Rate Limiting** | Control de tasa de peticiones por usuario/IP | `security/rate_limiting/` |
| **Idempotencia** | Prevención de operaciones duplicadas | `security/idempotency/` |
| **Paginación** | Implementación de consultas paginadas | 
| **Validación JWT** | Middleware de autenticación con tokens | `security/jwt/` |
| **Validación de Datos** | Middleware de validación de entrada | `shared/middleware/` |

### Características de Seguridad

- **Encriptación de Contraseñas**: Implementación segura con bcrypt
- **Sanitización de Entrada**: Validación y limpieza de datos entrantes
- **Headers de Seguridad**: Implementación de headers CORS y seguridad
- **Rate Limiting por IP**: Protección contra ataques de fuerza bruta
- **Manejo de Tokens**: Sistema robusto de JWT con refresh tokens

## 🏗️ Arquitectura del Proyecto

El proyecto sigue principios de **Clean Architecture** con separación clara de responsabilidades:

```
StorageMultimedia/
├── src/
│   ├── frameworks/
│   │   └── fastApi/           # 🌐 Infraestructura web (FastAPI)
│   │       ├── main.py        # Punto de entrada de la aplicación
│   │       └── config/        # Configuraciones
│   └── feature/
│       └── User/              # 👥 Módulo de usuarios
│           ├── controller/    # 🎮 Controladores HTTP
│           ├── routes/        # 🛣️ Definición de endpoints
│           ├── caseUse/       # 💼 Casos de uso (lógica de negocio)
│           ├── entities/      # 🏛️ Entidades del dominio
│           ├── repository/    # 🗄️ Acceso a datos
│           └── services/      # 🔧 Servicios auxiliares
├── requirements.txt           # 📦 Dependencias
├── .env.example              # 🔐 Variables de entorno ejemplo
└── README.md                 # 📖 Documentación
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Python 3.11 o superior
- Git
- Docker: Versión 20.10 o superior
- Docker Compose: Versión 2.0 o superior

### Instalación Local con Docker

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/KadirQuintero03/glowpic-gallery-app.git
   cd backend
   ```

2. **Configuración del entorno**
   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus configuraciones si tienes otras 
   # Solo si tienes tus propias credenciales
   ```

3. **Usando Docker directamente**
   ```bash
   # Construir la imagen
   docker build -t glowpic-api:latest .

   # Ejecutar el contenedor
   docker run -d --name glowpic-api -p 8080:8080 --env-file .env glowpic-api:latest
   ```

### ✅ Verificación de Instalación

Una vez iniciado el servidor con docker, verifica que todo funcione correctamente:

- **Servidor local:** [http://localhost:8080](http://localhost:8080)
- **Documentación:** [http://localhost:8080/docs](http://localhost:8080/docs)
- **Health check:** `GET http://localhost:8080/health`

## 📚 Uso de la API

### Endpoints Principales

#### 👥 Gestión de Usuarios

```http
POST /api/v1/users/register
Content-Type: application/json

{
  "username": "usuario_ejemplo",
  "email": "user@example.com",
  "password": "password123"
}
```

#### 📁 Gestión de Archivos

```http
POST /api/v1/multimedia/upload
Content-Type: multipart/form-data

file: [archivo_multimedia]
user_id: 123
title: "Mi archivo"
description: "Descripción del archivo"
```

#### 📄 Consulta Paginada

```http
GET /api/v1/multimedia?page=1&limit=10&user_id=123
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": 1,
			"public_id": "adasfasfasfasf",
			"resource_type": "image",
			"created_at": "2025-08-01T20:34:50.835752",
			"url": "https://res.cloudinary.com",
			"thumbnail_url": "https://res.cloudinary.com"
		}
  ]
}
```

### Códigos de Respuesta HTTP

| Código | Descripción |
|--------|-------------|
| `200` | Operación exitosa |
| `201` | Recurso creado |
| `400` | Solicitud inválida |
| `401` | No autorizado |
| `404` | Recurso no encontrado |
| `422` | Error de validación |
| `500` | Error interno del servidor |

## 🔧 Desarrollo

### Agregar Nueva Funcionalidad

1. Crea un nuevo módulo en `src/feature/NuevoModulo/`
2. Implementa los casos de uso en `caseUse/`
3. Crea los controladores en `controller/`
4. Define las rutas en `routes/`
5. Actualiza `requirements.txt` si es necesario

### Estándares de Código

- Seguir principios **SOLID**
- Usar **Type Hints** en Python
- Documentar funciones complejas
- Mantener separación de responsabilidades

## 🤝 Contribución

1. Fork del proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Roadmap

- [ ] Tests unitarios y de integración
- [ ] Documentación de API más detallada
- [ ] Sistema de notificaciones
- [ ] Cache con Redis
- [ ] Métricas y monitoreo


## 📧 Contacto

- **GitHub:** [@david123456858](https://github.com/david123456858)
- **LinkedIn:** [@JuanPeralta](www.linkedin.com/in/juan-david-peralta-fuentes-a7a944268)
- **Email:** juandavidperaltafuentes@gmail.com 

