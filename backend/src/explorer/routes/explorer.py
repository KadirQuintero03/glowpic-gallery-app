import os
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse

# ── Raíz absoluta donde el bot de Telegram guarda todo ──────────────
# Debe coincidir EXACTAMENTE con FILES_STORAGE_PATH del bot (.env del bot).
# Ejemplo real si el bot corre en /home/usuario/telegram-Bot con
# FILES_STORAGE_PATH=./filesBotTelegram:
#   BASE_STORAGE_PATH = "/home/usuario/telegram-Bot/filesBotTelegram"
BASE_STORAGE_PATH = os.path.abspath(
    os.environ.get("BOT_FILES_STORAGE_PATH", "/ruta/absoluta/a/filesBotTelegram")
)

route = APIRouter(prefix="/explorer", tags=["Explorer"])


def _resolve_safe_path(relative_path: str) -> str:
    """
    Convierte un path relativo (enviado por el frontend) en un path
    absoluto real, y verifica que no se salga de BASE_STORAGE_PATH
    (evita path traversal tipo ../../etc/passwd).
    """
    candidate = os.path.abspath(os.path.join(BASE_STORAGE_PATH, relative_path.lstrip("/")))
    if not candidate.startswith(BASE_STORAGE_PATH):
        raise HTTPException(status_code=400, detail="Ruta inválida")
    return candidate


def routeExplorer() -> APIRouter:

    @route.get("/")
    def list_directory(path: str = Query(default="", description="Ruta relativa a explorar")):
        """
        Lista carpetas y archivos dentro de `path` (relativo a BASE_STORAGE_PATH).
        Si path viene vacío, lista la raíz (todos los usuarios del bot).
        """
        target = _resolve_safe_path(path)

        if not os.path.exists(target):
            raise HTTPException(status_code=404, detail="Directorio no encontrado")
        if not os.path.isdir(target):
            raise HTTPException(status_code=400, detail="La ruta no es un directorio")

        entries = []
        with os.scandir(target) as it:
            for entry in it:
                relative_entry_path = os.path.relpath(entry.path, BASE_STORAGE_PATH)
                if entry.is_dir():
                    entries.append({
                        "name": entry.name,
                        "type": "directory",
                        "path": relative_entry_path,
                    })
                else:
                    stat = entry.stat()
                    entries.append({
                        "name": entry.name,
                        "type": "file",
                        "path": relative_entry_path,
                        "size": stat.st_size,
                        "modified_at": stat.st_mtime,
                    })

        # Carpetas primero, luego archivos, ambos ordenados alfabéticamente
        entries.sort(key=lambda e: (e["type"] != "directory", e["name"].lower()))

        return {
            "current_path": path,
            "entries": entries,
        }

    @route.get("/file")
    def get_file(path: str = Query(..., description="Ruta relativa del archivo")):
        """
        Sirve el contenido real de un archivo (para verlo o descargarlo).
        """
        target = _resolve_safe_path(path)

        if not os.path.exists(target) or not os.path.isfile(target):
            raise HTTPException(status_code=404, detail="Archivo no encontrado")

        return FileResponse(target)

    return route