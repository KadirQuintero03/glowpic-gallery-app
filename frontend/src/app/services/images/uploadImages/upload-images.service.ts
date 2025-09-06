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

    const email_client = localStorage.getItem("user_email"); // obtener email del usuario
    if (email_client) {
      formData.append("email_client", email_client);
    }

    formData.append("file", file); // 👈 SOLO una vez

    // Si tu backend necesita autenticación
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });

    console.log(email_client, formData)

    return this.http.post(`${this.baseURL}multimedia/`, formData, { headers });
  }
}
