import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit() {
    const email = localStorage.getItem('emailUser') || '';
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email);

    if (user) {
      // Gabungkan semua riwayat dari berbagai sumber
      const complaints = (user.complaints || []).map((c: any) => ({
        ...c,
        tipe: 'complaint',
        kategoriLabel: 'Complaint',
        deskripsi: c.deskripsi || '-',
      }));

      const maintenance = (user.maintenance || []).map((m: any) => ({
        ...m,
        tipe: 'maintenance',
        kategoriLabel: 'Maintenance',
        deskripsi: m.deskripsi || '-',
      }));

      const pembayaran = (user.pembayaran || []).map((p: any) => ({
        ...p,
        tipe: 'pembayaran',
        kategoriLabel: 'Pembayaran',
        deskripsi: p.deskripsi || '-',
      }));

      // Gabung dan urutkan berdasarkan waktu (terbaru di atas)
      this.allHistory = [...complaints, ...maintenance, ...pembayaran].sort((a, b) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
    }
  }

  getFilteredHistory() {
    if (this.filterAktif === 'semua') return this.allHistory;
    return this.allHistory.filter(h => h.tipe === this.filterAktif);
  }

  goBack() {
    this.router.navigate(['/beranda-tenant']);
  }
}