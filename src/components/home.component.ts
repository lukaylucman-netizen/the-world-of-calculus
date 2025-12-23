import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeroComponent } from './hero.component';
import { SpeakersComponent } from './speakers.component';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeroComponent, SpeakersComponent],
  template: `
    <app-hero id="beranda" />
    <app-speakers id="narasumber" />
  `
})
export class HomeComponent {}