import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-beranda-tenant',
  templateUrl: './beranda-tenant.page.html',
  styleUrls: ['./beranda-tenant.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class BerandaTenantPage {
  namaUser: string = '';
  sapaan: string = '';
  unitData: any = null;
  aktivitasList: any[] = [];
  menuOpen: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    let nama = localStorage.getItem('namaUser');
    if (!nama || nama === 'undefined' || nama === 'null') {
      nama = 'Pengguna';
    }
    this.namaUser = nama.charAt(0).toUpperCase() + nama.slice(1);

    const jam = new Date().getHours();
    if (jam >= 0 && jam <= 4) {
      this.sapaan = 'Selamat Dini Hari';
    } else if (jam >= 5 && jam <= 10) {
      this.sapaan = 'Selamat Pagi';
    } else if (jam >= 11 && jam <= 15) {
      this.sapaan = 'Selamat Siang';
    } else if (jam >= 16 && jam <= 18) {
      this.sapaan = 'Selamat Sore';
    } else {
      this.sapaan = 'Selamat Malam';
    }

    const email = localStorage.getItem('emailUser') || '';
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email);

    this.unitData = user?.unit || null;
    this.aktivitasList = user?.aktivitas || [];
  }

  getEmoji(): string {
    const jam = new Date().getHours();
    if (jam >= 0 && jam <= 4) return '🌙';
    if (jam >= 5 && jam <= 10) return '👋';
    if (jam >= 11 && jam <= 15) return '☀️';
    if (jam >= 16 && jam <= 18) return '🌤️';
    return '🌙';
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  goToBeranda() {
    this.router.navigate(['/beranda-tenant']);
  }

  goToUnit() {
    this.router.navigate(['/unit']);
  }

  goToPesanan() {
    this.router.navigate(['/pesanan']);
  }

  goToProfil() {
    this.menuOpen = false;
    this.router.navigate(['/profil']);
  }

  goToNotifikasi() {
    this.router.navigate(['/notifikasi']);
  }

  goToPayBill() {
    this.router.navigate(['/pay-bill']);
  }

  goToComplaint() {
    this.router.navigate(['/submit-complaint']);
  }

  goToMaintenance() {
    this.router.navigate(['/request-maintenance']);
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }

  logout() {
    this.menuOpen = false;
    localStorage.removeItem('namaUser');
    localStorage.removeItem('emailUser');
    this.router.navigate(['/login']);
  }
}