import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlightsRecommendationService, Flight } from './flights-recommendation.service';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, MatIconModule],
  providers: [FlightsRecommendationService],
  template: `
    <div class="flights-container">
      <div class="header">
        <h1>Flight Comparison</h1>
        <p>Find the best prices for your next journey</p>
      </div>

      <div class="search-form-container">
        <form [formGroup]="searchForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="depart">Departure</label>
            <input 
              type="text" 
              id="depart" 
              formControlName="depart" 
              placeholder="Airport code (e.g. LHR)"
              [class.invalid]="isInvalid('depart')">
            <div class="error-message" *ngIf="isInvalid('depart')">
              Departure airport code is required
            </div>
          </div>

          <div class="form-group">
            <label for="arrivee">Arrival</label>
            <input 
              type="text" 
              id="arrivee" 
              formControlName="arrivee" 
              placeholder="Airport code (e.g. JFK)"
              [class.invalid]="isInvalid('arrivee')">
            <div class="error-message" *ngIf="isInvalid('arrivee')">
              Arrival airport code is required
            </div>
          </div>

          <div class="form-group">
            <label for="dateDepart">Departure date</label>
            <input 
              type="date" 
              id="dateDepart" 
              formControlName="dateDepart"
              [class.invalid]="isInvalid('dateDepart')">
            <div class="error-message" *ngIf="isInvalid('dateDepart')">
              Departure date is required
            </div>
          </div>

          <button type="submit" [disabled]="searchForm.invalid || isLoading" class="search-button">
            <span *ngIf="!isLoading">Search</span>
            <span *ngIf="isLoading" class="spinner"></span>
          </button>
        </form>
      </div>

      <div class="results-container" *ngIf="flights.length > 0">
        <h2>Search Results</h2>
        
        <div class="legend">
          <div class="legend-item">
            <span class="legend-badge badge-cheapest"></span>
            <span>Best price - Save money!</span>
          </div>
          <div class="legend-item">
            <span class="legend-badge badge-expensive"></span>
            <span>Premium - Additional services</span>
          </div>
        </div>
        
        <div class="filters">
          <span></span>
          <button (click)="sortBy('Prix')" [class.active]="sortOption === 'Prix'">Price</button>
          <button (click)="sortBy('Compagnie')" [class.active]="sortOption === 'Compagnie'">Airline</button>
          <button (click)="sortBy('Agence')" [class.active]="sortOption === 'Agence'">Agency</button>
        </div>

        <div class="flights-grid">
          <div class="flight-card" *ngFor="let flight of flights">
            <div class="card-header">
              <h3>{{ flight.Compagnie }}</h3>
              <span class="badge badge-cheapest" *ngIf="flight === cheapestFlight">
                <mat-icon>star</mat-icon>
                Best price
              </span>
              <span class="badge badge-expensive" *ngIf="flight === mostExpensiveFlight">
                <mat-icon>workspace_premium</mat-icon>
                Premium
              </span>
            </div>
            <div class="card-body">
              <div class="flight-info">
                <p>
                  <mat-icon>business</mat-icon>
                  <strong>Agency:</strong> {{ flight.Agence }}
                </p>
                <p class="price">{{ formatPrice(flight.Prix) }} TND</p>
                <p class="advantage" *ngIf="flight === cheapestFlight">
                  <mat-icon class="advantage-icon">check_circle</mat-icon>
                  Best value for money
                </p>
                <p class="advantage" *ngIf="flight === mostExpensiveFlight">
                  <mat-icon class="advantage-icon">stars</mat-icon>
                  Premium services included
                </p>
              </div>
              <button class="book-button">Book Now</button>
            </div>
          </div>
        </div>
      </div>

      <div class="no-results" *ngIf="noResults">
        <h2>No flights found</h2>
        <p>Please try with different search criteria.</p>
      </div>

      <div class="error-container" *ngIf="errorMessage">
        <h2>Error during search</h2>
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
      border-radius: 8px 8px 0 0;
      overflow: visible;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s, box-shadow 0.3s;
      position: relative;
      margin-bottom: 1rem;
      border: 1px solid #e0e0e0;
      border-bottom: none;
    }

    .flight-card::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 100%;
      height: 4px;
      background-color: #ff4444;
      border-radius: 0 0 8px 8px;
    }

    .flight-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    }

    .flight-card:hover::after {
      background-color: #ff0000;
      box-shadow: 0 2px 4px rgba(255, 0, 0, 0.2);
    }

    .card-header {
      background: linear-gradient(135deg, #1a73e8, #6c5ce7);
      color: white;
      padding: 1.5rem;
      position: relative;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 500;
    }

    .badge {
      position: absolute;
      top: -12px;
      right: -12px;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: white;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .badge-cheapest {
      background: linear-gradient(135deg, #4caf50, #45a049);
    }

    .badge-expensive {
      background: linear-gradient(135deg, #ff9800, #f57c00);
    }

    .badge::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: inherit;
      border-radius: inherit;
      filter: blur(8px);
      opacity: 0.5;
      z-index: -1;
    }

    .card-body {
      padding: 1.5rem;
    }

    .flight-info {
      margin-bottom: 1.5rem;
    }

    .flight-info p {
      margin: 0.7rem 0;
      color: #555;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .price {
      font-size: 1.8rem;
      font-weight: 600;
      color: #1a73e8 !important;
      margin: 1rem 0 !important;
    }

    .advantage {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 0.8rem;
      margin: 1rem 0;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #2e7d32;
      border-left: 4px solid currentColor;
    }

    .advantage-icon {
      font-size: 1.2rem;
    }

    .book-button {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 6px;
      font-size: 1rem;
      width: 100%;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .book-button:hover {
      background: #1557b1;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(26, 115, 232, 0.2);
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
    // Initialize form with today's date
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
    
    // Format date for API (DD-MM-YYYY)
    const dateParts = new Date(dateDepart).toLocaleDateString('en-GB').split('/');
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
          console.error('Error retrieving flights', error);
          this.errorMessage = 'Unable to retrieve flight data. Please try again later.';
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
    
    // Update special flights after sorting
    this.identifySpecialFlights();
  }
  
  identifySpecialFlights(): void {
    if (this.flights.length === 0) {
      this.cheapestFlight = null;
      this.mostExpensiveFlight = null;
      return;
    }
    
    // Find cheapest and most expensive flights
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
      // If it's already a string, try to parse the number
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