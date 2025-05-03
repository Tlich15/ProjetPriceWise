import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  template: `
    <div class="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <button mat-raised-button color="primary" routerLink="/">
        Return to Home
      </button>
    </div>
  `,
  styles: [`
    .not-found-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background-color: #f5f5f5;

      h1 {
        font-size: 8em;
        margin: 0;
        color: #2196f3;
      }

      h2 {
        font-size: 2em;
        margin: 0;
        margin-bottom: 20px;
      }

      p {
        margin-bottom: 30px;
        color: #666;
      }
    }
  `]
})
export class NotFoundComponent {}