import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { FlightsRecommendationService, Flight } from './flights-recommendation.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-flights',
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <mat-icon>flight_takeoff</mat-icon>
      <span class="toolbar-title">FlightCompare</span>
    </mat-toolbar>

    <div class="flights-container">
      <mat-card class="search-card animate-card">
        <mat-card-header>
          <div mat-card-avatar class="header-icon">
            <mat-icon>search</mat-icon>
          </div>
          <mat-card-title>Recherchez votre vol</mat-card-title>
          <mat-card-subtitle>Comparez les prix et trouvez les meilleures offres</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Date de départ</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="dateDepart">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="searchForm.get('dateDepart')?.hasError('required')">
                  La date de départ est requise
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row two-cols">
              <mat-form-field appearance="outline">
                <mat-label>Départ</mat-label>
                <input matInput formControlName="depart" placeholder="Ex: TUN" maxlength="3">
                <mat-icon matSuffix>flight_takeoff</mat-icon>
                <mat-error *ngIf="searchForm.get('depart')?.hasError('required')">
                  Code IATA requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Arrivée</mat-label>
                <input matInput formControlName="arrivee" placeholder="Ex: CDG" maxlength="3">
                <mat-icon matSuffix>flight_land</mat-icon>
                <mat-error *ngIf="searchForm.get('arrivee')?.hasError('required')">
                  Code IATA requis
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="loading" class="search-button">
                <mat-icon>search</mat-icon>
                {{ loading ? 'Recherche en cours...' : 'Rechercher les vols' }}
                <mat-spinner *ngIf="loading" diameter="20" class="button-spinner"></mat-spinner>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <div *ngIf="searchPerformed" class="results-section animate-fade-in">
        <mat-card *ngIf="allFlights.length > 0" class="results-card">
          <mat-card-header>
            <div mat-card-avatar class="header-icon">
              <mat-icon>flight</mat-icon>
            </div>
            <mat-card-title>Résultats de la recherche</mat-card-title>
            <mat-card-subtitle>
              {{ allFlights.length }} vol{{ allFlights.length > 1 ? 's' : '' }} trouvé{{ allFlights.length > 1 ? 's' : '' }} - Affichage: {{ getDisplayModeText() }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-divider></mat-divider>

          <mat-card-content>
            <div class="price-legend">
              <mat-chip-set>
                <mat-chip 
                  [color]="filterMode === 'best' ? 'primary' : undefined" 
                  (click)="setFilterMode('best')"
                  [ngClass]="{'selected-chip': filterMode === 'best'}"
                >
                  Meilleur prix
                </mat-chip>
                <mat-chip 
                  [color]="filterMode === 'highest' ? 'warn' : undefined" 
                  (click)="setFilterMode('highest')"
                  [ngClass]="{'selected-chip': filterMode === 'highest'}"
                >
                  Prix le plus élevé
                </mat-chip>
                <mat-chip 
                  (click)="setFilterMode('all')"
                  [ngClass]="{'selected-chip': filterMode === 'all'}"
                >
                  Tous les vols
                </mat-chip>
              </mat-chip-set>
            </div>

            <table mat-table [dataSource]="displayedFlights" class="flights-table">
              <ng-container matColumnDef="compagnie">
                <th mat-header-cell *matHeaderCellDef>Compagnie</th>
                <td mat-cell *matCellDef="let flight">
                  <div class="airline-cell">
                    <mat-icon>flight</mat-icon>
                    <span>{{ flight.Compagnie }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="agence">
                <th mat-header-cell *matHeaderCellDef>Agence</th>
                <td mat-cell *matCellDef="let flight">
                  <div class="agency-cell">
                    <mat-icon>store</mat-icon>
                    <span>{{ flight.Agence }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="prix">
                <th mat-header-cell *matHeaderCellDef>Prix</th>
                <td mat-cell *matCellDef="let flight" [ngClass]="getPriceClass(flight.prix_valeur)">
                  <div class="price-cell">
                    <span class="price-amount">{{ flight.prix_valeur | currency:'TND' }}</span>
                    <mat-icon *ngIf="getPriceClass(flight.prix_valeur) === 'best-price'">star</mat-icon>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['compagnie', 'agence', 'prix']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['compagnie', 'agence', 'prix'];"
                  [ngClass]="getPriceClass(row.prix_valeur)"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
    }

    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toolbar-title {
      margin-left: 12px;
      font-weight: 500;
    }

    .flights-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .search-card {
      margin-bottom: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .header-icon {
      background: var(--primary-color);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .search-form {
      padding: 1.5rem 0;
    }

    .form-row {
      margin-bottom: 1rem;
    }

    .two-cols {
      display: grid;
      gap: 1rem;
      grid-template-columns: 1fr 1fr;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: center;
      margin-top: 1.5rem;
    }

    .search-button {
      min-width: 200px;
      height: 48px;
      font-size: 1.1rem;
      border-radius: 24px;
    }

    .button-spinner {
      margin-left: 8px;
    }

    .results-section {
      margin-top: 2rem;
    }

    .results-card {
      border-radius: 12px;
      overflow: hidden;
    }

    .price-legend {
      margin: 1rem 0;
      display: flex;
      justify-content: flex-end;
    }

    .flights-table {
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .airline-cell, .agency-cell, .price-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .price-amount {
      font-weight: 500;
    }

    .best-price {
      color: var(--success-color);
      background: rgba(76, 175, 80, 0.1);
    }

    .high-price {
      color: var(--error-color);
      background: rgba(244, 67, 54, 0.1);
    }

    .animate-card {
      animation: slideIn 0.3s ease-out;
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    .selected-chip {
      transform: scale(1.05);
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    mat-chip {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    mat-chip:hover {
      transform: scale(1.05);
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
      .two-cols {
        grid-template-columns: 1fr;
      }

      .flights-container {
        padding: 0 0.5rem;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatDividerModule,
    MatChipsModule
  ],
  providers: [FlightsRecommendationService]
})
export class FlightsComponent implements OnInit {
  searchForm: FormGroup;
  allFlights: any[] = []; // Stocke tous les vols
  displayedFlights: any[] = []; // Vols filtrés à afficher
  loading = false;
  errorMessage: string | null = null;
  searchPerformed = false;
  filterMode: 'all' | 'best' | 'highest' = 'all'; // Mode de filtrage actuel

  constructor(
    private formBuilder: FormBuilder,
    private flightsService: FlightsRecommendationService,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.formBuilder.group({
      dateDepart: ['', Validators.required],
      depart: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      arrivee: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]]
    });
  }

  ngOnInit(): void {
    // Additional initialization if needed
  }

  /**
   * Définit le mode de filtrage et met à jour les vols affichés
   */
  setFilterMode(mode: 'all' | 'best' | 'highest'): void {
    this.filterMode = mode;
    this.updateDisplayedFlights();
  }

  /**
   * Met à jour les vols affichés en fonction du mode de filtrage
   */
  updateDisplayedFlights(): void {
    if (!this.allFlights.length) {
      this.displayedFlights = [];
      return;
    }

    switch (this.filterMode) {
      case 'best':
        // Trouver le prix minimum
        const minPrice = Math.min(...this.allFlights.map(f => f.prix_valeur));
        // Afficher uniquement les vols avec ce prix minimum
        this.displayedFlights = this.allFlights.filter(flight => flight.prix_valeur === minPrice);
        break;
      
      case 'highest':
        // Trouver le prix maximum
        const maxPrice = Math.max(...this.allFlights.map(f => f.prix_valeur));
        // Afficher uniquement les vols avec ce prix maximum
        this.displayedFlights = this.allFlights.filter(flight => flight.prix_valeur === maxPrice);
        break;
      
      case 'all':
      default:
        // Afficher tous les vols
        this.displayedFlights = [...this.allFlights];
        break;
    }
  }

  /**
   * Renvoie le texte décrivant le mode d'affichage actuel
   */
  getDisplayModeText(): string {
    switch (this.filterMode) {
      case 'best':
        return 'Meilleurs prix uniquement';
      case 'highest':
        return 'Prix les plus élevés uniquement';
      case 'all':
      default:
        return 'Tous les vols';
    }
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs correctement', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const { dateDepart, depart, arrivee } = this.searchForm.value;
    
    let formattedDate = dateDepart;
    if (dateDepart instanceof Date) {
      const day = dateDepart.getDate().toString().padStart(2, '0');
      const month = (dateDepart.getMonth() + 1).toString().padStart(2, '0');
      const year = dateDepart.getFullYear();
      formattedDate = `${day}-${month}-${year}`;
    }

    this.loading = true;
    this.errorMessage = null;
    this.searchPerformed = true;

    this.flightsService.compareFlights(formattedDate, depart.toUpperCase(), arrivee.toUpperCase())
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (results) => {
          // Transformation des données pour extraire la valeur numérique du prix
          this.allFlights = results.map(flight => {
            // Extraire la valeur numérique du prix (si c'est "499.0 TND", on extrait 499.0)
            const prixString = String(flight.Prix);
            const prixMatch = prixString.match(/(\d+(?:\.\d+)?)/);
            const prix_valeur = prixMatch ? parseFloat(prixMatch[0]) : 0;
            
            return {
              ...flight,
              prix_valeur: prix_valeur
            };
          });
          
          // Mettre à jour les vols affichés selon le mode de filtrage actuel
          this.updateDisplayedFlights();
          
          if (this.allFlights.length === 0) {
            this.snackBar.open('Aucun vol trouvé pour ces critères', 'Fermer', {
              duration: 5000,
              panelClass: ['warning-snackbar']
            });
          }
        },
        error: (error) => {
          console.error('Erreur lors de la recherche de vols', error);
          this.snackBar.open(
            error.status === 404 
              ? 'Aucun vol trouvé pour ces critères'
              : 'Une erreur est survenue lors de la recherche',
            'Fermer',
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
          this.allFlights = [];
          this.displayedFlights = [];
        }
      });
  }

  getPriceClass(price: number): string {
    if (!this.allFlights.length) return '';
    
    const minPrice = Math.min(...this.allFlights.map(f => f.prix_valeur));
    const maxPrice = Math.max(...this.allFlights.map(f => f.prix_valeur));
    
    if (price === minPrice) return 'best-price';
    if (price === maxPrice) return 'high-price';
    return '';
  }
}