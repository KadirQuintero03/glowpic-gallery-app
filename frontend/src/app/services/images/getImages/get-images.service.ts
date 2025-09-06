import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GetImagesService {
  private baseURL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getImages(email: string, page: number, size: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const params = new HttpParams()
      .set('email_client', email)
      .set('page', page.toString())
      .set('size_page', size.toString());

    console.log(email)
    return this.http.get<any>(`${this.baseURL}multimedia`, { headers, params });
  }

  // Añade este nuevo método
  getImageUrl(imageId: string): string {
    return `${this.baseURL}/${imageId}`; // Ajusta según tu API
  }
}
