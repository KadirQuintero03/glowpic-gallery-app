import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GetImagesService {
  private baseURL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getImages(): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any[]>(`${this.baseURL}images/images`, { headers });
  }

  // Añade este nuevo método
  getImageUrl(imageId: string): string {
    return `${this.baseURL}/${imageId}`; // Ajusta según tu API
  }
}
