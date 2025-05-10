import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Chart } from 'chart.js/auto';
import { HotelRecommendationService, HotelRecommendationRequest, HotelRecommendationResponse } from './hotel-recommendation.service';
import { HttpClientModule } from '@angular/common/http';
import { ElementRef } from '@angular/core';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    HttpClientModule
  ],
  providers: [HotelRecommendationService],
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav mode="side" opened class="filters">
        <h3 class="filters-title">Find Good Hotels</h3>
        
        <mat-form-field appearance="outline">
          <mat-label>Location</mat-label>
          <mat-select [(ngModel)]="selectedLocation">
            <mat-option *ngFor="let location of locations" [value]="location">
              {{location}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Room type</mat-label>
          <mat-select [(ngModel)]="selectedRoomType">
            <mat-option *ngFor="let type of roomTypes" [value]="type">
              {{type}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Arrival date</mat-label>
          <input matInput [matDatepicker]="checkIn" [(ngModel)]="dates.checkIn">
          <mat-datepicker-toggle matSuffix [for]="checkIn"></mat-datepicker-toggle>
          <mat-datepicker #checkIn></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Maximum price</mat-label>
          <input matInput type="number" [(ngModel)]="selectedPrice" min="0">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Number of stars</mat-label>
          <mat-select [(ngModel)]="selectedRating">
            <mat-option *ngFor="let rating of ratings" [value]="rating">
              {{rating}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Agency</mat-label>
          <mat-select [(ngModel)]="selectedAgency">
            <mat-option *ngFor="let agency of agencies" [value]="agency">
              {{agency}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div class="services-section">
          <h4>Services & facilities</h4>
          <mat-chip-listbox multiple [(ngModel)]="selectedServices">
            <mat-chip-option *ngFor="let service of availableServices" [value]="service">
              {{service}}
            </mat-chip-option>
          </mat-chip-listbox>
        </div>

        <button mat-raised-button color="primary" (click)="getRecommendation()" 
                [disabled]="!canSubmit() || loading" class="recommendation-button">
          <span *ngIf="!loading">Get a recommendation</span>
          <mat-spinner *ngIf="loading" diameter="24" class="spinner"></mat-spinner>
        </button>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        <div *ngIf="recommendedHotel" class="recommended-section">
          <h2>Recommended Hotel</h2>
          <mat-card class="hotel-card recommended">
            <div class="recommended-badge">Recommended for you</div>
            <div class="hotel-image-container">
              <img [src]="recommendationImageUrl" 
                   [alt]="recommendedHotel['Hotel Name']" class="hotel-image">
            </div>
            <mat-card-header>
              <mat-card-title>{{recommendedHotel['Hotel Name']}}</mat-card-title>
              <mat-card-subtitle>{{findLocationByName(recommendedHotel['Hotel Name'])}}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="rating">
                <span *ngFor="let i of [].constructor(recommendedHotel['Nombre de Etoile'])">⭐</span>
              </div>
              <p>{{recommendedHotel['Description']}}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" (click)="showDetails()">See details</button>
              <button mat-raised-button color="primary">Book now</button>
            </mat-card-actions>
          </mat-card>
        </div>

        <h2>All Hotels</h2>
        <div class="hotel-cards">
          <mat-card *ngFor="let hotel of hotels" class="hotel-card">
            <div class="hotel-image-container">
              <img [src]="hotel.image" [alt]="hotel.name" class="hotel-image">
            </div>
            <mat-card-header>
              <mat-card-title>{{hotel.name}}</mat-card-title>
              <mat-card-subtitle>{{hotel.location}}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="rating">
                <span *ngFor="let i of [].constructor(hotel.rating)">⭐</span>
              </div>
              <div class="price">{{hotel.price}} TD</div>
              <p>{{hotel.description}}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">See details</button>
              <button mat-raised-button color="primary">Book now</button>
            </mat-card-actions>
          </mat-card>
        </div>

        <div class="price-trends">
          <h3>Price trends</h3>
          <canvas #priceChart></canvas>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .container {
      height: calc(100vh - 64px);
    }

    .filters {
      width: 300px;
      padding: 20px;
      background-color: #f5f5f5;
    }

    .filters-title {
      color: #2196f3;
      margin-bottom: 20px;
      font-weight: 500;
      text-align: center;
    }

    .services-section {
      margin-bottom: 20px;
    }

    .recommendation-button {
      width: 100%;
      margin-top: 20px;
      height: 48px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .spinner {
      margin: 0 auto;
    }

    .content {
      padding: 20px;
      background-color: #ffffff;
    }

    .recommended-section {
      margin-bottom: 40px;
    }

    .recommended-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: #ff4081;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-weight: bold;
      z-index: 1;
    }

    .hotel-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .hotel-card {
      position: relative;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      }

      &.recommended {
        border: 2px solid #ff4081;
        box-shadow: 0 4px 8px rgba(255, 64, 129, 0.3);
      }

      .hotel-image-container {
        width: 100%;
        height: 200px;
        overflow: hidden;
      }

      .hotel-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      &:hover .hotel-image {
        transform: scale(1.05);
      }

      .rating {
        color: #ffd700;
        font-weight: bold;
        margin: 10px 0;
      }

      .price {
        color: #2196f3;
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 10px;
      }

      mat-card-header {
        padding-top: 16px;
      }

      mat-card-content {
        padding: 0 16px;
      }

      mat-card-actions {
        display: flex;
        justify-content: space-between;
        padding: 16px;
      }
    }

    .price-trends {
      margin-top: 40px;
      height: 400px;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    mat-form-field {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})


export class HotelsComponent implements OnInit, AfterViewInit {
  @ViewChild('priceChart') priceChart!: ElementRef;

  // État de chargement
  loading = false;

  // Filtres
  selectedLocation = '';
  selectedRoomType = '';
  dates = {
    checkIn: new Date(),
    checkOut: new Date(Date.now() + 86400000)
  };
  selectedPrice = 200;
  selectedRating = 3;
  selectedAgency = '';
  selectedServices: string[] = [];
  recommendedHotel: HotelRecommendationResponse | null = null;

  // Options pour les filtres
  locations = ['Hammamet', 'Sousse', 'Djerba', 'Monastir'];
  roomTypes = ['Chambre Standard', 'Chambre Double', 'Bungalow Double', 'Suite Fell Vue Mer'];
  ratings = [3, 4, 5];
  agencies = ['Agence 1', 'Agence 2'];
  availableServices = ['Piscine', 'Restaurant', 'Spa', 'Wi-Fi gratuit', 'Parking','Golf','centre de fitness ', 'Plage privée'];
  recommendationImageUrl = 'https://tse4.mm.bing.net/th/id/OIP.wdRcdYO5W4OTBgsHojYl1AHaE8?rs=1&pid=ImgDetMain';

  // Images fixes pour les hôtels
  hotelImages = {
    'Royal Azur Thalasso': '/assets/hotels/royal-azur.jpg',
    'Yasmine Beach Resort': '/assets/hotels/yasmine-beach.jpg',
    'Le Sultan': '/assets/hotels/le-sultan.jpg',
    'Djerba Palace': '/assets/hotels/djerba-palace.jpg',
    'Carthage Thalasso': '/assets/hotels/carthage-thalasso.jpg',
    'default': '/assets/hotels/default-hotel.jpg'
  };

  // Correspondance hôtel - localisation
  hotelLocations = {
    'Royal Azur Thalasso': 'Hammamet',
    'Yasmine Beach Resort': 'Hammamet',
    'Le Sultan': 'Sousse',
    'Djerba Palace': 'Djerba',
    'Carthage Thalasso': 'Tunis'
  };

  // Liste des hôtels
  hotels = [
    {
      name: 'Royal Azur Thalasso',
      location: 'Hammamet',
      rating: 5,
      price: 299.99,
      image: 'https://n-106-2.cdn.redgalaxy.com/file/o2/TUI/hotels/NBE16086/S23/22529600.jpg',
      description: 'Luxury seaside hotel with thalassotherapy'
    },
    {
      name: 'Yasmine Beach Resort',
      location: 'Hammamet',
      rating: 4,
      price: 199.99,
      image: 'https://tse1.mm.bing.net/th/id/OIP.Nv0SP5XPzG5YG8bQT7uV7QHaFj?pid=ImgDet&w=202&h=151&c=7&dpr=2',
      description: 'Modern hotel complex with direct access to the beach'
    },
    {
      name: 'Le Sultan',
      location: 'Sousse',
      rating: 4,
      price: 249.99,
      image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/297646191.jpg?k=7cb9765c4d2d2169f1b549986b2ebe5d5bcfb95ed921b1b1903bd1d36256f72e&o=&hp=1',
      description: 'Elegant hotel with traditional architecture and lush gardens'
    },
    {
      name: 'Djerba Palace',
      location: 'Djerba',
      rating: 5,
      price: 329.99,
      image: 'https://th.bing.com/th/id/R.106c176d969c23d406e68cb250ea13f4?rik=%2f78LPEcIhbnhog&pid=ImgRaw&r=0',
      description: 'Luxury resort on the island of Djerba with infinity pools'
    },
    {
      name: 'Carthage Thalasso',
      location: 'Tunis',
      rating: 5,
      price: 349.99,
      image: 'https://tse1.mm.bing.net/th/id/OIP.dKR8WBgMEDS_tILt_Bki0wHaED?rs=1&pid=ImgDetMain',
      description: 'Thalassotherapy center and 5-star hotel near Carthage'
    }
  ];

  constructor(
    private hotelService: HotelRecommendationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.setupPriceChart();
  }

  private setupPriceChart() {
    setTimeout(() => {
      if (this.priceChart) {
        const ctx = this.priceChart.nativeElement.getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
            datasets: [
              {
                label: 'Prix moyen(TND)',
                data: [340, 330, 320, 310, 300, 350, 400, 450, 380, 320, 310, 330],
                borderColor: '#ff4081',
                backgroundColor: 'rgba(255, 64, 129, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Prix moyen(TND)',
                data: [220, 210, 200, 190, 180, 230, 280, 300, 250, 200, 190, 210],
                borderColor: '#2196f3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4,
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        });
      }
    }, 500);
  }

  canSubmit(): boolean {
    return !!this.selectedLocation && 
           !!this.selectedRoomType && 
           this.selectedPrice > 0 && 
           !!this.selectedRating && 
           !!this.selectedAgency && 
           this.selectedServices.length > 0;
  }

  getRecommendation() {
    if (!this.canSubmit()) {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.loading = true;
    const formattedDate = this.formatDate(this.dates.checkIn);

    const request: HotelRecommendationRequest = {
      'Localisation': this.selectedLocation,
      'Type Chambre': this.selectedRoomType,
      'Prix': this.selectedPrice,
      'Nombre de Etoile': this.selectedRating,
      'Agence': this.selectedAgency,
      'Date': formattedDate,
      'Services & équipements': this.selectedServices
    };

    this.hotelService.getRecommendation(request).subscribe({
      next: (response: HotelRecommendationResponse) => {
        this.recommendedHotel = response;
        this.snackBar.open(response.message, 'OK', {
          duration: 5000
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de la recommandation:', error);
        this.snackBar.open('Erreur lors de la recommandation. Veuillez réessayer.', 'Fermer', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  showDetails() {
    if (this.recommendedHotel) {
      const message = `
Hotel Details:
Location: ${this.selectedLocation}
Room Type: ${this.selectedRoomType}
Price: ${this.selectedPrice} TD
Rating: ${this.selectedRating} stars
Agency: ${this.selectedAgency}
Date: ${this.formatDate(this.dates.checkIn)}
Services: ${this.selectedServices.join(', ')}
      `;

      this.snackBar.open(message, 'Close', {
        duration: 10000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['details-snackbar']
      });
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getHotelImage(hotelName: string): string {
    return this.hotelImages[hotelName as keyof typeof this.hotelImages] || this.hotelImages['default'];
  }

  findLocationByName(hotelName: string): string {
    return this.hotelLocations[hotelName as keyof typeof this.hotelLocations] || this.selectedLocation;
  }
}