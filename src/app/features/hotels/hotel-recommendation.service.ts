// src/app/features/hotels/hotel-recommendation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface HotelRecommendationRequest {
   'Localisation': string;
   'Type Chambre': string;
   'Prix': number;
   'Nombre de Etoile': number;
   'Agence': string;
   'Date': string;
   'Services & équipements': string[];
}

export interface HotelRecommendationResponse {
  'Hotel Name': string;
  'Prix': string;
  'Description': string;
  'Nombre de Etoile': number;
  'message': string;
}

@Injectable({
  providedIn: 'root'
})
export class HotelRecommendationService {
  private apiUrl = 'http://127.0.0.1:5000/predict';

  constructor(private http: HttpClient) { }

  getRecommendation(request: HotelRecommendationRequest): Observable<HotelRecommendationResponse> {
    console.log("Envoi de la requête:", request);
    return this.http.post<HotelRecommendationResponse>(this.apiUrl, request).pipe(
      tap(response => console.log("Réponse reçue:", response)),
      catchError(error => {
        console.error("Erreur détaillée:", error);
        throw error;
      })
    );
  }
}