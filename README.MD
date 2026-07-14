# Galería de Imágenes GlowPic 🖼️

Aplicación web para gestión de imágenes con funciones avanzadas como autenticación de usuarios, carga de imágenes, álbumes personalizados, etiquetado de favoritos, imágenes privadas con clave y configuración de perfil. Desplegada en Docker con Nginx.

---

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

## 📋 Requisitos Previos

### Conocimientos Básicos Recomendados
- Familiaridad con línea de comandos (CLI).
- Conceptos básicos de Docker (imágenes, contenedores, puertos).

### Software Necesario
- Docker Engine 20.10.x o superior
- Docker Compose v2.x o superior
- Git
- Node.js 18+
- npm
- Angular +V16

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar en modo desarrollo:
```bash
ng s --o
```

La aplicación estará disponible en `http://localhost:4200`

## 🐳 Despliegue con Docker

### Software Necesario
- Docker instalado ([Descargar Docker](https://www.docker.com/get-started)).

### Verificación de Requisitos
```bash
# Verificar versión de Docker
docker --version
```

### Construcción de la imagen

```bash
docker build --t frontend .
```

### Verificar que la imagen se haya construido
```bash
docker images
```

### Ejecución del contenedor en primer plano

```bash
docker run -p 4200:4200 frontend
```

### Ejecución del contenedor en segundo plano

```bash
docker run -d -p 4200:4200 --name mi-contenedor frotend
```

**Explicacion de los parametros:**
- `-d`: Ejecuta en segundo plano
- `-p 4200:4200`: Mapea puerto 4200 del host al 80 del contenedor


### Ver que el contenedor se este ejecutando correctamente
```bash
docker ps
```


### Si queremos detener el contenedor usamos
```bash
docker stop mi-contenedor
```

### Acceder a la aplicación en**: http://localhost:4200 

---

### 📖 Manual de Usuario
1. Autenticación
Registro:
Ingresa correo, nombre de usuario y contraseña para crear una cuenta.

Inicio de sesión:
Usa tu correo y contraseña registrados.

2. Gestión de Imágenes
Subir imágenes:
Haz clic en "Subir" y selecciona archivos desde tu dispositivo.




