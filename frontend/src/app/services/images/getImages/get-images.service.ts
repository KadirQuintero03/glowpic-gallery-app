import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GetImagesService {
  private baseURL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getImages(): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const email = localStorage.getItem('user_email'); // 👈 recuperar email guardado
    if (!email) {
      throw new Error('No se encontró el email del usuario en localStorage');
    }
    console.log(email)
    return this.http.get<any[]>(`${this.baseURL}multimedia/${email}`, { headers });
  }

  // Añade este nuevo método
  getImageUrl(imageId: string): string {
    return `${this.baseURL}/${imageId}`; // Ajusta según tu API
  }
}
