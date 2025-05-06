import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlightsRecommendationService, Flight } from './flights-recommendation.service';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  providers: [FlightsRecommendationService],
  template: `
    <div class="flights-container">
      <div class="header">
        <h1>Comparateur de Vols</h1>
        <p>Trouvez les meilleurs prix pour votre prochain voyage</p>
      </div>

      <div class="search-form-container">
        <form [formGroup]="searchForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="depart">Départ</label>
            <input 
              type="text" 
              id="depart" 
              formControlName="depart" 
              placeholder="Code aéroport (ex: CDG)"
              [class.invalid]="isInvalid('depart')">
            <div class="error-message" *ngIf="isInvalid('depart')">
              Le code de l'aéroport de départ est requis
            </div>
          </div>

          <div class="form-group">
            <label for="arrivee">Arrivée</label>
            <input 
              type="text" 
              id="arrivee" 
              formControlName="arrivee" 
              placeholder="Code aéroport (ex: JFK)"
              [class.invalid]="isInvalid('arrivee')">
            <div class="error-message" *ngIf="isInvalid('arrivee')">
              Le code de l'aéroport d'arrivée est requis
            </div>
          </div>

          <div class="form-group">
            <label for="dateDepart">Date de départ</label>
            <input 
              type="date" 
              id="dateDepart" 
              formControlName="dateDepart"
              [class.invalid]="isInvalid('dateDepart')">
            <div class="error-message" *ngIf="isInvalid('dateDepart')">
              La date de départ est requise
            </div>
          </div>

          <button type="submit" [disabled]="searchForm.invalid || isLoading" class="search-button">
            <span *ngIf="!isLoading">Rechercher</span>
            <span *ngIf="isLoading" class="spinner"></span>
          </button>
        </form>
      </div>

      <div class="results-container" *ngIf="flights.length > 0">
        <h2>Résultats de la recherche</h2>
        
        <div class="legend">
          <div class="legend-item">
            <span class="legend-badge badge-cheapest"></span>
            <span>Meilleur prix - Économisez!</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge badge-expensive"></span>
            <span>Premium - Services supplémentaires</span>
          </div>
        </div>
        
        <div class="filters">
          <span></span>
          <button (click)="sortBy('Prix')" [class.active]="sortOption === 'Prix'">Prix</button>
          <button (click)="sortBy('Compagnie')" [class.active]="sortOption === 'Compagnie'">Compagnie</button>
          <button (click)="sortBy('Agence')" [class.active]="sortOption === 'Agence'">Agence</button>
        </div>

        <div class="flights-grid">
          <div class="flight-card" *ngFor="let flight of flights">
            <div class="card-header">
            
              <h3>{{ flight.Compagnie }}</h3>
              <p> <span class="badge badge-cheapest" *ngIf="flight === cheapestFlight">Meilleur prix</span> </p>
              <p> <span class="badge badge-expensive" *ngIf="flight === mostExpensiveFlight">Premium</span> </p>
            </div>
            <div class="card-body">
              <div class="flight-info">
                <p><strong>Agence:</strong> {{ flight.Agence }}</p>
                <p class="price">{{ formatPrice(flight.Prix) }}</p>
                <p class="advantage" *ngIf="flight === cheapestFlight">
                  <span class="advantage-icon">✓</span> Meilleur qualité-prix
                </p>
                <p class="advantage" *ngIf="flight === mostExpensiveFlight">
                  <span class="advantage-icon">★</span> Services premium
                </p>
              </div>
              <button class="book-button">Réserver</button>
            </div>
          </div>
        </div>
      </div>

      <div class="no-results" *ngIf="noResults">
        <h2>Aucun vol trouvé</h2>
        <p>Veuillez essayer avec d'autres critères de recherche.</p>
      </div>

      <div class="error-container" *ngIf="errorMessage">
        <h2>Erreur lors de la recherche</h2>
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .flights-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: url('https://images.unsplash.com/photo-1499063078284-f78f7d89616a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80') no-repeat center center fixed;
      background-size: cover;
      position: relative;
      min-height: 100vh;
    }
    
    .flights-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.85);
      z-index: -1;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
      background: linear-gradient(135deg, #1a73e8, #6c5ce7);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .header h1 {
      margin: 0;
      font-size: 2.5rem;
    }

    .header p {
      margin-top: 0.5rem;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .search-form-container {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      margin-bottom: 2rem;
    }

    form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      align-items: end;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #333;
    }

    input {
      padding: 0.8rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #1a73e8;
      box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
    }

    input.invalid {
      border-color: #e53935;
    }

    .error-message {
      color: #e53935;
      font-size: 0.85rem;
      margin-top: 0.3rem;
    }

    .search-button {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.3s;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .search-button:hover {
      background: #1557b1;
    }

    .search-button:disabled {
      background: #cccccc;
      cursor: not-allowed;
    }

    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .results-container {
      margin-top: 2rem;
    }

    .results-container h2 {
      margin-bottom: 1rem;
      color: #333;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      background-color: rgba(255, 255, 255, 0.8);
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .legend-badge {
      display: inline-block;
      width: 15px;
      height: 15px;
      border-radius: 50%;
    }
    
    .filters {
      display: flex;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 0.5rem;
      background-color: rgba(255, 255, 255, 0.8);
      padding: 0.8rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .filters span {
      margin-right: 0.5rem;
      color: #555;
    }

    .filters button {
      background: #f5f5f5;
      border: 1px solid #ddd;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .filters button.active {
      background: #1a73e8;
      color: white;
      border-color: #1a73e8;
    }

    .flights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .flight-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .flight-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    }

    .card-header {
      background: linear-gradient(135deg, #1a73e8, #6c5ce7);
      color: white;
      padding: 1rem;
      position: relative;
    }

    .card-header h3 {
      margin: 0;
      font-weight: 500;
      font-size: 1.2rem;
    }
    
    .badge {
      position: absolute;
      top: -10px;
      right: -10px;
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: bold;
      color: white;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    .badge-cheapest {
      background: #4caf50;
    }
    
    .badge-expensive {
      background: #ff5722;
    }

    .card-body {
      padding: 1.5rem;
    }

    .flight-info {
      margin-bottom: 1rem;
    }

    .flight-info p {
      margin: 0.5rem 0;
      color: #555;
    }

    .price {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a73e8 !important;
    }
    
    .advantage {
      background-color: #f8f9fa;
      border-left: 3px solid #4caf50;
      padding: 0.5rem;
      margin: 0.5rem 0;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
    }
    
    .advantage-icon {
      margin-right: 0.5rem;
      font-size: 1rem;
      color: #4caf50;
    }

    .book-button {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 0.7rem 1.5rem;
      border-radius: 4px;
      font-size: 1rem;
      width: 100%;
      cursor: pointer;
      transition: background 0.3s;
    }

    .book-button:hover {
      background: #1557b1;
    }

    .no-results, .error-container {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      margin-top: 2rem;
    }

    .error-container {
      border-left: 4px solid #e53935;
    }

    .error-container h2 {
      color: #e53935;
    }

    @media (max-width: 768px) {
      .flights-container {
        padding: 1rem;
      }

      form {
        grid-template-columns: 1fr;
      }

      .flights-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FlightsComponent implements OnInit {
  searchForm: FormGroup;
  flights: Flight[] = [];
  isLoading = false;
  noResults = false;
  errorMessage = '';
  sortOption = 'Prix';
  cheapestFlight: Flight | null = null;
  mostExpensiveFlight: Flight | null = null;

  constructor(
    private fb: FormBuilder,
    private flightsService: FlightsRecommendationService
  ) {
    this.searchForm = this.fb.group({
      depart: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      arrivee: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
      dateDepart: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Initialisation du formulaire avec la date d'aujourd'hui
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    this.searchForm.patchValue({
      dateDepart: dateString
    });
  }

  onSubmit(): void {
    if (this.searchForm.invalid) {
      this.markFormGroupTouched(this.searchForm);
      return;
    }
    
    this.isLoading = true;
    this.flights = [];
    this.noResults = false;
    this.errorMessage = '';
    
    const { depart, arrivee, dateDepart } = this.searchForm.value;
    
    // Formatage de la date pour l'API (DD-MM-YYYY)
    const dateParts = new Date(dateDepart).toLocaleDateString('fr-FR').split('/');
    const formattedDate = dateParts.join('-');
    
    this.flightsService.compareFlights(formattedDate, depart.toUpperCase(), arrivee.toUpperCase())
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (results) => {
          this.flights = results;
          this.noResults = results.length === 0;
          this.sortFlights();
          this.identifySpecialFlights();
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des vols', error);
          this.errorMessage = 'Impossible de récupérer les données de vol. Veuillez réessayer plus tard.';
        }
      });
  }

  sortBy(option: string): void {
    this.sortOption = option;
    this.sortFlights();
  }

  sortFlights(): void {
    if (this.sortOption === 'Prix') {
      this.flights.sort((a, b) => {
        const priceA = typeof a.Prix === 'string' ? parseFloat(a.Prix.replace(/[^\d.-]/g, '')) : a.Prix;
        const priceB = typeof b.Prix === 'string' ? parseFloat(b.Prix.replace(/[^\d.-]/g, '')) : b.Prix;
        return priceA - priceB;
      });
    } else {
      this.flights.sort((a, b) => {
        const valA = a[this.sortOption as keyof Flight];
        const valB = b[this.sortOption as keyof Flight];
        return String(valA).localeCompare(String(valB));
      });
    }
    
    // Mettre à jour les vols spéciaux après le tri
    this.identifySpecialFlights();
  }
  
  identifySpecialFlights(): void {
    if (this.flights.length === 0) {
      this.cheapestFlight = null;
      this.mostExpensiveFlight = null;
      return;
    }
    
    // Trouver le vol le moins cher et le plus cher
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    this.cheapestFlight = null;
    this.mostExpensiveFlight = null;
    
    this.flights.forEach(flight => {
      const price = typeof flight.Prix === 'string' 
        ? parseFloat(flight.Prix.replace(/[^\d.-]/g, '')) 
        : flight.Prix;
        
      if (price < minPrice) {
        minPrice = price;
        this.cheapestFlight = flight;
      }
      
      if (price > maxPrice) {
        maxPrice = price;
        this.mostExpensiveFlight = flight;
      }
    });
  }

  formatPrice(price: number | string): string {
    if (typeof price === 'string') {
      // Si c'est déjà une chaîne, on essaie de parser le nombre
      const numericPrice = parseFloat(price.replace(/[^\d.-]/g, ''));
      return isNaN(numericPrice) ? price : numericPrice.toFixed(2);
    }
    return price.toFixed(2);
  }

  isInvalid(field: string): boolean {
    const control = this.searchForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}