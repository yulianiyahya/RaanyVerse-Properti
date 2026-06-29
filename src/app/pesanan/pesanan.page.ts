import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-pesanan',
  templateUrl: './pesanan.page.html',
  styleUrls: ['./pesanan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class PesananPage implements OnInit {
  filterAktif: string = 'semua';
  daftarPesanan: any[] = [];
  isLoading: boolean = false;

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
    this.isLoading = true;
    this.api.getBookings().subscribe({
      next: (res: any) => {
        this.isLoading = false;
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
            gambar: this.api.formatImageUrl(p.unit?.image) || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
            tanggal: new Date(p.start_date).toLocaleDateString('id-ID', {
              day: '2-digit', month: 'short', year: 'numeric'
            }),
            tanggalSelesai: p.end_date ? new Date(p.end_date).toLocaleDateString('id-ID', {
              day: '2-digit', month: 'short', year: 'numeric'
            }) : '-',
            status: statusStr,
            rawStatus: p.status,
            isSynced: p.is_synced || false,
          };
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Gagal mengambil data pesanan:', err);
      }
    });
  }

  getFiltered() {
    if (this.filterAktif === 'semua') return this.daftarPesanan;
    return this.daftarPesanan.filter(p => p.status === this.filterAktif);
  }

  lihatDetail(unitId: number) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.api.getUnitDetail(unitId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const mappedUnit = {
          id: res.id,
          nama: res.name,
          harga: res.price,
          status: res.status === 'available' ? 'tersedia' : (res.status === 'occupied' ? 'disewa' : (res.status === 'maintenance' ? 'perawatan' : res.status)),
          tipe: res.type,
          gambar: this.api.formatImageUrl(res.image),
          blok: res.blok || '',
          nomor_unit: res.nomor_unit || '',
          property_type: res.property_type || '',
          lokasi: res.estate?.address || res.estate?.name || 'Lokasi tidak diketahui',
          has_pending_booking: res.has_pending_booking || false,
        };
        localStorage.setItem('selectedUnit', JSON.stringify(mappedUnit));
        this.router.navigate(['/detail-unit']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Gagal mengambil detail unit:', err);
        alert('Gagal memuat detail unit.');
      }
    });
  }

  batalPesanan(id: number) {
    if (this.isLoading) return;
    if (!confirm('Yakin ingin membatalkan pesanan ini? Hanya pesanan yang masih menunggu yang bisa dibatalkan.')) return;

    this.isLoading = true;
    this.api.cancelBooking(id).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Pesanan berhasil dibatalkan.');
        this.loadPesanan();
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Gagal membatalkan pesanan.';
        alert(msg);
      }
    });
  }

  syncKalender(id: number) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.api.syncCalendar(id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        alert(res.message || 'Berhasil disinkronkan ke Google Calendar!');
        this.loadPesanan();
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Gagal sinkronisasi kalender.';
        alert(msg);
      }
    });
  }

  getStatusLabel(status: string): string {
    const map: any = { menunggu: 'Menunggu', disetujui: 'Disetujui', ditolak: 'Ditolak' };
    return map[status] || status;
  }

  getStatusColor(status: string): string {
    const map: any = { menunggu: 'warning', disetujui: 'success', ditolak: 'danger' };
    return map[status] || 'medium';
  }

  goToBeranda() { this.router.navigate(['/beranda-tenant']); }
  goToUnit() { this.router.navigate(['/unit']); }
  goToPesanan() { this.router.navigate(['/pesanan']); }
  goToProfil() { this.router.navigate(['/profil']); }
  goToNotifikasi() { this.router.navigate(['/notifikasi']); }
}
