import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class HistoryPage implements OnInit {
  filterAktif: string = 'semua';
  allHistory: any[] = [];
  isLoading: boolean = true;

  filterList = [
    { value: 'semua', label: 'Semua' },
    { value: 'booking', label: 'Booking' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'payment', label: 'Pembayaran' },
    { value: 'facility', label: 'Fasilitas' },
  ];

  constructor(private location: Location, private router: Router, private api: ApiService) {}

  ngOnInit() {
    this.loadHistory();
  }

  ionViewWillEnter() {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading = true;
    this.api.getHistory().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.allHistory = (res || []).map((act: any) => ({
          id: act.id,
          tipe: act.module || 'info',
          kategoriLabel: this.getKategoriLabel(act.module),
          judul: act.action || 'Aktivitas',
          deskripsi: act.description || '',
          waktu: new Date(act.created_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }),
          icon: this.getIcon(act.module),
          color: this.getColor(act.module),
        }));
      },
      error: () => {
        this.isLoading = false;
        this.allHistory = [];
      }
    });
  }

  getKategoriLabel(module: string): string {
    const map: any = {
      booking: 'Booking', complaint: 'Complaint',
      maintenance: 'Maintenance', payment: 'Pembayaran',
      facility: 'Fasilitas', billing: 'Tagihan',
    };
    return map[module] || 'Aktivitas';
  }

  getIcon(module: string): string {
    const map: any = {
      booking: 'calendar-outline', complaint: 'megaphone-outline',
      maintenance: 'construct-outline', payment: 'card-outline',
      facility: 'grid-outline', billing: 'receipt-outline',
    };
    return map[module] || 'document-text-outline';
  }

  getColor(module: string): string {
    const map: any = {
      booking: 'primary', complaint: 'warning',
      maintenance: 'tertiary', payment: 'success',
      facility: 'secondary', billing: 'danger',
    };
    return map[module] || 'medium';
  }

  getFilteredHistory() {
    if (this.filterAktif === 'semua') return this.allHistory;
    return this.allHistory.filter(h => h.tipe === this.filterAktif);
  }

  goBack() { this.location.back(); }
  goToBeranda() { this.router.navigate(['/beranda-tenant']); }
}
