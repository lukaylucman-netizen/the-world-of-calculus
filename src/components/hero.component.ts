import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    
    /* Animation for floating movement (naik turun) */
    @keyframes floatHero {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); } /* Jarak gerak melayang */
    }
    
    .animate-float-hero {
      animation: floatHero 3s ease-in-out infinite;
      will-change: transform;
    }

    /* Delay animation for the right one so they don't move exactly in sync */
    .delay-float {
      animation-delay: 1.5s;
    }
  `],
  template: `
    <section class="flex flex-col items-center justify-center relative px-4 pt-24 pb-10 min-h-[85vh]">
      
      <!-- Center Glowing Logo Effect -->
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#ccff00] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>

      <!-- === MOBILE TOP ROW: Superman + Logo === -->
      <!-- Visible ONLY on Mobile (md:hidden) -->
      <div class="relative mb-8 flex items-center justify-center gap-8 md:hidden">
         
         <!-- KIRI: Superman (Mobile) -->
         <div class="relative w-20 h-20 flex items-center justify-center animate-float-hero z-20">
            <img 
              src="https://i.ibb.co.com/d0WsgRZ1/Desain-tanpa-judul-3-removebg-preview.png" 
              alt="Superman Pixel Left" 
              class="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(204,255,0,0.5)]"
              style="image-rendering: pixelated;"
            />
         </div>

         <!-- TENGAH: Logo UPI (Mobile) -->
         <div class="relative group z-10 mx-2">
            <div class="absolute inset-0 bg-[#ccff00] blur-2xl opacity-30 rounded-full animate-pulse"></div>
            <img 
              src="https://upload.wikimedia.org/wikipedia/id/0/09/Logo_Almamater_UPI.svg" 
              alt="Logo UPI" 
              class="w-24 h-24 relative z-10 object-contain drop-shadow-[0_0_20px_rgba(204,255,0,0.6)]"
            />
         </div>

         <!-- KANAN: Superman (Mobile) -->
         <div class="relative w-20 h-20 flex items-center justify-center animate-float-hero delay-float z-20">
            <img 
              src="https://i.ibb.co.com/d0WsgRZ1/Desain-tanpa-judul-3-removebg-preview.png" 
              alt="Superman Pixel Right" 
              class="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(204,255,0,0.5)] transform scale-x-[-1]"
              style="image-rendering: pixelated;"
            />
         </div>

      </div>

      <!-- === DESKTOP MAIN LAYOUT: Left Super - [Center Stack] - Right Super === -->
      <div class="flex flex-col md:flex-row items-center justify-center w-full gap-4 md:gap-12 lg:gap-16 z-30">

        <!-- KIRI: Superman (Desktop Only) -->
        <div class="hidden md:flex relative w-40 h-40 lg:w-64 lg:h-64 items-center justify-center animate-float-hero z-20 shrink-0">
            <img 
              src="https://i.ibb.co.com/d0WsgRZ1/Desain-tanpa-judul-3-removebg-preview.png" 
              alt="Superman Pixel Left" 
              class="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(204,255,0,0.6)]"
              style="image-rendering: pixelated;"
            />
         </div>

        <!-- CENTER STACK: Logo, Badge, Title, Subtitle -->
        <div class="flex flex-col items-center">

            <!-- LOGO UPI (Desktop Only) -->
            <!-- Restore margin bottom (mb-6) for aesthetics -->
            <div class="hidden md:block relative group z-10 mb-6"> 
              <div class="absolute inset-0 bg-[#ccff00] blur-2xl opacity-20 rounded-full animate-pulse"></div>
              <img 
                src="https://upload.wikimedia.org/wikipedia/id/0/09/Logo_Almamater_UPI.svg" 
                alt="Logo UPI" 
                class="w-24 h-24 relative z-10 object-contain drop-shadow-[0_0_20px_rgba(204,255,0,0.6)]"
              />
            </div>

            <!-- Badge -->
            <!-- Restore margin bottom (mb-6) for aesthetics -->
            <div class="flex items-center gap-4 mb-6 animate-[fadeIn_1s_ease-out_forwards]">
              <div class="h-[1px] w-12 bg-gradient-to-l from-[#ccff00] to-transparent"></div>
              <div class="px-4 py-1 border border-[#ccff00]/30 rounded-full bg-[#ccff00]/5 backdrop-blur-sm">
                <span class="font-tech text-[#ccff00] text-xs font-bold tracking-[0.2em]">KELOMPOK 6 PRESENT</span>
              </div>
              <div class="h-[1px] w-12 bg-gradient-to-r from-[#ccff00] to-transparent"></div>
            </div>

            <!-- Main Title -->
            <!-- Restore margin bottom (mb-6) and internal spacing (mb-2) -->
            <h1 class="text-center flex flex-col items-center leading-none mb-6 animate-[fadeIn_1s_ease-out_0.2s_forwards]">
              <span class="font-tech text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-wider mb-2">THE WORLD OF</span>
              <span class="font-tech text-4xl md:text-6xl lg:text-7xl font-bold text-[#ccff00] neon-text tracking-widest leading-none">CALCULUS</span>
            </h1>

            <!-- Subtitle -->
            <!-- Restore margin bottom (mb-8) -->
            <h2 class="font-tech text-base md:text-lg text-[#ccff00] text-center max-w-2xl mb-8 tracking-widest uppercase font-bold animate-[fadeIn_1s_ease-out_0.4s_forwards]">
              Exploring the World of Calculus Step by Step
            </h2>

        </div>

        <!-- KANAN: Superman (Desktop Only) -->
        <div class="hidden md:flex relative w-40 h-40 lg:w-64 lg:h-64 items-center justify-center animate-float-hero delay-float z-20 shrink-0">
            <img 
              src="https://i.ibb.co.com/d0WsgRZ1/Desain-tanpa-judul-3-removebg-preview.png" 
              alt="Superman Pixel Right" 
              class="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(204,255,0,0.6)] transform scale-x-[-1]"
              style="image-rendering: pixelated;"
            />
         </div>

      </div>

      <!-- Description -->
      <p class="text-gray-400 text-center max-w-2xl text-sm md:text-base leading-relaxed mb-10 px-4 animate-[fadeIn_1s_ease-out_0.6s_forwards]">
        Dive into the fundamental study of continuous change. From derivatives to integrals, discover how calculus models the universe, 
        optimizes systems, and explains the infinite. Join us to explore the beauty of mathematical precision.
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col md:flex-row items-center justify-center gap-6 animate-[fadeIn_1s_ease-out_0.8s_forwards]">
        
        <!-- Explore Now Button (Solid) -->
        <button 
          (click)="navigateToModules()"
          class="w-full md:w-auto min-w-[220px] px-8 py-4 bg-[#ccff00] hover:bg-[#b3e600] text-black font-tech font-bold text-base tracking-[0.15em] transition-all duration-300 hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] uppercase rounded-2xl transform hover:-translate-y-1">
          EXPLORE NOW
        </button>

        <!-- Learn More Button (Outline) -->
        <button 
          (click)="scrollToFooter()"
          class="w-full md:w-auto min-w-[220px] px-8 py-4 bg-transparent border border-[#ccff00] hover:bg-[#ccff00]/10 text-[#ccff00] font-tech font-bold text-base tracking-[0.15em] transition-all duration-300 uppercase rounded-2xl transform hover:-translate-y-1">
          LEARN MORE
        </button>

      </div>

    </section>
  `
})
export class HeroComponent {
  private router: Router = inject(Router);

  navigateToModules() {
    this.router.navigate(['/modules']);
  }

  scrollToFooter() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      const element = document.querySelector('#footer-info');
      if (element) {
        const headerOffset = 80; 
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }
}