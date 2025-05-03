import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink, RouterOutlet } from '@angular/router';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    RouterLink, 
    RouterOutlet
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <button mat-icon-button *ngIf="isHandset$ | async" (click)="drawer.toggle()">
        <mat-icon>menu</mat-icon>
      </button>
      <a routerLink="/" class="logo-container">
        <span class="logo">Price</span><span class="logo-accent">Comparator</span>
      </a>
      <span class="spacer"></span>
      
      <!-- Desktop Navigation -->
      <div class="desktop-nav" *ngIf="!(isHandset$ | async)">
        <button mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
          <mat-icon>home</mat-icon> Home
        </button>
        <button mat-button routerLink="/products" routerLinkActive="active-link">
          <mat-icon>shopping_cart</mat-icon> Products
        </button>
        <button mat-button routerLink="/hotels" routerLinkActive="active-link">
          <mat-icon>hotel</mat-icon> Hotels
        </button>
        <button mat-button routerLink="/flights" routerLinkActive="active-link">
          <mat-icon>flight</mat-icon> Flights
        </button>
        <button mat-button routerLink="/dashboard" routerLinkActive="active-link">
          <mat-icon>dashboard</mat-icon> Dashboard
        </button>
      </div>
      
      <!-- User Menu -->
      <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-button">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #userMenu="matMenu">
        <button mat-menu-item>
          <mat-icon>person</mat-icon> Profile
        </button>
        <button mat-menu-item>
          <mat-icon>settings</mat-icon> Settings
        </button>
        <button mat-menu-item>
          <mat-icon>exit_to_app</mat-icon> Logout
        </button>
      </mat-menu>
    </mat-toolbar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer mode="over" fixedInViewport
          [opened]="false"
          [mode]="(isHandset$ | async) ? 'over' : 'side'">
        <div class="sidenav-header">
          <h2>Menu</h2>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
            <mat-icon>home</mat-icon> Home
          </a>
          <a mat-list-item routerLink="/products" routerLinkActive="active-link">
            <mat-icon>shopping_cart</mat-icon> Products
          </a>
          <a mat-list-item routerLink="/hotels" routerLinkActive="active-link">
            <mat-icon>hotel</mat-icon> Hotels
          </a>
          <a mat-list-item routerLink="/flights" routerLinkActive="active-link">
            <mat-icon>flight</mat-icon> Flights
          </a>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon>dashboard</mat-icon> Dashboard
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
        
        <footer class="app-footer">
          <div class="container">
            <p>&copy; 2025 Price Comparator. All rights reserved.</p>
          </div>
        </footer>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .app-toolbar {
      height: 64px;
      padding: 0 16px;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: white;
      font-size: 20px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    
    .logo {
      margin-right: 2px;
    }
    
    .logo-accent {
      font-weight: 300;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .desktop-nav {
      display: flex;
      align-items: center;
      
      button {
        margin: 0 4px;
      }
      
      mat-icon {
        margin-right: 4px;
      }
    }
    
    .active-link {
      background-color: rgba(255, 255, 255, 0.15);
      border-radius: 4px;
    }
    
    .user-button {
      margin-left: 8px;
    }
    
    .sidenav-container {
      height: calc(100% - 64px);
    }
    
    .sidenav-header {
      height: 64px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      background-color: var(--primary-light);
      color: white;
    }
    
    mat-nav-list {
      padding-top: 0;
      
      a {
        height: 48px;
        display: flex;
        align-items: center;
        
        mat-icon {
          margin-right: 16px;
        }
      }
    }
    
    .content-wrapper {
      padding: 16px;
      min-height: calc(100vh - 64px - 60px); /* viewport - toolbar - footer */
    }
    
    .app-footer {
      background-color: var(--primary-dark);
      color: white;
      padding: 20px 0;
      text-align: center;
    }
    
    @media (max-width: 600px) {
      .app-toolbar {
        padding: 0 8px;
      }
      
      .logo-container {
        font-size: 18px;
      }
      
      .content-wrapper {
        padding: 12px;
      }
    }
  `]
})
export class AppComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver) {}
}