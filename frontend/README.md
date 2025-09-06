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

- ### Software Necesario
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

### Software Necesario
- Docker instalado ([Descargar Docker](https://www.docker.com/get-started)).

---

## 🚀 Ejecutar la Aplicación con Docker

### Para Usuarios con Experiencia en Docker
1. **Descargar la imagen** (si está disponible en un registro):  
   ```bash
   docker pull [nombre-imagen]

2. **Ejecutar el contenedor**:  
   ```bash
   docker run -d -p 80:80 --name gallery-app [nombre-imagen]

3. **Acceder a la aplicación en**: http://localhost:80 

---
### Para Usuarios sin Experiencia en Docker
1. **Instalar Docker**
Windows/macOS:
Descargar Docker Desktop desde la página oficial y seguir el asistente de instalación.
**Link para instalar windows:**https://docs.docker.com/desktop/setup/install/windows-install/
**Link para instalar en MacOs:**https://docs.docker.com/desktop/setup/install/mac-install/
Linux (Ubuntu):
   ```bash
   sudo apt-get update && sudo apt-get install docker.io
   sudo systemctl start docker
   sudo systemctl enable docker

2. **Ejecutar el Contenedor**
Descargar y ejecutar la imagen:
   ```bash
   docker run -d -p 80:80 --name gallery-app tu-usuario/imagen-galería:latest

3. **Acceder a la Aplicación**
Abre tu navegador e ingresa a:
http://localhost:80

4. **Verificar estado:**
   ```bash
   docker ps  # Debe mostrar el contenedor en ejecución.
   
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

Álbumes:
Crea álbumes personalizados y organiza tus imágenes arrastrándolas.

Etiquetado:
Marca imágenes como favoritas (⭐) o archívalas para ocultarlas temporalmente.

3. Imágenes Privadas
Protección con clave:
Al subir una imagen, activa "Privada" y define una clave de acceso.

Visualizar privadas:
Ingresa la clave al intentar abrir una imagen protegida.

4. Perfil de Usuario
Editar datos:
En "Configuración", actualiza tu nombre, correo o contraseña.

Seguridad:
Recibirás un correo de confirmación al cambiar datos sensibles.


