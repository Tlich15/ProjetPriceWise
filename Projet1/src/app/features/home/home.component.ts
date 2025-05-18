import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChatBotComponent } from '../../components/chat-bot/chat-bot.component';
import { HttpClientModule } from '@angular/common/http';

interface Promotion {
  title: string;
  description: string;
  image: string;
  price?: string;
}

interface Deal {
  title: string;
  image: string;
  link: string;
  vendor?: string;
  price?: string;
  savings?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ChatBotComponent,
    HttpClientModule
  ],
  template: `
    <div class="home-container">
      <div class="carousel">
        <div class="carousel-inner" [style.transform]="'translateX(' + (-currentSlide * 100) + '%)'">
          <div class="carousel-slide" *ngFor="let promo of promotions">
            <mat-card class="promo-card">
              <img [src]="promo.image" [alt]="promo.title">
              <mat-card-content>
                <h2>{{ promo.title }}</h2>
                <p>{{ promo.description }}</p>
                <h3 *ngIf="promo.price">{{ promo.price }}</h3>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
        <button mat-mini-fab color="primary" class="carousel-control prev" (click)="prevSlide()">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <button mat-mini-fab color="primary" class="carousel-control next" (click)="nextSlide()">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <div class="welcome-section">
        <h1>Welcome to PriceWise</h1>
        <p>Find the best prices for your travels and purchases</p>
      </div>

      <div class="services-section">
        <div class="service-card">
          <h3>Products</h3>
          <p>Compare product prices across different vendors</p>
        </div>
        <div class="service-card">
          <h3>Flights</h3>
          <p>Find the best airfare deals for your travels</p>
        </div>
        <div class="service-card">
          <h3>Hotels</h3>
          <p>Discover the best accommodation offers</p>
        </div>
      </div>

      <div class="trending-deals">
        <h2>More Information</h2>
        <div class="deals-grid">
          <mat-card *ngFor="let deal of trendingDeals" class="deal-card">
            <img [src]="deal.image" [alt]="deal.title" class="deal-image">
            <mat-card-header>
              <mat-card-title>{{ deal.title }}</mat-card-title>
              <mat-card-subtitle *ngIf="deal.vendor">{{ deal.vendor }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="price" *ngIf="deal.price">{{ deal.price }}</p>
              <p class="savings" *ngIf="deal.savings">{{ deal.savings }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" [routerLink]="deal.link">Details</button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <div class="quick-links">
        <button mat-raised-button color="primary" routerLink="/products">
          <mat-icon>shopping_cart</mat-icon>
          Products
        </button>
        <button mat-raised-button color="primary" routerLink="/hotels">
          <mat-icon>hotel</mat-icon>
          Hotels
        </button>
        <button mat-raised-button color="primary" routerLink="/flights">
          <mat-icon>flight</mat-icon>
          Flights
        </button>
        <button mat-raised-button color="primary" (click)="navigateToDashboard()">
          <mat-icon>dashboard</mat-icon>
          Dashboard
        </button>
      </div>

      <app-chat-bot></app-chat-bot>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      min-height: 100vh;
    }

    .carousel {
      position: relative;
      overflow: hidden;
      margin-bottom: 40px;
      border-radius: 8px;
      height: 400px;
    }

    .carousel-inner {
      display: flex;
      transition: transform 0.5s ease-in-out;
      height: 100%;
    }

    .carousel-slide {
      min-width: 100%;
      height: 100%;
    }

    .carousel-control {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
    }

    .prev {
      left: 20px;
    }

    .next {
      right: 20px;
    }

    .promo-card {
      height: 100%;
      img {
        width: 100%;
        height: 300px;
        object-fit: cover;
      }
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem;
      background: linear-gradient(135deg, #3f51b5 0%, #2196f3 100%);
      color: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .welcome-section h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .welcome-section p {
      font-size: 1.2rem;
      opacity: 0.9;
    }

    .services-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin: 2rem 0;
    }

    .service-card {
      padding: 2rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s ease;
      cursor: pointer;
    }

    .service-card:hover {
      transform: translateY(-5px);
    }

    .service-card h3 {
      color: #3f51b5;
      margin-bottom: 1rem;
    }

    .service-card p {
      color: #666;
      line-height: 1.5;
    }

    .trending-deals {
      margin: 40px 0;
    }

    .deals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }

    .deal-card {
      display: flex;
      flex-direction: column;
      
      .deal-image {
        height: 200px;
        object-fit: cover;
      }

      .price {
        font-size: 1.5em;
        font-weight: bold;
        color: #2196f3;
      }

      .savings {
        color: #4caf50;
        font-weight: 500;
      }
    }

    .quick-links {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin: 40px 0;
      flex-wrap: wrap;

      button {
        padding: 0 20px;
        height: 48px;
        
        mat-icon {
          margin-right: 8px;
        }
      }
    }

    @media (max-width: 600px) {
      .quick-links {
        flex-direction: column;
        button {
          width: 100%;
        }
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  currentSlide = 0;
  promotions: Promotion[] = [
    {
      title: 'Book Your Dream Stay in Tunisia',
      description: 'Discover our best offers for unforgettable holidays',
      image: 'https://littleweekends.fr/wp-content/uploads/2022/12/La-Villa-Mauresque-hotel-de-charme-Cote-d-Azur-piscine-1-1.jpg'
    },
    {
      title: 'Buy Premium Products at Best Prices',
      description: 'Get up to 50% off on the latest gadgets',
      image: 'https://www.lineaires.com/var/site/storage/images/_aliases/large/3/9/7/1/581793-2-fre-FR/import_image_image001.jpg'
    },
    {
      title: 'Find Your Flight & Compare Best Offers',
      description: 'Millions of affordable flights! One simple search',
      price: 'With our agencies',
      image: 'https://d1s8koojop3egi.cloudfront.net//photos/content/gallery/gallery11006/slidevool.jpg'
    }
  ];

  trendingDeals: Deal[] = [
    {
      title: 'Track Product Prices in Our Stores',
      image: 'https://www.tunisie-tribune.com/wp-content/uploads/2022/07/Carrefour-Geant-Monoprix-et-MG-reduisent-les-prix-de-certains-produits.jpg',
      link: '/products',
      vendor: 'Supermarkets',
      price: 'From 0 TND',
      savings: 'Up to -50%'
    },
    {
      title: 'Our Best Hotels in Tunisia',
      image: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
      link: '/hotels',
      vendor: 'Partner Hotels',
      price: 'From 100 TND',
      savings: 'Up to -30%'
    },
    {
      title: 'Book Affordable Flights with Your Favorite Airline',
      image: 'https://cdn.turkishairlines.com/m/13b3d6ce84d63471/original/Coffee-service-in-THY-Business-Class-cabin.jpg',
      link: '/flights',
      vendor: 'Airlines',
      price: 'From 200 TND',
      savings: 'Up to -25%'
    }
  ];

  ngOnInit() {
    this.startCarousel();
  }

  private startCarousel() {
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentSlide = this.currentSlide === this.promotions.length - 1 
      ? 0 
      : this.currentSlide + 1;
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 
      ? this.promotions.length - 1 
      : this.currentSlide - 1;
  }

  navigateToDashboard() {
    window.location.href = 'http://127.0.0.1:5000';
  }
}