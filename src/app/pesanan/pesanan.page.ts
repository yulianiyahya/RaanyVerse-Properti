import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pesanan',
  templateUrl: './pesanan.page.html',
  styleUrls: ['./pesanan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class PesananPage implements OnInit {
  filterAktif: string = 'semua';
  daftarPesanan: any[] = [];

  filterList = [
    { value: 'semua', label: 'Semua' },
    { value: 'menunggu', label: 'Menunggu' },
    { value: 'disetujui', label: 'Disetujui' },
    { value: 'ditolak', label: 'Ditolak' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadPesanan();
  }

  ionViewWillEnter() {
    this.loadPesanan();
  }

  loadPesanan() {
    this.daftarPesanan = JSON.parse(localStorage.getItem('daftarPesanan') || '[]');
  }

  getFiltered() {
    if (this.filterAktif === 'semua') return this.daftarPesanan;
    return this.daftarPesanan.filter(p => p.status === this.filterAktif);
  }

  batalPesanan(id: number) {
    const konfirm = confirm('Yakin ingin membatalkan pesanan ini?');
    if (!konfirm) return;
    this.daftarPesanan = this.daftarPesanan.filter(p => p.id !== id);
    localStorage.setItem('daftarPesanan', JSON.stringify(this.daftarPesanan));
  }

  getStatusLabel(status: string): string {
    const map: any = { menunggu: 'Menunggu', disetujui: 'Disetujui', ditolak: 'Ditolak' };
    return map[status] || status;
  }

  goToBeranda() { this.router.navigate(['/beranda-tenant']); }
  goToUnit() { this.router.navigate(['/unit']); }
  goToPesanan() { this.router.navigate(['/pesanan']); }
  goToProfil() { this.router.navigate(['/profil']); }
  goToNotifikasi() { this.router.navigate(['/notifikasi']); }
}