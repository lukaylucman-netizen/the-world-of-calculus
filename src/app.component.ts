import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar.component';
import { FooterComponent } from './components/footer.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavbarComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styles: [`
    @keyframes firefly-move {
      0% {
        transform: translateY(120vh) translateX(-10px);
        opacity: 0;
      }
      20% {
        opacity: 0.1;
      }
      50% {
        transform: translateY(50vh) translateX(15px);
        opacity: 0.6;
      }
      80% {
        opacity: 0.1;
      }
      100% {
        transform: translateY(-20vh) translateX(-10px);
        opacity: 0;
      }
    }

    .firefly {
      position: fixed;
      border-radius: 50%;
      background-color: #ccff00;
      pointer-events: none;
      z-index: 5;
      filter: blur(2px);
      box-shadow: 0 0 8px rgba(204, 255, 0, 0.4);
      animation-name: firefly-move;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  `]
})
export class AppComponent {}