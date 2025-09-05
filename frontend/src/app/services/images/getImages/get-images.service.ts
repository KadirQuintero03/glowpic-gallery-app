import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetImagesService {
  private baseURL = 'http://localhost:3100/api/images/images/';

  constructor(private http: HttpClient) {}

  getImages(): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any[]>(this.baseURL, { headers });
  }

  // Añade este nuevo método
  getImageUrl(imageId: string): string {
    return `${this.baseURL}/${imageId}`; // Ajusta según tu API
  }
}
