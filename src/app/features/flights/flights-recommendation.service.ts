import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface pour les résultats de vol
export interface Flight {
  Compagnie: string;
  Agence: string;
  Prix: number | string; // Modifié pour accepter string ou number
}

@Injectable()
export class FlightsRecommendationService {
  // URL de l'API (à ajuster selon votre environnement)
  private apiUrl = 'http://127.0.0.1:5000/comparer';

  constructor(private http: HttpClient) { }

  /**
   * Compare les prix des vols selon les critères donnés
   * @param dateDepart - Date de départ au format DD-MM-YYYY
   * @param depart - Code de l'aéroport de départ
   * @param arrivee - Code de l'aéroport d'arrivée
   * @returns Observable contenant les résultats de la comparaison
   */
  compareFlights(dateDepart: string, depart: string, arrivee: string): Observable<Flight[]> {
    // Création des paramètres de requête
    let params = new HttpParams()
      .set('date_depart', dateDepart)
      .set('depart', depart)
      .set('arrivee', arrivee);

    // Appel à l'API
    return this.http.get<Flight[]>(this.apiUrl, { params });
  }
}