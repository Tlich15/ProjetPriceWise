import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Chart } from 'chart.js/auto';
import { CurrencyPipe } from '@angular/common';

// Import the specific components from mat-tabs
import { MatTab, MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CurrencyPipe
  ],
  template: `
    <div class="admin-container">
      <div class="kpi-cards">
        <mat-card *ngFor="let kpi of kpis">
          <mat-card-header>
            <mat-card-title>{{ kpi.title }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ kpi.value }}</h2>
            <p [class.positive]="kpi.change > 0" [class.negative]="kpi.change < 0">
              {{ kpi.change > 0 ? '+' : ''}}{{ kpi.change }}%
            </p>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-tab-group>
        <mat-tab label="Products">
          <div class="tab-content">
            <table mat-table [dataSource]="products">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let item">{{item.name}}</td>
              </ng-container>

              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>Price</th>
                <td mat-cell *matCellDef="let item">{{item.price | currency}}</td>
              </ng-container>

              <ng-container matColumnDef="vendor">
                <th mat-header-cell *matHeaderCellDef>Vendor</th>
                <td mat-cell *matCellDef="let item">{{item.vendor}}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button color="primary" (click)="editItem(item)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteItem(item)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="['name', 'price', 'vendor', 'actions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'price', 'vendor', 'actions'];"></tr>
            </table>
          </div>
        </mat-tab>

        <mat-tab label="Analytics">
          <div class="tab-content">
            <div class="chart-container">
              <canvas #priceChart></canvas>
            </div>
            <button mat-raised-button color="primary" (click)="predictPrices()">
              Generate Price Predictions
            </button>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .kpi-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;

      mat-card {
        text-align: center;

        h2 {
          font-size: 2em;
          margin: 10px 0;
        }

        .positive {
          color: #4caf50;
        }

        .negative {
          color: #f44336;
        }
      }
    }

    .tab-content {
      padding: 20px 0;
    }

    table {
      width: 100%;
    }

    .chart-container {
      height: 400px;
      margin-bottom: 20px;
    }

    button {
      margin-right: 8px;
    }
  `]
})
export class AdminComponent implements OnInit {
  @ViewChild('priceChart') priceChart: any;

  kpis = [
    { title: 'Average Price', value: '$999', change: 5.2 },
    { title: 'Price Deviation', value: '±$50', change: -2.1 },
    { title: 'Competitive Gap', value: '$150', change: 3.8 }
  ];

  products = [
    { name: 'MacBook Pro', price: 1299.99, vendor: 'Apple Store' },
    { name: 'Dell XPS', price: 999.99, vendor: 'Dell' },
    { name: 'iPad Pro', price: 799.99, vendor: 'Apple Store' }
  ];

  ngOnInit() {
    setTimeout(() => {
      this.setupChart();
    });
  }

  private setupChart() {
    if (this.priceChart) {
      const ctx = this.priceChart.nativeElement.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Average Price Trend',
            data: [950, 975, 1000, 990, 1010, 999],
            borderColor: '#2196f3',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }

  editItem(item: any) {
    console.log('Editing:', item);
  }

  deleteItem(item: any) {
    this.products = this.products.filter(p => p.name !== item.name);
  }

  predictPrices() {
    console.log('Generating price predictions...');
  }
}