import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface ProductRecommendation {
  recommended_products: string[];
  message?: string;
}

export interface PriceComparison {
  Entreprise: string;
  prix: number | string;
  taille: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsPredictionService {
  // URLs des API Flask (ajustez selon votre environnement)
  private recommendationApiUrl = 'http://127.0.0.1:5000/predict';
  private priceComparisonApiUrl = 'http://127.0.0.1:5000/comparer_produits';

  constructor(private http: HttpClient) { }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code: ${error.status}, Message: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => error);
  }

  /**
   * Appelle l'API de recommandation de produits similaires
   * @param purchasedProduct - Le produit acheté pour lequel on veut des recommandations
   * @returns Observable contenant la liste des produits recommandés
   */
  getProductRecommendations(purchasedProduct: string): Observable<ProductRecommendation> {
    return this.http.post<ProductRecommendation>(
      this.recommendationApiUrl,
      { purchased: purchasedProduct }
    ).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Appelle l'API de comparaison de prix
   * @param productName - Le nom du produit à comparer
   * @returns Observable contenant les informations de prix par entreprise
   */
  getProductPriceComparison(productName: string): Observable<PriceComparison[]> {
    const params = { produit: productName };
    return this.http.get<PriceComparison[]>(this.priceComparisonApiUrl, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
}