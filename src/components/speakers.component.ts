import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'app-speakers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: block; }'],
  template: `
    <section class="pt-10 pb-24 relative z-10 container mx-auto px-4">
      
      <!-- Section Header -->
      <div class="text-center mb-16">
        <h2 class="font-tech text-4xl md:text-6xl font-bold text-white mb-4 uppercase tracking-wider">
          MEMBERS <span class="text-[#ccff00]">OF</span><br/>
          <span class="text-[#ccff00]">KELOMPOK</span> 6
        </h2>
        <p class="text-gray-400 text-lg">Belajar dari para ahli dan profesional terbaik di bidangnya</p>
      </div>

      <!-- Grid Layout (Tanpa Border/Kotak) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
        
        @for (speaker of speakers(); track speaker.name) {
          <div class="group flex flex-col items-center text-center">
            
            <!-- Image Container (Floating Circle) -->
            <!-- Efek: Membesar sedikit saat di-hover, border menyala -->
            <div class="relative w-40 h-40 mb-6 rounded-full overflow-hidden border-4 border-[#ccff00]/20 group-hover:border-[#ccff00] transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_40px_rgba(204,255,0,0.3)]">
              <div class="absolute inset-0 bg-[#ccff00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
              <img 
                [src]="speaker.image" 
                alt="{{speaker.name}}" 
                class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110"
              />
            </div>

            <!-- Role Tag -->
            <div class="mb-4">
              <span class="px-3 py-1 rounded-full border border-[#ccff00]/40 text-[#ccff00] text-[10px] font-bold tracking-widest uppercase bg-black/30 backdrop-blur-sm flex items-center gap-2 mx-auto w-fit shadow-[0_0_10px_rgba(204,255,0,0.1)]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-7v4h4l-5 7z"/></svg>
                {{ speaker.role_tag }}
              </span>
            </div>

            <!-- Name -->
            <h3 class="font-tech text-xl font-bold text-white mb-3 group-hover:text-[#ccff00] transition-colors leading-tight drop-shadow-lg">{{ speaker.name }}</h3>

            <!-- Quote/Title (Rapat dengan elemen bawahnya) -->
            <!-- Dihapus min-h agar tidak ada space kosong jika text pendek -->
            <p class="text-gray-400 text-xs uppercase tracking-wide font-medium mb-1 leading-relaxed max-w-[250px] mx-auto">
              "{{ speaker.title }}"
            </p>
            
            <!-- Company -->
            <!-- Dihapus mt-auto agar menempel ke atas (quote) -->
            <div class="flex items-center justify-center gap-2 mb-6 text-[#ccff00]/80 text-[10px] font-bold">
              <svg class="shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              <span>{{ speaker.company }}</span>
            </div>

            <!-- Individual Profile Separator (Dibawah UPI) -->
            <!-- Garis tipis, lancip, transparan di ujung kiri & kanan -->
            <!-- md:hidden artinya disembunyikan pada layar medium (tablet/desktop) ke atas -->
            <div class="w-32 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent md:hidden"></div>

          </div>
        }

      </div>

      <!-- Decorative Dots -->
      <div class="flex justify-center gap-3 mt-20 opacity-50">
         <div class="w-1 h-1 rounded-full bg-[#ccff00]"></div>
         <div class="w-1 h-1 rounded-full bg-[#ccff00]"></div>
         <div class="w-1 h-1 rounded-full bg-[#ccff00]"></div>
         <div class="w-1 h-1 rounded-full bg-[#ccff00]"></div>
      </div>
    </section>
  `
})
export class SpeakersComponent {
  speakers = signal([
    {
      name: 'Lucky Luqmanul Hakim',
      title: 'Pengen jadi orang yang ga gampang berharap dan terlalu excited sama sesuatu.',
      company: 'PENDIDIKAN ILMU KOMPUTER UPI',
      role_tag: '2502736',
      image: 'https://i.ibb.co.com/hJ3WDNS1/Gemini-Generated-Image-mf7mldmf7mldmf7m.png'
    },
    {
      name: 'Dinda Nurul Fadila',
      title: 'Aku tuh nggak berharap banyak, cuma berharap kamu sadar kalau aku ada.',
      company: 'PENDIDIKAN ILMU KOMPUTER UPI',
      role_tag: '2507340',
      image: 'https://i.ibb.co.com/FbphHK1X/Gemini-Generated-Image-79rh9z79rh9z79rh.png'
    },
    {
      name: 'Kharisa Adinda Queenadia',
      title: 'Kadang hidup bukan tentang bahagia, tapi tentang bertahan sampai bisa bernapas lega lagi.',
      company: 'PENDIDIKAN ILMU KOMPUTER UPI',
      role_tag: '2500956',
      image: 'https://i.ibb.co.com/qYWy8LP8/Gemini-Generated-Image-txge85txge85txge.png'
    },
    {
      name: 'Juan Sura Arkana',
      title: 'Mau kita beli seisi dunia pun, Kita ga bakal bisa beli hatinya kalau bukan kita yang dia mau.',
      company: 'PENDIDIKAN ILMU KOMPUTER UPI',
      role_tag: '2501294',
      image: 'https://i.ibb.co.com/W92fv5r/Gemini-Generated-Image-7ze5bb7ze5bb7ze5.png'
    }
  ]);
}