import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadImagesService {
  private baseUrl = 'http://localhost:3100/api/images/images/upload'; //URL

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file); // 'image' debe coincidir con el nombre que espera tu backend

    // Si tu backend necesita autenticación
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });

    return this.http.post(this.baseUrl, formData, { headers });
  }
}
