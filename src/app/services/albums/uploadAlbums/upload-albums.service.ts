import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadAlbumsService {
  private baseURL = 'http://localhost:3100/api/albums/albums/';

  constructor(private http: HttpClient) {}

  createAlbum(name: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(this.baseURL, { name }, { headers }).pipe(
      tap(() => {
        console.log('Álbum creado exitosamente');
      })
    );
  }
}
