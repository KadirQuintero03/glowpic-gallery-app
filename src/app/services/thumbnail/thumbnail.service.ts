import { Injectable } from '@angular/core';

const DB_NAME = 'glowpic-thumbnails';
const STORE_NAME = 'thumbnails';
const DB_VERSION = 1;

export interface StoredThumbnail {
  path: string;
  dataUrl: string;
  width: number;
  height: number;
  updatedAt: number;
}

/**
 * Genera y guarda miniaturas de imágenes y videos en IndexedDB para que
 * GlowPic pueda mostrar una previsualización instantánea de cada archivo
 * (sin tener que volver a descargar/decodificar el original) y para
 * conocer sus dimensiones reales y así respetar su orientación al
 * mostrarlo en la galería.
 */
@Injectable({ providedIn: 'root' })
export class ThumbnailService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('IndexedDB no está disponible en este navegador.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'path' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async get(path: string): Promise<StoredThumbnail | undefined> {
    try {
      const db = await this.openDb();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(path);
        req.onsuccess = () => resolve(req.result as StoredThumbnail | undefined);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return undefined;
    }
  }

  async save(thumb: StoredThumbnail): Promise<void> {
    try {
      const db = await this.openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(thumb);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Si IndexedDB no está disponible, simplemente no se guarda en caché.
    }
  }

  // Genera y almacena una miniatura a partir de una <img> ya cargada en el DOM.
  async createFromImage(path: string, img: HTMLImageElement, maxSize = 320): Promise<StoredThumbnail> {
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    const scale = Math.min(1, maxSize / Math.max(width, height, 1));

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

    const thumb: StoredThumbnail = {
      path,
      dataUrl: canvas.toDataURL('image/jpeg', 0.7),
      width,
      height,
      updatedAt: Date.now(),
    };

    await this.save(thumb);
    return thumb;
  }

  // Genera y almacena una miniatura capturando el fotograma actual de un <video>.
  async createFromVideo(path: string, video: HTMLVideoElement, maxSize = 320): Promise<StoredThumbnail> {
    const width = video.videoWidth;
    const height = video.videoHeight;
    const scale = Math.min(1, maxSize / Math.max(width, height, 1));

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const thumb: StoredThumbnail = {
      path,
      dataUrl: canvas.toDataURL('image/jpeg', 0.7),
      width,
      height,
      updatedAt: Date.now(),
    };

    await this.save(thumb);
    return thumb;
  }
}
