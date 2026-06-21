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
    },
    {
      title: 'Jadwal Terintegrasi',
      description: 'Tak perlu takut terlewat! Jadwal sewa dan pembayaran Anda akan terintegrasi otomatis dengan Google Calendar.',
      icon: 'calendar-number-outline',
      image: 'assets/onboarding/slide-calendar.png',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      bgLight: '#d1fae5'
    },
    {
      title: 'Layanan Terpadu 24/7',
      description: 'Ajukan keluhan perbaikan, pantau pemeliharaan, dan dapatkan notifikasi real-time langsung dari genggaman.',
      icon: 'headset-outline',
      image: 'assets/onboarding/slide-support.png',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      bgLight: '#fef3c7'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    // Jika user sudah login, langsung ke beranda-tenant
    if (localStorage.getItem('auth_token')) {
      this.router.navigate(['/beranda-tenant']);
      return;
    }
    // Jika sudah pernah melihat onboarding, redirect ke login
    if (localStorage.getItem('has_seen_onboarding') === 'true') {
      this.router.navigate(['/login']);
    }
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
