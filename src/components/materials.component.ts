import { Component, ChangeDetectionStrategy, signal, inject, ViewEncapsulation, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { DOCUMENT, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MaterialTopic {
  id: string;
  title: string;
  shortDesc: string;
  icon: string;
  chartSvg: string; 
  detailVisual: string; 
  content: {
    definition: string;
    formulas: { label: string; equation: string }[]; 
    example: {
      question: string;
      answer: string;
      steps: string[];
    };
  };
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  time: Date;
}

@Component({
  selector: 'app-materials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [FormsModule, DatePipe],
  styles: [`
    /* Custom Animations for SVGs */
    @keyframes floatMath {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-float-1 { animation: floatMath 3s ease-in-out infinite; }
    .animate-float-2 { animation: floatMath 4s ease-in-out infinite 0.5s; }
    
    @keyframes drawWave {
      to { stroke-dashoffset: 0; }
    }
    .wave-path {
      stroke-dasharray: 100;
      stroke-dashoffset: 100;
      animation: drawWave 3s linear infinite alternate;
    }

    /* Interactive SVG Classes */
    .hover-group {
      cursor: pointer;
    }
    .hover-reveal {
      opacity: 0;
      transition: opacity 0.3s ease-in-out, transform 0.3s ease;
      pointer-events: none;
    }
    .hover-group:hover .hover-reveal,
    .hover-group:active .hover-reveal {
      opacity: 1;
      transform: translateY(-5px);
    }

    /* Firefly Animation */
    @keyframes firefly-move {
      0% { transform: translateY(120vh) translateX(-10px); opacity: 0; }
      20% { opacity: 0.1; }
      50% { transform: translateY(50vh) translateX(15px); opacity: 0.6; }
      80% { opacity: 0.1; }
      100% { transform: translateY(-20vh) translateX(-10px); opacity: 0; }
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

    /* CHATBOT STYLES */
    .chat-scroll::-webkit-scrollbar {
      width: 4px;
    }
    .chat-scroll::-webkit-scrollbar-track {
      background: #05140a;
    }
    .chat-scroll::-webkit-scrollbar-thumb {
      background: #ccff00;
      border-radius: 2px;
    }
    
    /* Typing Animation */
    .typing-dot {
      width: 4px;
      height: 4px;
      background: #ccff00;
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out both;
    }
    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes typing {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    /* Bot Message Rich Styles - FORCE WHITE TEXT */
    .bot-card {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(204, 255, 0, 0.3);
      border-radius: 8px;
      padding: 12px;
      margin-top: 5px;
      font-family: 'JetBrains Mono', monospace;
      color: #ffffff !important;
    }
    .bot-title {
      color: #ccff00;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 1px;
      margin-bottom: 6px;
      display: block;
      border-bottom: 1px dashed rgba(204, 255, 0, 0.2);
      padding-bottom: 4px;
    }
    .bot-code {
      font-family: 'JetBrains Mono', monospace;
      background: #000;
      color: #a5f3fc; /* Cyan-ish for code */
      padding: 6px 10px;
      border-radius: 4px;
      display: block;
      margin: 6px 0;
      font-size: 0.8rem;
      border-left: 3px solid #ccff00;
      white-space: pre-wrap;
    }
    .bot-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .bot-list li {
      position: relative;
      padding-left: 15px;
      margin-bottom: 4px;
      font-size: 0.8rem;
      color: #ffffff !important;
    }
    .bot-list li::before {
      content: '>';
      position: absolute;
      left: 0;
      color: #ccff00;
      font-weight: bold;
      font-family: monospace;
    }
    
    /* Terminal Style Box for Formulas */
    .terminal-box {
      background-color: #0d1117;
      border: 1px solid #30363d;
      border-radius: 8px;
      font-family: 'Times New Roman', serif; /* Use Serif for Math look */
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
      max-width: 100%; /* Prevent box from pushing width */
    }
    .terminal-header {
      background-color: #161b22;
      padding: 8px 12px;
      border-bottom: 1px solid #30363d;
      display: flex;
      align-items: center;
      gap: 6px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      font-family: 'JetBrains Mono', monospace; /* Keep header monospaced */
    }
    .terminal-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    
    /* --- MATHEMATICAL STYLING CLASSES --- */
    /* Updated for Strict Horizontal Layout on Formulas */
    .math-container {
      display: flex;
      align-items: center;
      justify-content: center; /* Center by default */
      flex-wrap: nowrap; /* CRITICAL: Formulas always one line */
      overflow-x: auto; /* Scroll if too wide */
      white-space: nowrap; /* Prevent wrap */
      gap: 8px;
      color: #fff;
      font-size: 1.2rem;
      line-height: 1.5;
      font-style: italic;
      padding-bottom: 8px; /* Extra space for scrollbar */
      width: 100%;
      max-width: 100%; /* Ensure it fits in parent */
    }
    
    /* Scrollbar styling for math container */
    .math-container::-webkit-scrollbar {
       height: 6px; 
    }
    .math-container::-webkit-scrollbar-thumb {
       background: #ccff00;
       border-radius: 3px;
    }
    .math-container::-webkit-scrollbar-track {
       background: rgba(255,255,255,0.05);
    }

    .math-normal {
      font-style: normal;
    }
    .math-symbol {
      color: #ccff00;
      font-weight: bold;
      font-style: normal;
      margin: 0 4px;
    }
    
    /* Fraction Layout */
    .math-fraction {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      vertical-align: middle;
      margin: 0 4px;
      font-size: 0.9em; /* Slightly smaller relative to container */
    }
    .fraction-top {
      border-bottom: 1px solid #fff;
      padding-bottom: 1px;
      text-align: center;
      width: 100%;
      display: block;
    }
    .fraction-bottom {
      padding-top: 1px;
      text-align: center;
      width: 100%;
      display: block;
    }
    
    /* Root Layout */
    .math-root {
      white-space: nowrap;
    }
    .root-content {
      border-top: 1px solid #fff;
      padding-top: 1px;
      padding-left: 2px;
    }
    
    sup {
      font-size: 0.7em;
      color: #a5f3fc;
      vertical-align: super;
    }

    /* Steps Content Styling */
    .step-content {
      /* IMPORTANT: Allow text to wrap naturally */
      white-space: normal;
      word-wrap: break-word;
      display: block;
      width: 100%;
    }
  `],
  template: `
    <!-- SVG Definitions -->
    <svg width="0" height="0" class="absolute">
      <defs>
        <filter id="wobble">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>

    <!-- Global container -->
    <section id="materi" class="pt-36 md:pt-40 pb-24 relative z-10 container mx-auto px-4 min-h-screen flex flex-col justify-center font-comic overflow-x-hidden">
      
      <!-- === TOMBOL KEMBALI KE HOME === -->
      <div class="absolute top-28 left-4 md:left-8 z-40">
        <button 
          (click)="goHome()"
          class="group flex items-center gap-2 px-5 py-2 rounded-full border border-[#ccff00]/30 hover:border-[#ccff00] bg-[#071c10]/80 backdrop-blur hover:bg-[#ccff00] transition-all duration-300 shadow-lg"
        >
          <svg class="w-5 h-5 text-[#ccff00] group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          <span class="font-tech text-sm font-bold text-[#ccff00] group-hover:text-black tracking-widest transition-colors">HOME</span>
        </button>
      </div>

      <!-- Header List Modul -->
      <div class="text-center mb-16 relative mt-6 md:mt-0">
        <h2 class="font-tech text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider neon-text-glow">
          CORE <span class="text-[#ccff00] drop-shadow-[0_0_15px_rgba(204,255,0,0.8)]">MODULES</span>
        </h2>
        <div class="h-1.5 w-32 bg-[#ccff00] mx-auto rounded-full shadow-[0_0_20px_rgba(204,255,0,0.8)]"></div>
        <p class="text-gray-300 mt-6 max-w-2xl mx-auto font-medium text-lg">
          Pilih modul di bawah untuk memulai petualangan kalkulusmu!
        </p>
      </div>

      <!-- Grid Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 relative z-10 max-w-7xl mx-auto w-full">
        @for (topic of topics; track topic.id; let i = $index) {
          <div 
            class="relative w-full aspect-square max-w-[220px] mx-auto md:max-w-none cursor-pointer transition-transform duration-300 hover:scale-105 group"
            (click)="openTopic(topic)"
          >
            <!-- Cloud Shape BG -->
            <svg class="absolute inset-0 w-full h-full drop-shadow-[0_0_20px_rgba(204,255,0,0.3)] group-hover:drop-shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all duration-300" viewBox="0 0 300 300" preserveAspectRatio="none">
              <path [attr.d]="getCloudPath(i)" fill="#ccff00" />
            </svg>

            <!-- Content -->
            <div class="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
              <div class="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center mb-2 group-hover:rotate-12 transition-transform duration-300 shadow-sm">
                <div class="w-7 h-7 text-black" [innerHTML]="safeHtml(topic.icon)"></div>
              </div>
              <h3 class="font-black text-lg text-black tracking-tight mb-1 uppercase transform -rotate-1">{{ topic.title }}</h3>
              <p class="text-[10px] font-bold text-black/70 leading-tight mb-2 max-w-[160px]">{{ topic.shortDesc }}</p>
              <div class="w-full max-w-[140px] h-20 relative flex items-center justify-center mt-1">
                <div class="w-full h-full bg-paper rounded-lg p-2 overflow-hidden relative shadow-inner ring-0">
                   <div class="absolute inset-0 bg-grid-pattern pointer-events-none"></div>
                   <div class="w-full h-full relative z-10" [innerHTML]="safeHtml(topic.chartSvg)"></div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- === DETAIL OVERLAY (TAMPILAN MATERI) === -->
    @if (activeTopic()) {
      <!-- Z-Index 5000: High enough to cover normal content, but lower than Chat (10000) -->
      <div id="overlay-scroll-container" class="fixed inset-0 z-[5000] bg-[#071c10] overflow-y-auto animate-[slideIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
         <div class="fixed inset-0 grid-bg pointer-events-none z-0 opacity-100"></div>
         <div class="fixed top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#1a4d2b] to-transparent opacity-40 pointer-events-none z-0"></div>
         
         <!-- Wrapper with min-h-[100dvh] ensures footer sits at bottom on mobile -->
         <div class="min-h-[100dvh] flex flex-col relative z-10">

           <!-- Header with Back Button (In-Flow, No Sticky) -->
           <!-- Added ample pt-24 (mobile) and md:pt-32 (desktop) to ensure text isn't cut off -->
           <div class="container mx-auto px-4 pt-24 md:pt-32 pb-4">
               
               <!-- HERO HEADER SECTION -->
               <div class="flex flex-col md:flex-row gap-6 items-center md:items-start relative">
                    
                    <!-- Back Button Group (Top Left on Mobile, Left of Logo on Desktop) -->
                    <div class="w-full md:w-auto flex justify-start order-1 mb-4 md:mb-0 md:mt-8">
                        <button (click)="closeTopic()" class="
                            group flex items-center gap-2 px-5 py-2 rounded-full border border-[#ccff00]/30 hover:border-[#ccff00] bg-[#071c10]/80 backdrop-blur hover:bg-[#ccff00] transition-all duration-300 shadow-lg cursor-pointer
                        ">
                            <svg class="w-5 h-5 text-[#ccff00] group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                            <span class="font-tech text-sm font-bold text-[#ccff00] group-hover:text-black tracking-widest transition-colors">BACK</span>
                        </button>
                    </div>

                    <!-- Logo & Title Group -->
                    <div class="flex flex-col md:flex-row items-center gap-8 order-2 w-full">
                        <!-- Logo -->
                        <div class="shrink-0">
                             <div class="w-24 h-24 md:w-32 md:h-32 bg-[#ccff00] rounded-full flex items-center justify-center text-black shadow-[0_0_40px_rgba(204,255,0,0.4)]">
                                <div class="w-12 h-12 md:w-16 md:h-16" [innerHTML]="safeHtml(activeTopic()?.icon || '')"></div>
                             </div>
                        </div>

                        <!-- Title & Desc -->
                        <div class="text-center md:text-left">
                            <h1 class="text-4xl md:text-7xl font-bold text-white mb-2 font-tech neon-text-glow uppercase leading-tight">{{ activeTopic()?.title }}</h1>
                            <p class="text-lg md:text-xl text-gray-400 font-medium tracking-wide">{{ activeTopic()?.shortDesc }}</p>
                        </div>
                    </div>

               </div>
           </div>

           <!-- Content grows to fill space, pushing footer down -->
           <div class="container mx-auto px-4 pb-12 max-w-5xl flex-grow pt-8">
              
              <div class="grid lg:grid-cols-2 gap-12">
                 <!-- Kolom Kiri: Definisi & Rumus -->
                 <div class="space-y-8">
                    <div class="bg-white/5 p-6 rounded-2xl border-l-4 border-[#ccff00] backdrop-blur-sm">
                       <h3 class="text-[#ccff00] text-xl font-bold mb-4">DEFINISI</h3>
                       <p class="text-white leading-relaxed text-justify">{{ activeTopic()?.content?.definition }}</p>
                    </div>
                    <div>
                       <h3 class="text-[#ccff00] text-xl font-bold mb-4">RUMUS MATEMATIKA</h3>
                       <div class="space-y-6">
                          @for (f of activeTopic()?.content?.formulas; track f.label) {
                             <div class="terminal-box overflow-hidden shadow-lg hover:shadow-[#ccff00]/20 transition-all">
                                <div class="terminal-header">
                                   <div class="terminal-dot bg-red-500"></div><div class="terminal-dot bg-yellow-500"></div><div class="terminal-dot bg-green-500"></div>
                                   <span class="text-[12px] text-gray-400 ml-2 font-mono uppercase tracking-widest">{{f.label}}</span>
                                </div>
                                <div class="p-6 bg-[#0d1117] flex justify-center items-center min-h-[100px]">
                                   <!-- Formula Container using HTML Fractions, strictly horizontal -->
                                   <div class="math-container" [innerHTML]="safeHtml(f.equation)"></div>
                                </div>
                             </div>
                          }
                       </div>
                    </div>
                 </div>

                 <!-- Kolom Kanan: Soal & Visual -->
                 <div class="flex flex-col gap-8">
                    <div class="bg-[#1a4d2b] p-8 rounded-3xl border border-[#ccff00]/30 relative overflow-hidden shadow-[0_0_30px_rgba(26,77,43,0.8)] backdrop-blur-sm">
                       <div class="absolute top-0 right-0 p-4 opacity-10">
                          <svg class="w-32 h-32 text-[#ccff00]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                       </div>
                       <h3 class="text-white font-bold text-2xl mb-6 relative z-10">CONTOH SOAL</h3>
                       <div class="space-y-6 relative z-10">
                          <div class="text-white font-serif italic text-lg border-b border-white/20 pb-4 mb-4" [innerHTML]="safeHtml(activeTopic()?.content?.example?.question || '')"></div>
                          <div class="space-y-4">
                             @for (step of activeTopic()?.content?.example?.steps; track step; let i = $index) {
                                <div class="flex gap-3 text-sm text-gray-200 items-start w-full">
                                   <span class="text-[#ccff00] font-bold min-w-[20px] mt-0.5 shrink-0">{{i+1}}.</span>
                                   <!-- Changed from span to div and removed nowrap to allow natural wrapping -->
                                   <div class="step-content leading-relaxed font-serif" [innerHTML]="safeHtml(step)"></div>
                                </div>
                             }
                          </div>
                          
                          <!-- Updated Answer Section: Label Outside, Black Text Inside -->
                          <div class="mt-8 relative group">
                              <h4 class="text-[#ccff00] text-xs font-bold uppercase tracking-widest mb-2 ml-1">JAWABAN</h4>
                              <div class="bg-[#ccff00] p-4 rounded-xl text-center font-bold text-xl shadow-[0_0_20px_rgba(204,255,0,0.6)]">
                                  <div class="math-container justify-center" style="color: black !important;" [innerHTML]="safeHtml(activeTopic()?.content?.example?.answer || '')"></div>
                              </div>
                          </div>

                       </div>
                    </div>

                    <div class="bg-black border border-[#ccff00]/50 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                        <h4 class="text-[#ccff00] text-center font-tech text-lg font-bold tracking-widest uppercase mb-6 drop-shadow-md">
                           Visualisasi Interaktif
                        </h4>
                        <!-- Grid removed here, Pure Black BG -->
                        <div class="w-full max-w-full h-80 mx-auto bg-black rounded-2xl p-0 overflow-hidden relative shadow-inner ring-1 ring-[#ccff00]/30 group/visual flex items-center justify-center">
                             <!-- Visual SVG Injected Here -->
                             <div class="w-full h-full relative z-10" [innerHTML]="safeHtml(activeTopic()?.detailVisual || '')"></div>
                        </div>
                        <p class="text-center text-gray-500 text-xs mt-4">
                           Animasi berjalan otomatis.
                        </p>
                    </div>
                 </div>
              </div>

              <div class="mt-16 text-center pb-8">
                 <button (click)="closeTopic()" class="w-full md:w-auto px-8 py-3 bg-transparent border border-white/20 text-gray-300 hover:text-black hover:bg-[#ccff00] hover:border-[#ccff00] rounded-xl transition-all uppercase tracking-widest font-bold shadow-lg">CLOSE & BACK TO MODULES</button>
              </div>
           </div>
           
           <footer class="py-8 border-t border-white/10 bg-[#05140a] w-full shrink-0 mt-auto">
             <div class="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
               <p class="text-gray-500 text-xs text-center md:text-left">© 2025 Calculus World. All Rights Reserved</p>
               <p class="text-gray-500 text-xs flex items-center gap-1">Powered by <span class="text-[#ccff00] font-bold">Calculus Team 6</span></p>
             </div>
           </footer>
         </div>
      </div>
    }

    <!-- === SMART AUTO-REPLY BOT WIDGET === -->
    <!-- Z-Index 9999 ensures this floats above EVERYTHING, improved positioning for mobile/desktop -->
    <div class="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-[9999] flex flex-col items-end gap-3 pointer-events-auto font-sans">
      @if (isChatOpen()) {
        <div class="w-[340px] max-w-[90vw] h-[480px] max-h-[70vh] bg-[#071c10] border border-[#ccff00]/50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)] origin-bottom-right">
          <!-- Header -->
          <div class="p-3 bg-gradient-to-r from-[#ccff00]/20 to-[#071c10] border-b border-[#ccff00]/30 flex items-center justify-between backdrop-blur-md">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-[#ccff00] flex items-center justify-center relative shadow-[0_0_10px_#ccff00]">
                 <svg class="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5A2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5"/></svg>
              </div>
              <div>
                <h3 class="font-tech text-white text-sm font-bold tracking-wider">CALC-BOT</h3>
                <p class="text-[9px] text-[#ccff00] uppercase tracking-widest leading-none">Auto Assistant</p>
              </div>
            </div>
            <button (click)="toggleChat()" class="text-gray-400 hover:text-white transition-colors bg-white/5 rounded-full p-1 hover:bg-white/10">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Messages Area -->
          <div #chatContainer class="flex-1 overflow-y-auto p-3 space-y-3 chat-scroll bg-grid-pattern bg-opacity-5">
            @if (chatMessages().length === 0) {
               <div class="flex gap-2 animate-[fadeIn_0.5s]">
                  <div class="w-6 h-6 rounded-full bg-[#ccff00]/20 flex-shrink-0 flex items-center justify-center text-[#ccff00] text-[10px] font-bold border border-[#ccff00]/50 mt-1">AI</div>
                  <div class="flex-1">
                    <div class="bg-[#1a2e20] p-3 rounded-2xl rounded-tl-none border border-white/20 text-sm font-medium shadow-md mb-2 font-mono text-xs leading-relaxed" style="color: #ffffff !important;">
                       <span class="font-bold" style="color: #ffffff !important;">SYSTEM ONLINE...</span><br>
                       <span style="color: #ffffff !important;">Menunggu input user. Silakan pilih topik atau ketik perintah.</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        @for (prompt of quickPrompts; track prompt) {
                          <button (click)="sendMessage(prompt)" class="text-[10px] font-bold font-code text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00] hover:bg-[#ccff00] hover:text-black rounded-lg p-2 text-center transition-all shadow-[0_0_10px_rgba(204,255,0,0.3)]">
                              > {{ prompt }}
                          </button>
                        }
                    </div>
                  </div>
               </div>
            }
            @for (msg of chatMessages(); track msg.time) {
               <div class="flex gap-2 animate-[slideIn_0.3s]" [class.flex-row-reverse]="msg.sender === 'user'">
                  <div class="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border mt-1"
                       [class.bg-white]="msg.sender === 'user'" 
                       [class.text-black]="msg.sender === 'user'"
                       [class.bg-[#ccff00]/20]="msg.sender === 'bot'"
                       [class.text-[#ccff00]]="msg.sender === 'bot'"
                       [class.border-[#ccff00]/50]="msg.sender === 'bot'"
                       [class.border-transparent]="msg.sender === 'user'">
                       {{ msg.sender === 'user' ? 'U' : 'AI' }}
                  </div>
                  <div class="p-3 rounded-2xl text-sm shadow-md max-w-[85%]"
                       [class.bg-[#ccff00]]="msg.sender === 'user'"
                       [class.text-black]="msg.sender === 'user'"
                       [class.font-medium]="msg.sender === 'user'"
                       [class.rounded-tr-none]="msg.sender === 'user'"
                       [class.bg-[#1a2e20]]="msg.sender === 'bot'"
                       [class.text-white]="msg.sender === 'bot'"
                       [class.border]="msg.sender === 'bot'"
                       [class.border-white-10]="msg.sender === 'bot'"
                       [class.rounded-tl-none]="msg.sender === 'bot'"
                       [style.color]="msg.sender === 'bot' ? '#ffffff !important' : ''">
                       <div [innerHTML]="safeHtml(msg.text)" class="leading-relaxed"></div>
                       <div class="text-[9px] mt-1 opacity-60 text-right font-mono" [class.text-black]="msg.sender === 'user'" [class.text-white]="msg.sender === 'bot'">
                          {{ msg.time | date:'HH:mm' }}
                       </div>
                  </div>
               </div>
            }
            @if (isTyping()) {
               <div class="flex gap-2 animate-pulse">
                  <div class="w-6 h-6 rounded-full bg-[#ccff00]/20 flex-shrink-0 border border-[#ccff00]/50 mt-1"></div>
                  <div class="bg-[#1a2e20] p-3 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-1">
                     <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
                  </div>
               </div>
            }
          </div>

          <!-- Input Area -->
          <div class="p-2 bg-[#05140a] border-t border-white/10 flex gap-2 items-center">
             <input type="text" [(ngModel)]="userInput" (keyup.enter)="sendMessage()" placeholder="Input command..." class="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-medium text-sm focus:outline-none focus:border-[#ccff00] font-mono placeholder:text-white/80">
             <button (click)="sendMessage()" [disabled]="!userInput.trim() || isTyping()" class="w-9 h-9 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] flex items-center justify-center text-black disabled:opacity-50 transition-all shadow-lg">
                <svg class="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
             </button>
          </div>
        </div>
      }
      <button (click)="toggleChat()" class="w-14 h-14 rounded-full bg-[#ccff00] hover:bg-[#b3e600] text-black shadow-[0_0_20px_rgba(204,255,0,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 group z-[300]">
        @if (!isChatOpen()) {
          <svg class="w-7 h-7 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        } @else {
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        }
      </button>
    </div>
  `
})
export class MaterialsComponent implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private document = inject(DOCUMENT);
  
  activeTopic = signal<MaterialTopic | null>(null);

  isChatOpen = signal(false);
  isTyping = signal(false);
  chatMessages = signal<ChatMessage[]>([]);
  userInput = '';
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  quickPrompts = ["Apa itu Kalkulus?", "Rumus Turunan", "Cara Belajar", "Contoh Soal"];

  knowledgeBase = [
    {
       keywords: ['halo', 'hi', 'hai', 'pagi', 'siang', 'malam', 'sore', 'hello'],
       answer: "Halo! 👋 Saya <b>Calc-Bot</b> siap membantu. Coba tanya: <br>• <i>Apa itu Integral?</i><br>• <i>Rumus Turunan?</i>"
    },
    {
       keywords: ['apa itu kalkulus', 'pengertian', 'definisi', 'maksud', 'arti'],
       answer: `<div class="bot-card"><span class="bot-title">DEFINISI</span><p><b>Kalkulus</b> adalah ilmu tentang <i>perubahan</i>.</p><ul class="bot-list mt-2"><li><b>Turunan:</b> Laju perubahan.</li><li><b>Integral:</b> Akumulasi.</li></ul></div>`
    },
    {
       keywords: ['turunan', 'diferensial', 'derivative', 'laju'],
       answer: `<div class="bot-card"><span class="bot-title">RUMUS DASAR</span><div class="math-container justify-center text-sm">f(x)=ax<sup>n</sup> &rArr; f'(x)=n&middot;ax<sup>n-1</sup></div></div>`
    },
    {
       keywords: ['integral', 'antiturunan', 'luas', 'volume'],
       answer: `<div class="bot-card"><span class="bot-title">RUMUS DASAR</span><div class="math-container justify-center text-sm">&int; x<sup>n</sup> dx = <div class="math-fraction"><span class="fraction-top">x<sup>n+1</sup></span><span class="fraction-bottom">n+1</span></div> + C</div></div>`
    },
    {
       keywords: ['contoh', 'soal', 'latihan', 'tes'],
       answer: `<div class="bot-card"><span class="bot-title">LATIHAN</span><p class="text-xs mb-2">Turunan 2x<sup>2</sup>?</p><div class="text-right font-bold text-[#ccff00] mt-2">4x</div></div>`
    },
    {
       keywords: ['siapa kamu', 'bot', 'robot', 'nama'],
       answer: "Saya <b>Calc-Bot</b> 🤖, asisten otomatis dari Kelompok 6!"
    }
  ];

  defaultAnswer = "Maaf, syntax error! Coba keyword: <b>Turunan</b>, <b>Integral</b>, atau <b>Contoh Soal</b>.";

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['view'] === 'list') {
        this.closeTopic();
      }
    });
  }

  ngOnDestroy() {
    this.document.body.style.overflow = 'auto';
  }

  toggleChat() {
    this.isChatOpen.update(v => !v);
  }

  sendMessage(text?: string) {
    const input = text || this.userInput.trim();
    if (!input) return;
    this.chatMessages.update(msgs => [...msgs, { sender: 'user', text: input, time: new Date() }]);
    this.userInput = '';
    this.scrollToBottom();
    this.isTyping.set(true);
    setTimeout(() => {
       const answer = this.generateAutoReply(input);
       this.isTyping.set(false);
       this.chatMessages.update(msgs => [...msgs, { sender: 'bot', text: answer, time: new Date() }]);
       this.scrollToBottom();
    }, 800);
  }

  generateAutoReply(question: string): string {
     const lowerQ = question.toLowerCase();
     const match = this.knowledgeBase.find(kb => kb.keywords.some(k => lowerQ.includes(k)));
     if (match) return match.answer;
     return this.defaultAnswer;
  }

  scrollToBottom() {
    setTimeout(() => {
       if (this.chatContainer) {
          this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
       }
    }, 100);
  }

  openTopic(topic: MaterialTopic) {
    this.activeTopic.set(topic);
    this.document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const overlay = document.getElementById('overlay-scroll-container');
      if (overlay) overlay.scrollTop = 0;
    }, 0);
  }

  closeTopic() {
    this.activeTopic.set(null);
    this.document.body.style.overflow = 'auto';
  }

  safeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  cloudPaths = [
     "M30,30 Q150,5 270,30 Q295,150 270,270 Q150,295 30,270 Q5,150 30,30 Z",
     "M20,20 L60,10 L100,25 L150,5 L200,25 L250,10 L280,40 L290,100 L275,150 L290,200 L280,260 L200,290 L150,275 L100,290 L20,280 L10,200 L25,150 L10,100 Z",
     "M40,40 Q100,10 160,40 Q220,10 260,50 Q290,100 270,150 Q290,200 260,250 Q220,290 150,270 Q80,290 40,250 Q10,200 30,150 Q10,100 40,40 Z",
     "M20,30 Q150,10 280,30 Q290,150 280,270 Q150,290 20,270 Q10,150 20,30 Z",
     "M25,25 Q70,5 120,30 Q170,5 220,30 Q270,10 275,60 Q295,110 270,160 Q295,210 270,270 Q210,290 150,270 Q90,290 30,270 Q5,210 30,150 Q5,90 25,25 Z"
  ];

  getCloudPath(index: number): string {
    return this.cloudPaths[index % this.cloudPaths.length];
  }

  topics: MaterialTopic[] = [
    {
      id: 'turunan',
      title: 'TURUNAN',
      shortDesc: 'Sifat Penjumlahan, Perkalian, Pembagian & Rantai',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17c2-5 6-8 12-8 3 0 5 1 6 3"/><line x1="12" y1="13" x2="20" y2="5"/><path d="M18 5l2 0l0 2"/></svg>',
      chartSvg: `<svg viewBox="0 0 100 60" class="w-full h-full"><path d="M10,50 Q30,50 50,30 T90,10" fill="none" stroke="blue" stroke-width="3" stroke-linecap="round" /><circle cx="50" cy="30" r="3" fill="red" /></svg>`,
      detailVisual: `
        <svg viewBox="0 0 300 200" class="w-full h-full">
           <!-- Dynamic Neon Wave -->
           <path d="M0,100 Q75,20 150,100 T300,100" fill="none" stroke="#ccff00" stroke-width="3" stroke-linecap="round">
             <animate attributeName="d" 
                      values="M0,100 Q75,20 150,100 T300,100;
                              M0,100 Q75,180 150,100 T300,100;
                              M0,100 Q75,20 150,100 T300,100" 
                      dur="5s" repeatCount="indefinite" />
           </path>
           <!-- Moving Point -->
           <circle r="8" fill="#fff" filter="drop-shadow(0 0 5px #ccff00)">
              <animateMotion dur="5s" repeatCount="indefinite" path="M0,100 Q75,20 150,100 T300,100">
                <!-- Sync motion with path morph needs more complex SMIL, keeping simple path for point -->
              </animateMotion>
              <animate attributeName="cx" values="0;300;0" dur="5s" repeatCount="indefinite"/>
              <animate attributeName="cy" values="100;100;100" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
           </circle>
           <!-- Tangent Line Simulation (Rotating) -->
           <line x1="130" y1="100" x2="170" y2="100" stroke="#00FFFF" stroke-width="2">
              <animateTransform attributeName="transform" type="rotate" values="-45 150 100; 45 150 100; -45 150 100" dur="5s" repeatCount="indefinite" />
           </line>
        </svg>`,
      content: {
        definition: 'Turunan (Derivatif) adalah konsep fundamental dalam kalkulus yang mengukur sensitivitas perubahan nilai fungsi terhadap perubahan nilai inputnya (variabel independen). Secara sederhana, turunan menghitung seberapa cepat sesuatu berubah pada satu titik waktu tertentu, yang dikenal sebagai laju perubahan sesaat. Dalam geometri, turunan di suatu titik merepresentasikan kemiringan (gradien) dari garis singgung kurva di titik tersebut. Konsep ini diaplikasikan luas dalam fisika untuk kecepatan dan percepatan, serta dalam ekonomi untuk menghitung biaya marginal.',
        formulas: [
          { 
            label: '1. Aturan Pangkat Dasar', 
            equation: "f(x) = ax<sup>n</sup> <span class='math-symbol'>&rArr;</span> f'(x) = n <span class='math-symbol'>&middot;</span> ax<sup>n-1</sup>"
          },
          { 
            label: '2. Aturan Perkalian (Product)', 
            equation: "y = u <span class='math-symbol'>&middot;</span> v <span class='math-symbol'>&rArr;</span> y' = u'v <span class='math-symbol'>+</span> uv'" 
          },
          { 
            label: '3. Aturan Pembagian (Quotient)', 
            equation: "y = <div class='math-fraction'><span class='fraction-top'>u</span><span class='fraction-bottom'>v</span></div> <span class='math-symbol'>&rArr;</span> y' = <div class='math-fraction'><span class='fraction-top'>u'v - uv'</span><span class='fraction-bottom'>v<sup>2</sup></span></div>" 
          }
        ],
        example: {
          question: "Tentukan turunan pertama dari fungsi polinom berikut: <br><br> f(x) = 2x<sup>3</sup> - 6x<sup>2</sup> + 8",
          answer: "f'(x) = 6x<sup>2</sup> - 12x",
          steps: [
            "Identifikasi setiap suku dalam fungsi. Kita memiliki tiga suku: 2x<sup>3</sup>, -6x<sup>2</sup>, dan konstanta 8.",
            "Gunakan aturan pangkat untuk suku pertama (2x<sup>3</sup>). Kalikan koefisien 2 dengan pangkat 3 (2 &middot; 3 = 6), lalu kurangi pangkatnya dengan 1 (3 - 1 = 2). Hasilnya adalah 6x<sup>2</sup>.",
            "Gunakan aturan pangkat untuk suku kedua (-6x<sup>2</sup>). Kalikan koefisien -6 dengan pangkat 2 (-6 &middot; 2 = -12), lalu kurangi pangkatnya dengan 1 (2 - 1 = 1). Hasilnya adalah -12x.",
            "Turunkan suku konstanta (8). Turunan dari angka tanpa variabel x adalah selalu 0.",
            "Gabungkan semua hasil parsial. f'(x) = 6x<sup>2</sup> - 12x + 0. Jadi hasil akhirnya adalah 6x<sup>2</sup> - 12x."
          ]
        }
      }
    },
    {
      id: 'aljabar',
      title: 'ALJABAR',
      shortDesc: 'Persamaan & Pemfaktoran',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h3l3 7 5-18h5"/><line x1="18" y1="12" x2="22" y2="12"/></svg>',
      chartSvg: `<svg viewBox="0 0 100 60" class="w-full h-full"><line x1="10" y1="55" x2="90" y2="55" stroke="black" stroke-width="1.5" /><path d="M20,55 Q50,-10 80,55" fill="none" stroke="#FF00FF" stroke-width="3" /></svg>`,
      detailVisual: `
        <svg viewBox="0 0 300 200" class="w-full h-full">
            <!-- Binary Matrix Rain Effect BG -->
            <text x="50" y="50" fill="#0f0" opacity="0.2" font-family="monospace">1 0 1 0</text>
            <text x="250" y="150" fill="#0f0" opacity="0.2" font-family="monospace">0 1 1 1</text>
            
            <!-- Parabola oscillating -->
            <path d="M50,10 Q150,250 250,10" fill="none" stroke="#FF00FF" stroke-width="3">
              <animate attributeName="d" values="M50,10 Q150,250 250,10; M50,100 Q150,-50 250,100; M50,10 Q150,250 250,10" dur="4s" repeatCount="indefinite" />
            </path>
            
            <!-- Roots Glowing -->
            <circle cx="95" cy="115" r="5" fill="#ccff00">
               <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="205" cy="115" r="5" fill="#ccff00">
               <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1s"/>
            </circle>

            <!-- Axis -->
            <line x1="20" y1="100" x2="280" y2="100" stroke="white" stroke-width="1" stroke-dasharray="5,5" />
        </svg>`,
      content: {
        definition: 'Aljabar adalah cabang matematika yang menggunakan simbol dan huruf untuk mewakili angka dalam rumus dan persamaan. Dalam kalkulus, aljabar berfungsi sebagai "bahasa" utama; sebelum kita bisa menerapkan limit, turunan, atau integral, seringkali kita perlu menyederhanakan ekspresi rumit, memfaktorkan polinomial, atau memanipulasi pangkat. Pemahaman teknik aljabar seperti pemfaktoran dan penyelesaian persamaan kuadrat sangat krusial untuk sukses dalam kalkulus.',
        formulas: [
          { 
             label: 'Rumus ABC (Kuadrat)', 
             equation: "x = <div class='math-fraction'><span class='fraction-top'>-b <span class='math-symbol'>&plusmn;</span> <span class='math-root'>&radic;<span class='root-content'>b<sup>2</sup> - 4ac</span></span></span><span class='fraction-bottom'>2a</span></div>" 
          },
          { 
             label: 'Pemfaktoran Selisih Kuadrat', 
             equation: "a<sup>2</sup> - b<sup>2</sup> = (a - b)(a + b)" 
          }
        ],
        example: {
          question: "Cari akar-akar dari persamaan kuadrat berikut: <br><br> x<sup>2</sup> - 9 = 0",
          answer: "x = 3 atau x = -3",
          steps: [
             "Identifikasi bentuk persamaan. Persamaan x<sup>2</sup> - 9 adalah bentuk selisih dua kuadrat, yaitu a<sup>2</sup> - b<sup>2</sup>, di mana a = x dan b = 3 (karena 3<sup>2</sup> = 9).",
             "Gunakan rumus pemfaktoran a<sup>2</sup> - b<sup>2</sup> = (a - b)(a + b). Substitusikan nilai a dan b yang telah diidentifikasi: (x - 3)(x + 3) = 0.",
             "Cari pembuat nol. Agar hasil perkalian dua bilangan sama dengan nol, salah satu bilangan tersebut harus nol. Maka, x - 3 = 0 ATAU x + 3 = 0.",
             "Selesaikan masing-masing persamaan linear. Jika x - 3 = 0, maka x = 3. Jika x + 3 = 0, maka x = -3.",
             "Simpulkan hasilnya. Akar-akar persamaan adalah x = 3 dan x = -3."
          ]
        }
      }
    },
    {
      id: 'trigonometri',
      title: 'TRIGONOMETRI',
      shortDesc: 'Sudut & Identitas',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19L19 5v14H3z"/><path d="M14 19v-2h2"/></svg>',
      chartSvg: `<svg viewBox="0 0 100 60" class="w-full h-full"><path d="M5,30 Q16.25,5 27.5,30 T50,30 T72.5,30 T95,30" fill="none" stroke="green" stroke-width="3" /></svg>`,
      detailVisual: `
        <svg viewBox="0 0 300 200" class="w-full h-full">
            <!-- Unit Circle -->
            <circle cx="150" cy="100" r="80" stroke="#00FFFF" stroke-width="2" fill="none" stroke-dasharray="10,5">
               <animateTransform attributeName="transform" type="rotate" from="0 150 100" to="360 150 100" dur="10s" repeatCount="indefinite" />
            </circle>
            
            <!-- Radar Scanner -->
            <line x1="150" y1="100" x2="230" y2="100" stroke="#ccff00" stroke-width="3">
               <animateTransform attributeName="transform" type="rotate" from="0 150 100" to="360 150 100" dur="4s" repeatCount="indefinite" />
            </line>
            
            <!-- Pulsing Center -->
            <circle cx="150" cy="100" r="5" fill="white">
               <animate attributeName="r" values="5;10;5" dur="1s" repeatCount="indefinite" />
            </circle>
            
            <!-- Axis -->
            <line x1="70" y1="100" x2="230" y2="100" stroke="white" stroke-opacity="0.2" />
            <line x1="150" y1="20" x2="150" y2="180" stroke="white" stroke-opacity="0.2" />
        </svg>`,
      content: {
        definition: 'Trigonometri mempelajari hubungan antara sudut dan panjang sisi dalam segitiga. Namun dalam kalkulus, kita fokus pada fungsi trigonometri (sinus, cosinus, tangen) sebagai fungsi periodik yang berulang terus-menerus. Fungsi-fungsi ini sangat penting untuk memodelkan fenomena alam yang bergelombang atau bersiklus seperti bunyi, cahaya, dan arus listrik. Identitas trigonometri sering digunakan untuk menyederhanakan fungsi yang kompleks sebelum dilakukan operasi turunan atau integral.',
        formulas: [
           { 
             label: 'Identitas Tangen', 
             equation: "tan(x) = <div class='math-fraction'><span class='fraction-top'>sin(x)</span><span class='fraction-bottom'>cos(x)</span></div>" 
           },
           {
             label: 'Identitas Pythagoras',
             equation: "sin<sup>2</sup>(x) + cos<sup>2</sup>(x) = 1"
           }
        ],
        example: {
          question: "Jika diketahui (sudut lancip): <br><br> sin(x) = <div class='math-fraction'><span class='fraction-top'>1</span><span class='fraction-bottom'>2</span></div> <br><br> Tentukan nilai tan(x)!",
          answer: "tan(x) = <div class='math-fraction'><span class='fraction-top'>1</span><span class='fraction-bottom'>&radic;3</span></div>",
          steps: [
             "Gunakan definisi sinus pada segitiga siku-siku. Sin(x) = Depan / Miring. Maka, sisi Depan = 1 dan sisi Miring = 2.",
             "Cari panjang sisi Samping menggunakan Teorema Pythagoras. Samping = &radic;(Miring<sup>2</sup> - Depan<sup>2</sup>) = &radic;(2<sup>2</sup> - 1<sup>2</sup>) = &radic;(4 - 1) = &radic;3.",
             "Gunakan definisi tangen. Tan(x) = Depan / Samping.",
             "Substitusikan nilai sisi yang sudah diketahui. Tan(x) = 1 / &radic;3.",
             "Hasil ini juga bisa dirasionalkan dengan mengalikannya dengan &radic;3/&radic;3, menjadi (&radic;3)/3, namun 1/&radic;3 sudah cukup benar secara konsep."
          ]
        }
      }
    },
    {
      id: 'limit',
      title: 'LIMIT',
      shortDesc: 'Mendekati nilai tertentu',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="21" x2="18" y2="3"/><path d="M6 12h8"/><path d="M11 9l3 3-3 3"/></svg>',
      chartSvg: `<svg viewBox="0 0 100 60" class="w-full h-full"><path d="M10,40 Q40,40 48,10" fill="none" stroke="orange" stroke-width="3" /></svg>`,
      detailVisual: `
        <svg viewBox="0 0 300 200" class="w-full h-full">
           <!-- Graph Line with Hole -->
           <path d="M0,180 Q140,20 150,100" fill="none" stroke="orange" stroke-width="4" />
           <path d="M160,100 Q170,180 300,20" fill="none" stroke="orange" stroke-width="4" />
           
           <!-- The Hole -->
           <circle cx="155" cy="100" r="6" stroke="white" stroke-width="2" fill="black" />
           
           <!-- Arrows approaching -->
           <path d="M100,100 L140,100" stroke="#ccff00" stroke-width="3" marker-end="url(#arrow)">
              <animate attributeName="d" values="M80,100 L120,100; M110,100 L145,100; M80,100 L120,100" dur="2s" repeatCount="indefinite" />
           </path>
           <path d="M210,100 L170,100" stroke="#ccff00" stroke-width="3">
              <animate attributeName="d" values="M230,100 L190,100; M200,100 L165,100; M230,100 L190,100" dur="2s" repeatCount="indefinite" />
           </path>
           
           <!-- Text Label -->
           <text x="155" y="140" fill="white" text-anchor="middle" font-family="monospace">x -> c</text>
        </svg>`,
      content: {
        definition: 'Limit adalah konsep inti yang membedakan kalkulus dengan aljabar biasa. Limit menggambarkan perilaku suatu fungsi saat inputnya mendekati nilai tertentu, tanpa harus benar-benar mencapai nilai tersebut. Ini menjawab pertanyaan: "Apa yang terjadi pada f(x) saat x menjadi sangat dekat dengan c?". Konsep limit inilah yang memungkinkan kita mendefinisikan kecepatan sesaat (turunan) dan luas daerah dengan bentuk tak beraturan (integral) secara presisi.',
        formulas: [
           {
             label: "Aturan L'Hopital",
             equation: "<span class='math-symbol'>lim</span> <div class='math-fraction'><span class='fraction-top'>f(x)</span><span class='fraction-bottom'>g(x)</span></div> = <span class='math-symbol'>lim</span> <div class='math-fraction'><span class='fraction-top'>f'(x)</span><span class='fraction-bottom'>g'(x)</span></div>"
           }
        ],
        example: {
           question: "Hitung nilai limit berikut: <br><br> <span class='math-symbol'>lim</span> (x &rarr; 2) <div class='math-fraction'><span class='fraction-top'>x<sup>2</sup> - 4</span><span class='fraction-bottom'>x - 2</span></div>",
           answer: "4",
           steps: [
             "Coba substitusi langsung x = 2. Hasilnya adalah (4 - 4) / (2 - 2) = 0/0. Ini adalah bentuk tak tentu, artinya kita harus memanipulasi fungsinya.",
             "Faktorkan bagian pembilang (atas). x<sup>2</sup> - 4 adalah selisih kuadrat yang bisa diubah menjadi (x - 2)(x + 2).",
             "Tulis ulang limitnya: Lim (x &rarr; 2) [(x - 2)(x + 2)] / (x - 2).",
             "Sederhanakan fungsi. Kita bisa mencoret faktor (x - 2) di pembilang dan penyebut karena x mendekati 2 tetapi tidak sama dengan 2 (jadi kita tidak membagi dengan nol). Fungsi menjadi: Lim (x &rarr; 2) [x + 2].",
             "Substitusi nilai x = 2 ke fungsi yang sudah disederhanakan. 2 + 2 = 4. Jadi nilai limitnya adalah 4."
           ]
        }
      }
    },
    {
      id: 'integral',
      title: 'INTEGRAL',
      shortDesc: 'Luas & Volume',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4c-3.5 0-4 3-4 5 0 4 5 6 5 10 0 3-1.5 4-4 4"/><path d="M15 20c3.5 0 4-3 4-5 0-4-5-6-5-10 0-3 1.5-4 4-4"/></svg>',
      chartSvg: `<svg viewBox="0 0 100 60" class="w-full h-full"><path d="M20,50 Q50,10 80,50" fill="none" stroke="purple" stroke-width="3" /></svg>`,
      detailVisual: `
        <svg viewBox="0 0 300 200" class="w-full h-full">
           <!-- Area Under Curve -->
           <path d="M20,180 Q150,20 280,180 L280,180 L20,180 Z" fill="#9333ea" opacity="0.5">
             <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
           </path>
           
           <!-- The Curve -->
           <path d="M20,180 Q150,20 280,180" fill="none" stroke="#d8b4fe" stroke-width="4" />
           
           <!-- Scanning Line -->
           <line x1="20" y1="20" x2="20" y2="180" stroke="#ccff00" stroke-width="2">
             <animate attributeName="x1" values="20;280;20" dur="4s" repeatCount="indefinite" />
             <animate attributeName="x2" values="20;280;20" dur="4s" repeatCount="indefinite" />
           </line>
           
           <!-- Integral Symbol -->
           <text x="150" y="120" font-size="60" fill="white" font-family="serif" text-anchor="middle" opacity="0.8">
             &int;
           </text>
        </svg>`,
      content: {
         definition: 'Integral adalah operasi kebalikan dari turunan (disebut juga antiturunan). Selain itu, integral juga merupakan alat ampuh untuk menghitung akumulasi total, seperti luas daerah di bawah kurva yang tidak beraturan, volume benda putar, atau total jarak tempuh jika diketahui fungsi kecepatannya. Jika turunan memotong fungsi menjadi bagian-bagian kecil untuk melihat laju perubahan, integral menyatukan kembali potongan-potongan tersebut untuk melihat gambaran besarnya.',
         formulas: [
            {
               label: 'Integral Pangkat',
               equation: "&int; x<sup>n</sup> dx = <div class='math-fraction'><span class='fraction-top'>x<sup>n+1</sup></span><span class='fraction-bottom'>n + 1</span></div> + C"
            }
         ],
         example: {
            question: "Hitung integral tak tentu berikut: <br><br> &int; 3x<sup>2</sup> dx",
            answer: "x<sup>3</sup> + C",
            steps: [
              "Identifikasi aturan integral pangkat. Rumusnya adalah tambah pangkat n dengan 1, lalu bagi koefisien dengan pangkat baru tersebut.",
              "Terapkan pada soal. Pangkat saat ini adalah 2. Tambah 1 menjadi 3 (pangkat baru).",
              "Bagi koefisien awal (3) dengan pangkat baru (3). Jadi kita mendapatkan (3/3)x<sup>3</sup>.",
              "Sederhanakan koefisien. 3/3 sama dengan 1, jadi hasilnya x<sup>3</sup>.",
              "Tambahkan Konstanta Integrasi (+ C). Karena ini integral tak tentu (tidak ada batas), kita harus menambahkan + C untuk mewakili konstanta sembarang yang mungkin hilang saat proses penurunan sebelumnya."
            ]
         }
      }
    }
  ];
}