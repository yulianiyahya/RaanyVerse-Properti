import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-fasilitas',
  templateUrl: './fasilitas.page.html',
  styleUrls: ['./fasilitas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
  providers: [ApiService],
})
export class FasilitasPage implements OnInit {
  // Tab: 'katalog' | 'riwayat'
  activeTab: string = 'katalog';

  fasilitasList: any[] = [];
  riwayatList: any[] = [];

  // Booking form state
  selectedFasilitas: any = null;
  showBookingForm: boolean = false;
  bookingDate: string = '';
  startTime: string = '';
  endTime: string = '';
  guestCount: number = 1;
  minDate: string = '';
  isLoading: boolean = false;

  constructor(private router: Router, private location: Location, private api: ApiService) {}

  ngOnInit() {
    this.minDate = new Date().toISOString().split('T')[0];
    this.loadFasilitas();
    this.loadRiwayat();
  }

  ionViewWillEnter() {
    this.loadFasilitas();
    this.loadRiwayat();
  }

  loadFasilitas() {
    this.api.getFacilities().subscribe({
      next: (res: any) => {
        this.fasilitasList = (res || []).map((f: any) => ({
          id: f.id,
          nama: f.name,
          deskripsi: f.description || '',
          estate: f.estate?.name || 'Kawasan',
          jamBuka: f.open_time ? f.open_time.substring(0, 5) : '06:00',
          jamTutup: f.close_time ? f.close_time.substring(0, 5) : '22:00',
          kapasitas: f.max_capacity,
          biaya: f.booking_fee || 0,
          icon: this.getFasilitasIcon(f.name),
        }));
      },
      error: () => { this.fasilitasList = []; }
    });
  }

  loadRiwayat() {
    this.api.getFacilityBookings().subscribe({
      next: (res: any) => {
        this.riwayatList = (res || []).map((b: any) => ({
          id: b.id,
          namaFasilitas: b.facility?.name || 'Fasilitas',
          tanggal: new Date(b.booking_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          waktu: `${b.start_time?.substring(0, 5)} - ${b.end_time?.substring(0, 5)}`,
          tamu: b.guest_count,
          status: b.status,
          statusLabel: this.getStatusLabel(b.status),
          canCancel: b.status === 'pending' || b.status === 'approved',
        }));
      },
      error: () => { this.riwayatList = []; }
    });
  }

  getFasilitasIcon(name: string): string {
    const n = (name || '').toLowerCase();
    if (n.includes('kolam') || n.includes('renang') || n.includes('pool')) return 'water-outline';
    if (n.includes('tenis') || n.includes('lapangan') || n.includes('badminton')) return 'tennisball-outline';
    if (n.includes('gym') || n.includes('fitness')) return 'barbell-outline';
    if (n.includes('aula') || n.includes('hall') || n.includes('meeting')) return 'business-outline';
    if (n.includes('taman') || n.includes('park')) return 'leaf-outline';
    return 'grid-outline';
  }

  getStatusLabel(status: string): string {
    const map: any = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak', cancelled: 'Dibatalkan' };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: any = { pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'medium' };
    return map[status] || 'medium';
  }

  openBookingForm(fasilitas: any) {
    this.selectedFasilitas = fasilitas;
    this.bookingDate = '';
    this.startTime = fasilitas.jamBuka;
    this.endTime = fasilitas.jamTutup;
    this.guestCount = 1;
    this.showBookingForm = true;
  }

  closeBookingForm() {
    this.showBookingForm = false;
    this.selectedFasilitas = null;
  }

  submitBooking() {
    if (!this.bookingDate || !this.startTime || !this.endTime) {
      alert('Lengkapi semua data pemesanan!');
      return;
    }
    if (this.startTime >= this.endTime) {
      alert('Jam selesai harus lebih dari jam mulai!');
      return;
    }
    if (this.guestCount < 1 || this.guestCount > this.selectedFasilitas.kapasitas) {
      alert(`Jumlah tamu harus antara 1 - ${this.selectedFasilitas.kapasitas}`);
      return;
    }

    this.isLoading = true;
    this.api.bookFacility(this.selectedFasilitas.id, {
      booking_date: this.bookingDate,
      start_time: this.startTime + ':00',
      end_time: this.endTime + ':00',
      guest_count: this.guestCount,
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeBookingForm();
        alert('Reservasi fasilitas berhasil dikirim! Menunggu persetujuan pengelola.');
        this.loadRiwayat();
        this.activeTab = 'riwayat';
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Gagal melakukan reservasi. Coba lagi.';
        alert(msg);
      }
    });
  }

  batalReservasi(id: number) {
    if (!confirm('Yakin ingin membatalkan reservasi ini?')) return;
    this.api.cancelFacilityBooking(id).subscribe({
      next: () => {
        alert('Reservasi berhasil dibatalkan.');
        this.loadRiwayat();
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Gagal membatalkan reservasi.';
        alert(msg);
      }
    });
  }

  goBack() { this.location.back(); }
  goToBeranda() { this.router.navigate(['/beranda-tenant']); }
  goToUnit() { this.router.navigate(['/unit']); }
  goToPesanan() { this.router.navigate(['/pesanan']); }
  goToProfil() { this.router.navigate(['/profil']); }
}
