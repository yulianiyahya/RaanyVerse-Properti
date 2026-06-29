import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class WelcomePage implements OnInit {
  activeSlide: number = 0;

  slides = [
    {
      title: 'Temukan Hunian Impian',
      description: 'Eksplorasi pilihan properti terbaik dengan fasilitas lengkap yang siap memenuhi gaya hidup modern Anda.',
      icon: 'home-outline',
      image: 'assets/onboarding/slide-home.png',
      color: '#4f46e5',
      gradient: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
      bgLight: '#eef2ff'
    },
    {
      title: 'Transaksi Aman & Mudah',
      description: 'Lakukan pemesanan, bayar sewa, hingga cicilan dengan berbagai metode pembayaran yang terjamin keamanannya.',
      icon: 'wallet-outline',
      image: 'assets/onboarding/slide-payment.png',
      color: '#0ea5e9',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
      bgLight: '#e0f2fe'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    // Redirection checks are handled by welcomeGuard in app.routes.ts
  }

  nextSlide() {
    if (this.activeSlide < this.slides.length - 1) {
      this.activeSlide++;
    } else {
      this.finishOnboarding();
    }
  }

  prevSlide() {
    if (this.activeSlide > 0) {
      this.activeSlide--;
    }
  }

  setSlide(index: number) {
    this.activeSlide = index;
  }

  finishOnboarding() {
    localStorage.setItem('has_seen_onboarding', 'true');
    this.router.navigate(['/login']);
  }
}
