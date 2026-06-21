import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-unit',
  templateUrl: './unit.page.html',
  styleUrls: ['./unit.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class UnitPage implements OnInit {
  searchQuery: string = '';
  filterAktif: string = 'semua';
  menuOpen: boolean = false;

  filterList = [
    { value: 'semua', label: 'Semua' },
    { value: 'tersedia', label: 'Tersedia' },
    { value: 'standar', label: 'Standar' },
    { value: 'deluxe', label: 'Deluxe' },
    { value: 'premium', label: 'Premium' },
    { value: 'favorit', label: 'Tersimpan' },
  ];

  daftarUnit: any[] = [];

  favoritUnits: any[] = [];

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit() {
    this.loadFavorit();
    this.loadUnits();
  }

  ionViewWillEnter() {
    this.loadFavorit();
    this.loadUnits();
  }

  loadUnits() {
    const token = localStorage.getItem('auth_token');
    console.log('[DEBUG] auth_token:', token ? '✅ ada (' + token.substring(0, 20) + '...)' : '❌ KOSONG / null');

    this.api.getUnits().subscribe({
      next: (res: any) => {
        console.log('[DEBUG] Response dari /api/units:', res);
        const unitArray = Array.isArray(res) ? res : (res?.data || []);
        this.daftarUnit = (unitArray || []).map((u: any) => {
          // Map backend status to Indonesian labels
          let statusLabel = 'tersedia';
          if (u.status === 'occupied') statusLabel = 'disewa';
          else if (u.status === 'maintenance') statusLabel = 'perawatan';
          else if (u.status === 'available') statusLabel = 'tersedia';

          return {
            id: u.id,
            nama: u.name || 'Unit Tanpa Nama',
            lokasi: u.estate?.address || u.estate?.name || 'Lokasi tidak diketahui',
            harga: u.price || 0,
            rating: 4.8,
            status: statusLabel,
            statusRaw: u.status, // keep original for reference
            tipe: u.type || 'standar',
            gambar: this.api.formatImageUrl(u.image) || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
            has_pending_booking: u.has_pending_booking || false,
          };
        });
        console.log('[DEBUG] daftarUnit setelah mapping:', this.daftarUnit);
      },
      error: (err) => {
        console.error('[DEBUG] ❌ Error /api/units - status:', err.status, '| message:', err.message);
        console.error('[DEBUG] Error detail:', err.error);
      }
    });
  }


  loadFavorit() {
    this.favoritUnits = JSON.parse(localStorage.getItem('favoritUnit') || '[]');
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.menuOpen = false;
    this.api.logoutGoogle();
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getFilteredUnit() {
    const sourceArray = this.filterAktif === 'favorit' ? this.favoritUnits : this.daftarUnit;

    return sourceArray.filter(u => {
      const matchFilter =
        this.filterAktif === 'semua' ||
        this.filterAktif === 'favorit' ||
        u.tipe === this.filterAktif ||
        u.status === this.filterAktif;
      const matchSearch =
        u.nama.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        u.lokasi.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }

  lihatDetail(unit: any) {
    localStorage.setItem('selectedUnit', JSON.stringify(unit));
    this.router.navigate(['/detail-unit']);
  }

  goToBeranda() { this.router.navigate(['/beranda-tenant']); }
  goToUnit() { this.router.navigate(['/unit']); }
  goToPesanan() { this.router.navigate(['/pesanan']); }
  goToProfil() { this.router.navigate(['/profil']); }
  goToNotifikasi() { this.router.navigate(['/notifikasi']); }
}