import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

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
  ];

  daftarUnit: any[] = [
    {
      id: 1,
      nama: 'Rumah Minimalis Type 45',
      lokasi: 'Serpong, Tangerang Selatan',
      harga: 4500000,
      rating: 4.9,
      status: 'tersedia',
      tipe: 'standar',
      gambar: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
    },
    {
      id: 2,
      nama: 'Rumah Cluster Modern Type 60',
      lokasi: 'Bekasi Barat, Bekasi',
      harga: 6500000,
      rating: 4.7,
      status: 'tersedia',
      tipe: 'standar',
      gambar: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80',
    },
    {
      id: 3,
      nama: 'Rumah Mewah Type 120',
      lokasi: 'Pondok Indah, Jakarta Selatan',
      harga: 18000000,
      rating: 5.0,
      status: 'tersedia',
      tipe: 'premium',
      gambar: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    },
    {
      id: 4,
      nama: 'Rumah Subsidi Type 36',
      lokasi: 'Cikarang, Bekasi',
      harga: 2800000,
      rating: 4.5,
      status: 'tersedia',
      tipe: 'standar',
      gambar: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=600&q=80',
    },
    {
      id: 5,
      nama: 'Rumah Deluxe Type 90',
      lokasi: 'BSD City, Tangerang Selatan',
      harga: 12000000,
      rating: 4.8,
      status: 'tersedia',
      tipe: 'deluxe',
      gambar: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=600&q=80',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.menuOpen = false;
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getFilteredUnit() {
    return this.daftarUnit.filter(u => {
      const matchFilter =
        this.filterAktif === 'semua' ||
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