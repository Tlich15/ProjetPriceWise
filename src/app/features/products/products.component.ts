import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductsPredictionService, ProductRecommendation, PriceComparison } from './products-prediction.service';
import { trigger, transition, style, animate, state } from '@angular/animations';

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
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-products',
  template: `
    <!-- Improved product background with actual product images -->
    <div class="enhanced-background">
      <div class="product-images">
        <img *ngFor="let img of backgroundImages; let i = index" 
             [src]="img" 
             [ngStyle]="{'animation-delay': (i * 0.8) + 's'}" 
             class="floating-product">
      </div>
      <div class="gradient-overlay"></div>
    </div>

    <div class="products-container">
      <div class="header-section">
        <div class="logo-container">
          <div class="logo-circle">
            <mat-icon class="title-icon">shopping_basket</mat-icon>
          </div>
        </div>
        <h1 class="main-title">
          Product Manager
        </h1>
        <p class="subtitle">Compare prices and discover similar products</p>
      </div>

      <mat-tab-group class="product-tabs" mat-stretch-tabs="false" mat-align-tabs="center" animationDuration="500ms">
        <!-- Tab for product recommendations -->
        <mat-tab>
          <ng-template mat-tab-label>
            <div class="tab-label">
              <mat-icon class="tab-icon">local_offer</mat-icon>
              <span>Recommendations</span>
            </div>
          </ng-template>
          
          <mat-card class="product-card animate-card">
            <div class="card-decoration-top"></div>
            <mat-card-header>
              <div class="header-icon-container">
                <mat-icon class="header-icon">recommend</mat-icon>
              </div>
              <mat-card-title>Similar Product Recommendations</mat-card-title>
              <mat-card-subtitle>Find complementary products for your purchase</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="recommendationForm" (ngSubmit)="onGetRecommendations()" class="form-container">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Purchased Product</mat-label>
                  <input matInput formControlName="product" placeholder="Enter product name">
                  <mat-hint>Example: Chocolate</mat-hint>
                  <mat-error *ngIf="recommendationForm.get('product')?.hasError('required')">
                    Product name is required
                  </mat-error>
                  <mat-icon matSuffix>search</mat-icon>
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
                    Find Similar Products
                    <mat-spinner *ngIf="loadingRecommendations" diameter="20" class="button-spinner"></mat-spinner>
                  </button>
                </div>
              </form>

              <!-- Recommendation results -->
              <div *ngIf="recommendations" class="results-section animate-fade-in">
                <mat-divider class="divider"></mat-divider>
                
                <div class="results-header">
                  <mat-icon class="results-icon">lightbulb</mat-icon>
                  <h3 class="results-title">Recommended Products</h3>
                </div>

                <div *ngIf="recommendations.recommended_products?.length" class="recommendations-grid">
                  <mat-card 
                    *ngFor="let product of recommendations.recommended_products; let i = index" 
                    class="product-recommendation-card"
                    [@pulseAnimation]="'active'"
                  >
                    <div class="recommendation-card-content">
                      <div class="product-image-container">
                        <img [src]="getProductImage(i)" alt="Product" class="product-image">
                      </div>
                      <h4 class="product-name">{{ product }}</h4>
                      <button 
                        mat-flat-button 
                        color="primary"
                        class="compare-button"
                        (click)="onCompareProduct(product)"
                      >
                        <mat-icon>compare_arrows</mat-icon>
                        Compare Prices
                      </button>
                    </div>
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

        <!-- Tab for price comparison -->
        <mat-tab>
          <ng-template mat-tab-label>
            <div class="tab-label">
              <mat-icon class="tab-icon">compare_arrows</mat-icon>
              <span>Price Comparison</span>
            </div>
          </ng-template>

          <mat-card class="product-card animate-card">
            <div class="card-decoration-top"></div>
            <mat-card-header>
              <div class="header-icon-container">
                <mat-icon class="header-icon">price_check</mat-icon>
              </div>
              <mat-card-title>Price Comparison</mat-card-title>
              <mat-card-subtitle>Compare prices across different retailers</mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <form [formGroup]="comparisonForm" (ngSubmit)="onCompareProduct()" class="form-container">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Product Name</mat-label>
                  <input matInput formControlName="productToCompare" placeholder="Enter product name">
                  <mat-hint>Example: Mineral Water</mat-hint>
                  <mat-error *ngIf="comparisonForm.get('productToCompare')?.hasError('required')">
                    Product name is required
                  </mat-error>
                  <mat-icon matSuffix>search</mat-icon>
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
                    Compare Prices
                    <mat-spinner *ngIf="loadingComparison" diameter="20" class="button-spinner"></mat-spinner>
                  </button>
                </div>
              </form>

              <!-- Comparison results -->
              <div *ngIf="priceComparisons.length > 0" class="results-section animate-fade-in">
                <mat-divider class="divider"></mat-divider>
                
                <div class="results-header">
                  <mat-icon class="results-icon">monetization_on</mat-icon>
                  <h3 class="results-title">Price Comparison for "{{ comparisonForm.get('productToCompare')?.value }}"</h3>
                </div>
                
                <div class="price-filter-buttons">
                  <button mat-raised-button color="accent" (click)="showLowestPrice()" matTooltip="Show lowest price">
                    <mat-icon>trending_down</mat-icon> Lowest Price
                  </button>
                  <button mat-raised-button color="warn" (click)="showHighestPrice()" matTooltip="Show highest price">
                    <mat-icon>trending_up</mat-icon> Highest Price
                  </button>
                  <button mat-raised-button (click)="resetPriceFilter()" matTooltip="Show all prices">
                    <mat-icon>filter_list</mat-icon> Show All
                  </button>
                </div>

                <div class="price-table-container" [@tableAnimation]="priceFilterState">
                  <table mat-table [dataSource]="filteredComparisons" class="price-table">
                    <!-- Company Column -->
                    <ng-container matColumnDef="entreprise">
                      <th mat-header-cell *matHeaderCellDef>Retailer</th>
                      <td mat-cell *matCellDef="let item">
                        <div class="cell-with-icon">
                          <mat-icon>store</mat-icon>
                          <span>{{ item.Entreprise }}</span>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Size Column -->
                    <ng-container matColumnDef="taille">
                      <th mat-header-cell *matHeaderCellDef>Size</th>
                      <td mat-cell *matCellDef="let item">
                        <div class="cell-with-icon">
                          <mat-icon>straighten</mat-icon>
                          <span>{{ item.taille }}</span>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Price Column -->
                    <ng-container matColumnDef="prix">
                      <th mat-header-cell *matHeaderCellDef>Price</th>
                      <td mat-cell *matCellDef="let item" [ngClass]="getPriceClass(item.prix)">
                        <div class="price-cell">
                          <span class="price-amount" *ngIf="isNumeric(item.prix)">{{ item.prix | currency:'TND':'symbol':'1.2-2' }}</span>
                          <span class="price-amount" *ngIf="!isNumeric(item.prix)">{{ item.prix }}</span>
                          <div *ngIf="isLowestPrice(item.prix)" class="price-badge lowest-price" matTooltip="Best Price">
                            <mat-icon>star</mat-icon>
                          </div>
                          <div *ngIf="isHighestPrice(item.prix)" class="price-badge highest-price" matTooltip="Highest Price">
                            <mat-icon>warning</mat-icon>
                          </div>
                        </div>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="['entreprise', 'taille', 'prix']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['entreprise', 'taille', 'prix']" 
                        class="table-row"
                        [class.highlighted-row]="highlightedRows.includes(row)"></tr>
                  </table>
                </div>
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
    :host {
      display: block;
      min-height: 100vh;
      position: relative;
    }

    /* Enhanced Background with a beautiful gradient instead of black */
    .enhanced-background {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: -1;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
      overflow: hidden;
    }

    .gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(240,242,247,0.8) 100%);
      z-index: 1;
    }

    .product-images {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    .floating-product {
      position: absolute;
      width: 120px;
      height: 120px;
      object-fit: contain;
      opacity: 0.5;
      animation: float 18s infinite linear;
      border-radius: 12px;
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
    }

    @keyframes float {
      0% {
        transform: translateY(100vh) translateX(0) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 0.5;
      }
      90% {
        opacity: 0.5;
      }
      100% {
        transform: translateY(-150px) translateX(calc(100vw - 150px)) rotate(360deg);
        opacity: 0;
      }
    }

    /* Main Container */
    .products-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      position: relative;
      z-index: 2;
    }

    /* Header Section */
    .header-section {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem 0;
    }

    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .logo-circle {
      width: 90px;
      height: 90px;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 20px rgba(79, 172, 254, 0.3);
      animation: pulse 2.5s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(79, 172, 254, 0.7);
      }
      70% {
        box-shadow: 0 0 0 20px rgba(79, 172, 254, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(79, 172, 254, 0);
      }
    }

    .title-icon {
      font-size: 46px;
      height: 46px;
      width: 46px;
      color: white;
    }

    .main-title {
      font-size: 2.8rem;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 0.8rem;
      letter-spacing: 1px;
      text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
    }

    .subtitle {
      color: #4a5568;
      font-size: 1.4rem;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Tabs */
    .product-tabs {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }

    .tab-label {
      display: flex;
      align-items: center;
      padding: 10px;
    }

    .tab-icon {
      margin-right: 10px;
      font-size: 24px;
    }

    /* Cards */
    .product-card {
      margin: 0;
      border-radius: 0 0 16px 16px;
      background: rgba(255, 255, 255, 0.97);
      box-shadow: none;
      position: relative;
      overflow: hidden;
      padding: 1.5rem;
    }

    .card-decoration-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #4facfe, #00f2fe, #4facfe);
      background-size: 200% 100%;
      animation: gradientAnimation 3s infinite ease-in-out;
    }

    @keyframes gradientAnimation {
      0% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
      100% {
        background-position: 0% 50%;
      }
    }

    .header-icon-container {
    width: 54px;
    height: 54px;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 12px rgba(79, 172, 254, 0.3);
    padding: 8px;
    margin-left: auto; /* Déplace le conteneur à droite */
    margin-right: 16px; /* Remplace margin-right: 54px pour un espacement plus standard */
  }

    .header-icon {
      color: white;
      font-size: 28px;
      height: 28px;
      width: 28px;
      margin: 4px;
    }

    /* Forms */
    .form-container {
      padding: 1.5rem 0;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }

    .action-button {
      min-width: 240px;
      height: 54px;
      font-size: 1.1rem;
      border-radius: 27px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      box-shadow: 0 8px 15px rgba(79, 172, 254, 0.3);
      transition: all 0.3s ease;
    }

    .action-button:hover:not([disabled]) {
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(79, 172, 254, 0.4);
    }

    .button-spinner {
      margin-left: 8px;
    }

    /* Results section */
    .divider {
      margin: 2rem 0;
    }

    .results-header {
      display: flex;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .results-icon {
      font-size: 30px;
      color: #4facfe;
      margin-right: 12px;
    }

    .results-title {
      color: #4facfe;
      font-size: 1.5rem;
      font-weight: 500;
      margin: 0;
    }

    /* Price table */
    .price-filter-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .price-filter-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 20px;
      transition: all 0.3s ease;
    }

    .price-table-container {
      overflow: hidden;
      border-radius: 14px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
    }

    .price-table {
      width: 100%;
      overflow: hidden;
    }

    .table-row {
      transition: background 0.3s ease;
    }

    .highlighted-row {
      background: rgba(79, 172, 254, 0.1) !important;
      font-weight: 500;
    }

    .cell-with-icon {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .price-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .price-amount {
      font-weight: 500;
      font-size: 1.05rem;
    }

    .price-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      width: 26px;
      height: 26px;
    }

    .lowest-price {
      background: #48bb78;
      box-shadow: 0 3px 6px rgba(72, 187, 120, 0.5);
    }

    .lowest-price mat-icon {
      color: white;
      font-size: 16px;
      height: 16px;
      width: 16px;
    }

    .highest-price {
      background: #f56565;
      box-shadow: 0 3px 6px rgba(245, 101, 101, 0.5);
    }

    .highest-price mat-icon {
      color: white;
      font-size: 16px;
      height: 16px;
      width: 16px;
    }

    .best-price {
      background-color: rgba(72, 187, 120, 0.1);
    }

    /* Recommendations grid */
    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .product-recommendation-card {
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      background: white;
    }

    .product-recommendation-card:hover {
      transform: translateY(-10px) scale(1.03);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
    }

    .recommendation-card-content {
      padding: 1.8rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .product-image-container {
      width: 120px;
      height: 120px;
      margin-bottom: 1.5rem;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .product-recommendation-card:hover .product-image {
      transform: scale(1.08);
    }

    .product-name {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: #2d3748;
    }

    .compare-button {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 10px 0;
      border-radius: 25px;
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      transition: all 0.3s ease;
    }

    .compare-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 15px rgba(79, 172, 254, 0.3);
    }

    /* Error and No Results */
    .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 2rem;
      color: #718096;
      background: rgba(226, 232, 240, 0.5);
      border-radius: 14px;
    }

    .no-results-icon {
      font-size: 54px;
      height: 54px;
      width: 54px;
      color: #a0aec0;
      margin-bottom: 1.2rem;
    }

    .error-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      color: #f56565;
      padding: 1.8rem;
      margin-top: 1.5rem;
      background-color: rgba(245, 101, 101, 0.08);
      border-radius: 14px;
      border-left: 5px solid #f56565;
    }

    /* Animations */
    .animate-card {
      animation: slideIn 0.6s ease-out;
    }

    .animate-fade-in {
      animation: fadeIn 0.7s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-40px);
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

    /* Responsive Styles */
    @media (max-width: 768px) {
      .recommendations-grid {
        grid-template-columns: 1fr;
      }

      .price-filter-buttons {
        flex-direction: column;
      }
      
      .price-filter-buttons button {
        width: 100%;
      }

      .main-title {
        font-size: 2.2rem;
      }

      .subtitle {
        font-size: 1.2rem;
      }
    }

    @media (max-width: 480px) {
      .logo-circle {
        width: 70px;
        height: 70px;
      }

      .title-icon {
        font-size: 36px;
        height: 36px;
        width: 36px;
      }

      .header-section {
        padding: 1.5rem 0;
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
    MatBadgeModule,
    MatButtonToggleModule
  ],
  providers: [ProductsPredictionService],
  animations: [
    trigger('pulseAnimation', [
      state('active', style({
        transform: 'scale(1)'
      })),
      transition('* => active', [
        animate('1.2s ease-in-out', style({ transform: 'scale(1.05)' })),
        animate('1.2s ease-in-out', style({ transform: 'scale(1)' }))
      ])
    ]),
    trigger('tableAnimation', [
      transition('* => filtered', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class ProductsComponent implements OnInit {
  // Product images for background
  backgroundImages: string[] = [
    'https://images.pexels.com/photos/2531188/pexels-photo-2531188.jpeg',
    'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg',
    'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg',
    'https://images.pexels.com/photos/4114978/pexels-photo-4114978.jpeg',
    'https://images.pexels.com/photos/235294/pexels-photo-235294.jpeg',
    'https://images.pexels.com/photos/2116090/pexels-photo-2116090.jpeg',
    'https://images.pexels.com/photos/1132558/pexels-photo-1132558.jpeg',
    'https://images.pexels.com/photos/3602834/pexels-photo-3602834.jpeg',
    'https://images.pexels.com/photos/6073561/pexels-photo-6073561.jpeg',
    'https://images.pexels.com/photos/6941033/pexels-photo-6941033.jpeg'
  ];

  // Product preview images
  productPreviewImages: string[] = [
    'https://images.pexels.com/photos/2531188/pexels-photo-2531188.jpeg',
    'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg',
    'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg',
    'https://images.pexels.com/photos/4114978/pexels-photo-4114978.jpeg',
    'https://images.pexels.com/photos/235294/pexels-photo-235294.jpeg',
    'https://images.pexels.com/photos/2116090/pexels-photo-2116090.jpeg',
    'https://images.pexels.com/photos/1132558/pexels-photo-1132558.jpeg',
    'https://images.pexels.com/photos/3602834/pexels-photo-3602834.jpeg',
    'https://images.pexels.com/photos/6073561/pexels-photo-6073561.jpeg',
    'https://images.pexels.com/photos/6941033/pexels-photo-6941033.jpeg'
  ];

  // Forms
  recommendationForm: FormGroup;
  comparisonForm: FormGroup;
  
  // Loading states
  loadingRecommendations = false;
  loadingComparison = false;
  
  // Result data
  recommendations: ProductRecommendation | null = null;
  priceComparisons: PriceComparison[] = [];
  filteredComparisons: PriceComparison[] = [];
  comparisonError: string | null = null;
  
  // Price filter state
  priceFilterState: string = 'all';
  highlightedRows: PriceComparison[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private productsService: ProductsPredictionService,
    private snackBar: MatSnackBar
  ) {
    // Initialize forms
    this.recommendationForm = this.formBuilder.group({
      product: ['', Validators.required]
    });

    this.comparisonForm = this.formBuilder.group({
      productToCompare: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Already using real images in backgroundImages array
  }

  /**
   * Get a product image for a recommendation based on index
   */
  getProductImage(index: number): string {
    // Cycle through available images if we have more recommendations than images
    const imageIndex = index % this.productPreviewImages.length;
    return this.productPreviewImages[imageIndex];
  }

  /**
   * Checks if a value is numeric
   */
  isNumeric(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  /**
   * Gets product recommendations
   */
  onGetRecommendations(): void {
    if (this.recommendationForm.invalid) {
      this.snackBar.open('Please enter a product name', 'Close', {
        duration: 3000,
        panelClass: 'custom-snackbar'
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

          // If no recommendations, display a message
          if (!data.recommended_products || data.recommended_products.length === 0) {
            this.snackBar.open(data.message || 'No recommendations found', 'Close', {
              duration: 5000,
              panelClass: 'custom-snackbar'
            });
          }
        },
        error: (error) => {
          console.error('Error retrieving recommendations:', error);
          this.loadingRecommendations = false;
          this.snackBar.open(
            'Error retrieving recommendations: ' + (error.error?.error || error.message),
            'Close',
            { duration: 5000, panelClass: 'error-snackbar' }
          );
          this.recommendations = null;
        }
      });
  }

  /**
   * Initiates price comparison for a given product
   * @param productName Product name to compare (optional)
   */
  onCompareProduct(productName?: string): void {
    // If a product name is provided as a parameter, use it
    if (productName) {
      this.comparisonForm.get('productToCompare')?.setValue(productName);
    }

    if (this.comparisonForm.invalid) {
      this.snackBar.open('Please enter a product name', 'Close', {
        duration: 3000,
        panelClass: 'custom-snackbar'
      });
      return;
    }

    const product = this.comparisonForm.get('productToCompare')?.value;
    this.loadingComparison = true;
    this.priceComparisons = [];
    this.filteredComparisons = [];
    this.comparisonError = null;

    this.productsService.getProductPriceComparison(product)
      .subscribe({
        next: (data) => {
          // Ensure prices are numeric
          this.priceComparisons = data.map(item => ({
            ...item,
            prix: this.parsePrice(item.prix)
          }));
          
          this.filteredComparisons = [...this.priceComparisons];
          this.loadingComparison = false;
          this.priceFilterState = 'all';
          this.highlightedRows = [];

          if (data.length === 0) {
            this.comparisonError = `No price information found for "${product}"`;
            this.snackBar.open(this.comparisonError, 'Close', {
              duration: 5000,
              panelClass: 'warning-snackbar'
            });
          } else {
            this.snackBar.open(`Found ${data.length} price entries for "${product}"`, 'Close', {
              duration: 3000,
              panelClass: 'success-snackbar'
            });
          }
        },
        error: (error) => {
          console.error('Error comparing prices:', error);
          this.loadingComparison = false;
          this.comparisonError = `Error comparing prices: ${error.error?.error || error.message}`;
          this.snackBar.open(this.comparisonError, 'Close', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }

  /**
   * Show only the lowest price item(s)
   */
  showLowestPrice(): void {
    const numericPrices = this.priceComparisons
      .filter(p => this.isNumeric(p.prix))
      .map(p => Number(p.prix));
    
    if (numericPrices.length === 0) {
      this.snackBar.open('No numeric prices to compare', 'Close', {
        duration: 3000,
        panelClass: 'warning-snackbar'
      });
      return;
    }
    
    const minPrice = Math.min(...numericPrices);
    this.filteredComparisons = this.priceComparisons.filter(p => 
      this.isNumeric(p.prix) && Number(p.prix) === minPrice
    );
    
    this.highlightedRows = [...this.filteredComparisons];
    this.priceFilterState = 'filtered';
    
    this.snackBar.open(`Showing lowest price: ${minPrice.toFixed(2)} TND`, 'Close', {
      duration: 3000,
      panelClass: 'success-snackbar'
    });
  }

  /**
   * Show only the highest price item(s)
   */
  showHighestPrice(): void {
    const numericPrices = this.priceComparisons
      .filter(p => this.isNumeric(p.prix))
      .map(p => Number(p.prix));
    
    if (numericPrices.length === 0) {
      this.snackBar.open('No numeric prices to compare', 'Close', {
        duration: 3000,
        panelClass: 'warning-snackbar'
      });
      return;
    }
    
    const maxPrice = Math.max(...numericPrices);
    this.filteredComparisons = this.priceComparisons.filter(p => 
      this.isNumeric(p.prix) && Number(p.prix) === maxPrice
    );
    
    this.highlightedRows = [...this.filteredComparisons];
    this.priceFilterState = 'filtered';
    
    this.snackBar.open(`Showing highest price: ${maxPrice.toFixed(2)} TND`, 'Close', {
      duration: 3000,
      panelClass: 'warning-snackbar'
    });
  }

  /**
   * Reset price filter to show all items
   */
  resetPriceFilter(): void {
    this.filteredComparisons = [...this.priceComparisons];
    this.highlightedRows = [];
    this.priceFilterState = 'all';
    
    this.snackBar.open('Showing all prices', 'Close', {
      duration: 2000
    });
  }

  /**
   * Parses and cleans a price, returns the original value if it's not a number
   */
  parsePrice(price: any): number | string {
    if (typeof price === 'string') {
      // Try to convert the string to a number, stripping out non-numeric characters if needed
      const cleaned = price.replace(/[^\d.,]/g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? price : parsed;
    }
    return price;
  }

  /**
   * Determines if the price is the lowest in the list
   */
  isLowestPrice(price: number | string): boolean {
    if (!this.isNumeric(price)) return false;
    const numericPrices = this.priceComparisons
      .filter(p => this.isNumeric(p.prix))
      .map(p => Number(p.prix));
    
    if (numericPrices.length === 0) return false;
    
    const min = Math.min(...numericPrices);
    return Number(price) === min;
  }

  /**
   * Determines if the price is the highest in the list
   */
  isHighestPrice(price: number | string): boolean {
    if (!this.isNumeric(price)) return false;
    const numericPrices = this.priceComparisons
      .filter(p => this.isNumeric(p.prix))
      .map(p => Number(p.prix));
    
    if (numericPrices.length === 0) return false;
    
    const max = Math.max(...numericPrices);
    return Number(price) === max;
  }

  /**
   * Returns a CSS class for styling the price cell based on its value
   */
  getPriceClass(price: number | string): string {
    return this.isLowestPrice(price) ? 'best-price' : '';
  }
}