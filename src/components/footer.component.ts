import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  styles: [':host { display: block; }'],
  template: `
    <footer id="footer-info" class="relative z-10 pt-12 pb-8 px-4 border-t border-white/5 bg-[#05140a]">
      
      <!-- Bottom Footer Info (Hidden on Modules Page) -->
      @if (!isSimpleFooter()) {
        <div class="container mx-auto animate-[fadeIn_0.5s_ease-out]">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <!-- Column 1: Brand -->
            <div>
              <div class="flex items-center gap-3 mb-4">
                <!-- Math/Calculator Logo -->
                <svg viewBox="0 0 24 24" fill="none" class="w-10 h-10 text-[#ccff00]" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <path d="M6 6l3 3m0-3l-3 3" transform="translate(1, 1)" />
                  <circle cx="17" cy="6" r="0.5" fill="currentColor" stroke="none" />
                  <line x1="15.5" y1="7.5" x2="18.5" y2="7.5" />
                  <circle cx="17" cy="9" r="0.5" fill="currentColor" stroke="none" />
                  <path d="M7.5 15v3m-1.5-1.5h3" />
                  <line x1="15.5" y1="16.5" x2="18.5" y2="16.5" />
                </svg>
                
                <h3 class="font-tech text-xl font-bold text-white tracking-widest">CALCULUS <span class="text-[#ccff00]">WORLD</span></h3>
              </div>
              <p class="text-gray-500 text-sm mb-2">Mathematics Series 2025</p>
              <p class="text-gray-400 text-sm leading-relaxed">
                A premier symposium bringing together mathematicians and students to explore the fundamental theorems and applications of calculus.
              </p>
            </div>

            <!-- Column 2: Menu -->
            <div>
              <h4 class="font-tech text-[#ccff00] text-lg font-bold mb-6 tracking-wider">MENU</h4>
              <ul class="space-y-3">
                @for (item of menuItems; track item.label) {
                  <li>
                    <a 
                      [routerLink]="item.path"
                      [fragment]="item.fragment"
                      class="text-gray-400 hover:text-[#ccff00] text-sm flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                      {{ item.label }}
                    </a>
                  </li>
                }
              </ul>
            </div>

            <!-- Column 3: Contact -->
            <div>
              <h4 class="font-tech text-[#ccff00] text-lg font-bold mb-6 tracking-wider">CONTACT</h4>
              <ul class="space-y-4">
                <li class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-[#ccff00] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span class="text-gray-400 text-sm">Program Studi Ilmu Komputer, FPMIPA UPI, Jl. Dr. Setiabudi No.229, Bandung</span>
                </li>
                <li class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-[#ccff00] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <span class="text-gray-400 text-sm">luckyluqmanulhakim@student.upi.edu</span>
                </li>
                <li class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-[#ccff00] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  <span class="text-gray-400 text-sm">+62 859-1101-22200</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      }

      <!-- Copyright -->
      <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-300" [class.mt-16]="!isSimpleFooter()" [class.pt-8]="!isSimpleFooter()" [class.border-t]="!isSimpleFooter()" [class.border-white-5]="!isSimpleFooter()">
        <p class="text-gray-500 text-xs text-center md:text-left">© 2025 Calculus World. All Rights Reserved</p>
        <p class="text-gray-500 text-xs flex items-center gap-1">
          Powered by <span class="text-[#ccff00] font-bold">Calculus Team 6</span>
        </p>
      </div>

    </footer>
  `
})
export class FooterComponent {
  private router = inject(Router);
  isSimpleFooter = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkRoute();
    });
    
    // Initial check
    this.checkRoute();
  }

  private checkRoute() {
    this.isSimpleFooter.set(this.router.url.includes('/modules'));
  }

  menuItems = [
    { label: 'HOME', path: ['/'], fragment: 'beranda' },
    { label: 'MEMBERS', path: ['/'], fragment: 'narasumber' },
    { label: 'MATERI', path: ['/modules'], fragment: undefined }
  ];
}