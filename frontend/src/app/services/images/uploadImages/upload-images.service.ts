import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UploadImagesService {
  private baseURL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file); // 'image' debe coincidir con el nombre que espera tu backend

    // Si tu backend necesita autenticación
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });

    return this.http.post(`${this.baseURL}images/images/upload`, formData, { headers });
  }
}
