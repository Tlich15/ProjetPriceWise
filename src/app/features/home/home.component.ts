import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
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
                <h3>{{ promo.price | currency }}</h3>
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

      <div class="trending-deals">
        <h2>More Information</h2>
        <div class="deals-grid">
          <mat-card *ngFor="let deal of trendingDeals" class="deal-card">
            <img [src]="deal.image" [alt]="deal.title" class="deal-image">
            <mat-card-header>
              <mat-card-title>{{ deal.title }}</mat-card-title>
              <mat-card-subtitle>{{ deal.vendor }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="price">{{ deal.price | currency }}</p>
              <p class="savings" *ngIf="deal.savings">Save {{ deal.savings | currency }}</p>
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
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
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
      margin-top: 40px;

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
  promotions = [
    {
      title: 'Book Your Dream Stay in Tunisia',
      description: 'Discover our best offers for an unforgettable vacation',
      logos: [
        'https://www.traveltodo.com/dist/img/logo.png',
        'https://i.pinimg.com/280x280_RS/cf/7b/b4/cf7bb40b45fb8829898459e3d6f14b3f.jpg'
      ],
      image: 'https://littleweekends.fr/wp-content/uploads/2022/12/La-Villa-Mauresque-hotel-de-charme-Cote-d-Azur-piscine-1-1.jpg'
    },
    {
      title: 'Shop Premium Products at Best Prices Now',
      description: 'Enjoy up to 50% discounts on the latest gadgets',
      image: 'https://www.lineaires.com/var/site/storage/images/_aliases/large/3/9/7/1/581793-2-fre-FR/import_image_image001.jpg'
    },
    {
      title: 'Find Your Flight & Compare Best Offers',
      description: 'Millions of affordable flights! Just one simple search',
      price: 'With Our Agencies',
      image: 'https://d1s8koojop3egi.cloudfront.net//photos/content/gallery/gallery11006/slidevool.jpg'
    }
  ];

  trendingDeals = [
    {
      title: 'Track Prices of Products from Our Stores',
      vendor: '',
      price: '',
      savings:'',
      image: 'https://www.tunisie-tribune.com/wp-content/uploads/2022/07/Carrefour-Geant-Monoprix-et-MG-reduisent-les-prix-de-certains-produits.jpg',
      link: '/products/macbook-pro'
    },
    {
      title: 'Our Finest Hotels in Tunisia',
      image: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
      link: '/hotels/beach-resort'
    },
    {
      title: 'Book Affordable Flights with Your Preferred Airline',
      image: 'https://cdn.turkishairlines.com/m/13b3d6ce84d63471/original/Coffee-service-in-THY-Business-Class-cabin.jpg',
      link: '/flights/london-paris'
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
    this.currentSlide = (this.currentSlide + 1) % this.promotions.length;
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 
      ? this.promotions.length - 1 
      : this.currentSlide - 1;
  }
}