
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './src/app.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling, Routes } from '@angular/router';
import { HomeComponent } from './src/components/home.component';
import { MaterialsComponent } from './src/components/materials.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'modules', component: MaterialsComponent },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes, 
      withHashLocation(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    )
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
