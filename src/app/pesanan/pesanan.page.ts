import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-pesanan',
  templateUrl: './pesanan.page.html',
  styleUrls: ['./pesanan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule],
  providers: [ApiService],
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

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit() {
    this.loadPesanan();
  }

  ionViewWillEnter() {
    this.loadPesanan();
  }

  loadPesanan() {
    this.api.getBookings().subscribe({
      next: (res: any) => {
        this.daftarPesanan = (res || []).map((p: any) => {
          let statusStr = 'menunggu';
          if (p.status === 'approved') statusStr = 'disetujui';
          if (p.status === 'rejected') statusStr = 'ditolak';
          
          return {
            id: p.id,
            unitId: p.unit_id,
            nama: p.unit?.name || 'Unit Properti',
            lokasi: p.unit?.estate?.address || p.unit?.estate?.name || 'Lokasi tidak diketahui',
            harga: p.unit?.price || 0,
            gambar: p.unit?.image || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
            tanggal: new Date(p.start_date).toLocaleDateString('id-ID', {
              day: '2-digit', month: 'short', year: 'numeric'
            }),
            durasi: 'Sewa Aktif',
            status: statusStr,
          };
        });
      },
      error: (err) => {
        console.error('Gagal mengambil data pesanan:', err);
      }
    });
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