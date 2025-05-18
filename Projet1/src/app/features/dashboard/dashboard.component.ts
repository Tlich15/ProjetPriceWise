import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  template: `
    <div class="dashboard-container">
      <mat-tab-group>
        <mat-tab label="Price Alerts">
          <div class="tab-content">
            <mat-card *ngFor="let alert of priceAlerts">
              <mat-card-header>
                <mat-card-title>{{ alert.product }}</mat-card-title>
                <mat-card-subtitle>Target Price: {{ alert.targetPrice | currency }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>Current Price: {{ alert.currentPrice | currency }}</p>
                <p [class.price-reached]="alert.currentPrice <= alert.targetPrice">
                  Status: {{ alert.currentPrice <= alert.targetPrice ? 'Price reached!' : 'Monitoring' }}
                </p>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="warn" (click)="removeAlert(alert.id)">
                  <mat-icon>delete</mat-icon> Remove Alert
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Favorites">
          <div class="tab-content">
            <table mat-table [dataSource]="favorites">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let item">{{item.name}}</td>
              </ng-container>

              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>Price</th>
                <td mat-cell *matCellDef="let item">{{item.price | currency}}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button color="primary" (click)="viewDetails(item)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="removeFavorite(item)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['name', 'price', 'actions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'price', 'actions'];"></tr>
            </table>
          </div>
        </mat-tab>

        <mat-tab label="Search History">
          <div class="tab-content">
            <mat-card *ngFor="let search of searchHistory">
              <mat-card-header>
                <mat-card-title>{{ search.query }}</mat-card-title>
                <mat-card-subtitle>{{ search.date | date }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-actions>
                <button mat-button color="primary" (click)="repeatSearch(search)">
                  <mat-icon>refresh</mat-icon> Repeat Search
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .tab-content {
      padding: 20px 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .price-reached {
      color: #4caf50;
      font-weight: bold;
    }

    table {
      width: 100%;
    }

    .mat-mdc-row:hover {
      background-color: #f5f5f5;
    }
  `]
})
export class DashboardComponent implements OnInit {
  priceAlerts = [
    { id: 1, product: 'MacBook Pro', targetPrice: 1200, currentPrice: 1299.99 },
    { id: 2, product: 'iPad Pro', targetPrice: 700, currentPrice: 699.99 },
    { id: 3, product: 'iPhone 15', targetPrice: 900, currentPrice: 999.99 }
  ];

  favorites = [
    { name: 'MacBook Pro', price: 1299.99 },
    { name: 'Dell XPS', price: 999.99 },
    { name: 'iPad Pro', price: 799.99 }
  ];

  searchHistory = [
    { query: 'Laptops under $1000', date: new Date('2024-01-15') },
    { query: 'Gaming monitors', date: new Date('2024-01-14') },
    { query: 'Wireless earbuds', date: new Date('2024-01-13') }
  ];

  ngOnInit(): void {
    // Initialization code can go here
    console.log('Dashboard component initialized');
  }

  removeAlert(id: number) {
    this.priceAlerts = this.priceAlerts.filter(alert => alert.id !== id);
  }

  removeFavorite(item: any) {
    this.favorites = this.favorites.filter(fav => fav.name !== item.name);
  }

  viewDetails(item: any) {
    console.log('Viewing details for:', item.name);
  }

  repeatSearch(search: any) {
    console.log('Repeating search:', search.query);
  }
}