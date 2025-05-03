import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductsPredictionService, ProductRecommendation, PriceComparison } from './products-prediction.service';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-products',
  template: `
    <div class="products-container">
      <div class="header-section">
        <h1 class="main-title">
          <mat-icon class="title-icon">shopping_basket</mat-icon>
          Gestionnaire de Produits
        </h1>
        <p class="subtitle">Comparez les prix et trouvez des produits similaires</p>
      </div>

      <mat-tab-group class="product-tabs" mat-stretch-tabs="false" mat-align-tabs="center">
        <!-- Tab pour les recommandations de produits -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">local_offer</mat-icon>
            Recommandations
          </ng-template>
          
          <mat-card class="product-card animate-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="header-icon">recommend</mat-icon>
              <mat-card-title>Recommandations de produits similaires</mat-card-title>
              <mat-card-subtitle>Trouvez des produits complémentaires à votre achat</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="recommendationForm" (ngSubmit)="onGetRecommendations()" class="form-container">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Produit acheté</mat-label>
                  <input matInput formControlName="product" placeholder="Entrez le nom du produit">
                  <mat-hint>Exemple: gsemoule fine pasteuriseranda</mat-hint>
                  <mat-error *ngIf="recommendationForm.get('product')?.hasError('required')">
                    Le nom du produit est requis
                  </mat-error>
                </mat-form-field>

                <div class="form-actions">
                  <button 
                    mat-raised-button 
                    color="primary" 
                    type="submit" 
                    [disabled]="recommendationForm.invalid || loadingRecommendations" 
                    class="action-button"
                  >
                    <mat-icon>search</mat-icon>
                    Trouver des produits similaires
                    <mat-spinner *ngIf="loadingRecommendations" diameter="20" class="button-spinner"></mat-spinner>
                  </button>
                </div>
              </form>

              <!-- Résultats des recommandations -->
              <div *ngIf="recommendations" class="results-section animate-fade-in">
                <mat-divider class="divider"></mat-divider>
                
                <h3 class="results-title">
                  <mat-icon>lightbulb</mat-icon>
                  Produits recommandés
                </h3>

                <div *ngIf="recommendations.recommended_products?.length" class="recommendations-grid">
                  <mat-card 
                    *ngFor="let product of recommendations.recommended_products" 
                    class="product-recommendation-card"
                  >
                    <mat-card-header>
                      <mat-icon mat-card-avatar>shopping_cart</mat-icon>
                      <mat-card-title>{{ product }}</mat-card-title>
                    </mat-card-header>
                    <mat-card-actions>
                      <button 
                        mat-stroked-button 
                        color="primary"
                        (click)="onCompareProduct(product)"
                      >
                        <mat-icon>compare_arrows</mat-icon>
                        Comparer les prix
                      </button>
                    </mat-card-actions>
                  </mat-card>
                </div>

                <div *ngIf="!recommendations.recommended_products?.length" class="no-results">
                  <mat-icon class="no-results-icon">sentiment_dissatisfied</mat-icon>
                  <p>{{ recommendations.message }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Tab pour la comparaison de prix -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">compare_arrows</mat-icon>
            Comparaison de prix
          </ng-template>

          <mat-card class="product-card animate-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="header-icon">price_check</mat-icon>
              <mat-card-title>Comparaison de prix</mat-card-title>
              <mat-card-subtitle>Comparez les prix entre différentes entreprises</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="comparisonForm" (ngSubmit)="onCompareProduct()" class="form-container">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nom du produit</mat-label>
                  <input matInput formControlName="productToCompare" placeholder="Entrez le nom du produit">
                  <mat-hint>Exemple: Eau minérale</mat-hint>
                  <mat-error *ngIf="comparisonForm.get('productToCompare')?.hasError('required')">
                    Le nom du produit est requis
                  </mat-error>
                </mat-form-field>

                <div class="form-actions">
                  <button 
                    mat-raised-button 
                    color="primary" 
                    type="submit" 
                    [disabled]="comparisonForm.invalid || loadingComparison" 
                    class="action-button"
                  >
                    <mat-icon>compare</mat-icon>
                    Comparer les prix
                    <mat-spinner *ngIf="loadingComparison" diameter="20" class="button-spinner"></mat-spinner>
                  </button>
                </div>
              </form>

              <!-- Résultats de la comparaison -->
              <div *ngIf="priceComparisons.length > 0" class="results-section animate-fade-in">
                <mat-divider class="divider"></mat-divider>
                
                <h3 class="results-title">
                  <mat-icon>monetization_on</mat-icon>
                  Comparaison des prix pour "{{ comparisonForm.get('productToCompare')?.value }}"
                </h3>

                <table mat-table [dataSource]="priceComparisons" class="price-table">
                  <!-- Colonne Entreprise -->
                  <ng-container matColumnDef="entreprise">
                    <th mat-header-cell *matHeaderCellDef>Entreprise</th>
                    <td mat-cell *matCellDef="let item">
                      <div class="cell-with-icon">
                        <mat-icon>store</mat-icon>
                        <span>{{ item.Entreprise }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Colonne Taille -->
                  <ng-container matColumnDef="taille">
                    <th mat-header-cell *matHeaderCellDef>Taille</th>
                    <td mat-cell *matCellDef="let item">
                      <div class="cell-with-icon">
                        <mat-icon>straighten</mat-icon>
                        <span>{{ item.taille }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Colonne Prix -->
                  <ng-container matColumnDef="prix">
                    <th mat-header-cell *matHeaderCellDef>Prix</th>
                    <td mat-cell *matCellDef="let item" [ngClass]="getPriceClass(item.prix)">
                      <div class="price-cell">
                        <span class="price-amount">{{ item.prix | currency:'TND':'symbol':'1.2-2' }}</span>
                        <mat-icon *ngIf="isLowestPrice(item.prix)" matTooltip="Meilleur prix" class="best-price-icon">
                          star
                        </mat-icon>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['entreprise', 'taille', 'prix']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['entreprise', 'taille', 'prix']"></tr>
                </table>
              </div>

              <div *ngIf="comparisonError" class="error-section animate-fade-in">
                <mat-icon color="warn">error</mat-icon>
                <p>{{ comparisonError }}</p>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .products-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .header-section {
      text-align: center;
      margin-bottom: 2rem;
    }

    .main-title {
      font-size: 2rem;
      font-weight: 500;
      color: #3f51b5;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .title-icon {
      font-size: 2rem;
      height: 2rem;
      width: 2rem;
    }

    .subtitle {
      color: #5f6368;
      font-size: 1.2rem;
    }

    .product-tabs {
      background-color: #f5f7fa;
      border-radius: 8px;
      overflow: hidden;
    }

    .tab-icon {
      margin-right: 8px;
    }

    .product-card {
      margin: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .header-icon {
      background: #3f51b5;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .form-container {
      padding: 1.5rem 0;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: center;
      margin-top: 1.5rem;
    }

    .action-button {
      min-width: 220px;
      height: 48px;
      font-size: 1rem;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .button-spinner {
      margin-left: 8px;
    }

    .divider {
      margin: 2rem 0;
    }

    .results-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #3f51b5;
      font-size: 1.4rem;
      margin-bottom: 1rem;
    }

    .price-table {
      width: 100%;
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .cell-with-icon {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .price-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .price-amount {
      font-weight: 500;
    }

    .best-price {
      color: #4caf50;
      background-color: rgba(76, 175, 80, 0.1);
    }

    .best-price-icon {
      color: #ff9800;
    }

    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .product-recommendation-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .product-recommendation-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      color: #5f6368;
    }

    .no-results-icon {
      font-size: 3rem;
      height: 3rem;
      width: 3rem;
      color: #9e9e9e;
      margin-bottom: 1rem;
    }

    .error-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #f44336;
      padding: 1rem;
      margin-top: 1rem;
      background-color: rgba(244, 67, 54, 0.1);
      border-radius: 8px;
    }

    .animate-card {
      animation: slideIn 0.3s ease-out;
    }

    .animate-fade-in {
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .recommendations-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTabsModule,
    MatChipsModule,
    MatTableModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  providers: [ProductsPredictionService]
})
export class ProductsComponent implements OnInit {
  // Formulaires
  recommendationForm: FormGroup;
  comparisonForm: FormGroup;
  
  // États de chargement
  loadingRecommendations = false;
  loadingComparison = false;
  
  // Données des résultats
  recommendations: ProductRecommendation | null = null;
  priceComparisons: PriceComparison[] = [];
  comparisonError: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private productsService: ProductsPredictionService,
    private snackBar: MatSnackBar
  ) {
    // Initialisation des formulaires
    this.recommendationForm = this.formBuilder.group({
      product: ['', Validators.required]
    });

    this.comparisonForm = this.formBuilder.group({
      productToCompare: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Initialisation supplémentaire si nécessaire
  }

  /**
   * Récupère les recommandations de produits
   */
  onGetRecommendations(): void {
    if (this.recommendationForm.invalid) {
      this.snackBar.open('Veuillez entrer un nom de produit', 'Fermer', {
        duration: 3000
      });
      return;
    }

    const productName = this.recommendationForm.get('product')?.value;
    this.loadingRecommendations = true;
    this.recommendations = null;

    this.productsService.getProductRecommendations(productName)
      .subscribe({
        next: (data) => {
          this.recommendations = data;
          this.loadingRecommendations = false;

          // Si aucune recommandation, afficher un message
          if (!data.recommended_products || data.recommended_products.length === 0) {
            this.snackBar.open(data.message || 'Aucune recommandation trouvée', 'Fermer', {
              duration: 5000
            });
          }
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des recommandations:', error);
          this.loadingRecommendations = false;
          this.snackBar.open(
            'Erreur lors de la récupération des recommandations: ' + (error.error?.error || error.message),
            'Fermer',
            { duration: 5000 }
          );
          this.recommendations = null;
        }
      });
  }

  /**
   * Lance la comparaison de prix pour un produit donné
   * @param productName Nom du produit à comparer (optionnel)
   */
  onCompareProduct(productName?: string): void {
    // Si un nom de produit est fourni en paramètre, l'utiliser
    if (productName) {
      this.comparisonForm.get('productToCompare')?.setValue(productName);
    }

    if (this.comparisonForm.invalid) {
      this.snackBar.open('Veuillez entrer un nom de produit', 'Fermer', {
        duration: 3000
      });
      return;
    }

    const product = this.comparisonForm.get('productToCompare')?.value;
    this.loadingComparison = true;
    this.priceComparisons = [];
    this.comparisonError = null;

    this.productsService.getProductPriceComparison(product)
      .subscribe({
        next: (data) => {
          this.priceComparisons = data;
          this.loadingComparison = false;

          if (data.length === 0) {
            this.comparisonError = `Aucune information de prix trouvée pour "${product}"`;
            this.snackBar.open(this.comparisonError, 'Fermer', {
              duration: 5000
            });
          }
        },
        error: (error) => {
          console.error('Erreur lors de la comparaison des prix:', error);
          this.loadingComparison = false;
          this.comparisonError = `Erreur lors de la comparaison des prix: ${error.error?.error || error.message}`;
          this.snackBar.open(this.comparisonError, 'Fermer', {
            duration: 5000
          });
        }
      });
  }

  /**
   * Détermine si un prix est le plus bas
   */
  isLowestPrice(price: number): boolean {
    if (!this.priceComparisons.length) return false;
    const lowestPrice = Math.min(...this.priceComparisons.map(item => item.prix));
    return price === lowestPrice;
  }

  /**
   * Retourne la classe CSS en fonction du prix
   */
  getPriceClass(price: number): string {
    if (this.isLowestPrice(price)) return 'best-price';
    return '';
  }
}