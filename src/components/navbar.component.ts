import { Component, ChangeDetectionStrategy, signal, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav 
      class="fixed top-0 w-full z-50 bg-[#071c10]/90 backdrop-blur-md border-b border-white/5 transition-all duration-300 py-4"
    >
      <div class="container mx-auto px-6 flex items-center justify-between relative">
        <!-- Logo Section -->
        <div class="flex items-center gap-3 cursor-pointer" [routerLink]="['/']">
          <div class="relative w-10 h-10 flex items-center justify-center">
             <!-- Logo Icon Simulation -->
             <svg viewBox="0 0 24 24" fill="none" class="w-10 h-10 text-[#ccff00] drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          </div>
          <div class="flex flex-col justify-center">
            <h1 class="font-tech text-xl md:text-2xl font-bold tracking-wider text-white leading-none">
              CALCULUS
            </h1>
            <span class="text-[10px] text-[#ccff00] uppercase tracking-wide opacity-90">
              Conquer Math with Technology
            </span>
          </div>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-8">
          @for (item of menuItems; track item.label) {
            <a 
              [routerLink]="item.path"
              [queryParams]="item.queryParams"
              [fragment]="item.fragment"
              class="font-tech text-sm font-medium text-gray-300 hover:text-[#ccff00] transition-colors tracking-widest uppercase relative group cursor-pointer"
            >
              {{ item.label }}
              <span class="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#ccff00] transition-all duration-300 group-hover:w-full"></span>
            </a>
          }
        </div>

        <!-- Mobile Menu Button -->
        <button 
          class="md:hidden text-white hover:text-[#ccff00] transition-colors focus:outline-none relative z-50"
          (click)="toggleMobileMenu()"
          aria-label="Toggle mobile menu"
        >
          @if (isMobileMenuOpen()) {
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          } @else {
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          }
        </button>

        <!-- Mobile Menu Dropdown (Popup Style) -->
        <!-- Pop-up aligned to the right, strictly limited width (w-64), not full width -->
        @if (isMobileMenuOpen()) {
          <div class="md:hidden absolute top-16 right-4 w-64 bg-[#071c10] border border-[#ccff00]/30 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-[scaleIn_0.2s_ease-out] overflow-hidden z-40 backdrop-blur-xl">
            <div class="flex flex-col p-2 space-y-1">
               @for (item of menuItems; track item.label) {
                <a 
                  [routerLink]="item.path"
                  [queryParams]="item.queryParams"
                  [fragment]="item.fragment"
                  (click)="toggleMobileMenu()"
                  class="font-tech text-sm font-medium text-gray-200 hover:bg-[#ccff00] hover:text-black transition-all duration-300 rounded-lg px-4 py-3 uppercase tracking-widest cursor-pointer flex items-center justify-between group"
                >
                  {{ item.label }}
                  <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </a>
              }
            </div>
          </div>
        }
      </div>
    </nav>
  `,
  styles: [`
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95) translateY(-10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `]
})
export class NavbarComponent {
  isMobileMenuOpen = signal(false);

  // Added queryParams to MATERI to ensure it resets the view to the list
  menuItems = [
    { label: 'HOME', path: ['/'], fragment: 'beranda', queryParams: {} },
    { label: 'MEMBERS', path: ['/'], fragment: 'narasumber', queryParams: {} },
    { label: 'MATERI', path: ['/modules'], fragment: undefined, queryParams: { view: 'list' } }
  ];

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }
}