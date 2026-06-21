import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-pengumuman',
  templateUrl: './pengumuman.page.html',
  styleUrls: ['./pengumuman.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class PengumumanPage implements OnInit {
  pengumumanList: any[] = [];
  isLoading: boolean = true;
  selectedItem: any = null;

  constructor(private router: Router, private location: Location, private api: ApiService) {}

  ngOnInit() {
    this.loadPengumuman();
  }

  ionViewWillEnter() {
    this.loadPengumuman();
  }

  loadPengumuman() {
    this.isLoading = true;
    this.api.getAnnouncements().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.pengumumanList = (res || []).map((a: any) => ({
          id: a.id,
          judul: a.title,
          isi: a.content,
          prioritas: a.priority,
          estate: a.estate?.name || null,
          isGlobal: a.is_global,
          tanggal: new Date(a.created_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
          }),
        }));
      },
      error: () => {
        this.isLoading = false;
        this.pengumumanList = [];
      }
    });
  }

  getPriorityColor(priority: string): string {
    const map: any = { urgent: 'danger', high: 'warning', normal: 'primary', low: 'medium' };
    return map[priority] || 'primary';
  }

  getPriorityLabel(priority: string): string {
    const map: any = { urgent: 'URGENT', high: 'PENTING', normal: 'INFO', low: 'UMUM' };
    return map[priority] || priority.toUpperCase();
  }

  openDetail(item: any) {
    this.selectedItem = item;
  }

  closeDetail() {
    this.selectedItem = null;
  }

  goBack() { this.location.back(); }
  goToBeranda() { this.router.navigate(['/beranda-tenant']); }
  goToUnit() { this.router.navigate(['/unit']); }
  goToPesanan() { this.router.navigate(['/pesanan']); }
  goToProfil() { this.router.navigate(['/profil']); }
}
