import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-notifikasi',
  templateUrl: './notifikasi.page.html',
  styleUrls: ['./notifikasi.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class NotifikasiPage implements OnInit {
  filterAktif: string = 'semua';
  notifikasiList: any[] = [];
  isLoading: boolean = true;

  constructor(private location: Location, private api: ApiService) {}

  ngOnInit() {
    this.loadNotifikasi();
  }

  ionViewWillEnter() {
    this.loadNotifikasi();
  }

  loadNotifikasi() {
    this.isLoading = true;
    this.api.getNotifications().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.notifikasiList = (res || []).map((n: any) => ({
          id: n.id,
          tipe: n.type || 'info',
          judul: this.getTitleFromType(n.type),
          deskripsi: n.message || '',
          waktu: n.sent_at ? new Date(n.sent_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }) : '',
          dibaca: n.is_read,
        }));
      },
      error: () => {
        this.isLoading = false;
        this.notifikasiList = [];
      }
    });
  }

  getTitleFromType(type: string): string {
    const map: any = {
      upcoming_booking: 'Pengingat Booking',
      late_payment: 'Tagihan Belum Dibayar',
      info: 'Informasi',
    };
    return map[type] || 'Notifikasi';
  }

  getIconFromType(type: string): string {
    const map: any = {
      upcoming_booking: 'calendar-outline',
      late_payment: 'card-outline',
      info: 'information-circle-outline',
    };
    return map[type] || 'notifications-outline';
  }

  getColorFromType(type: string): string {
    const map: any = {
      upcoming_booking: 'primary',
      late_payment: 'danger',
      info: 'medium',
    };
    return map[type] || 'medium';
  }

  getFilteredNotif() {
    if (this.filterAktif === 'belum') {
      return this.notifikasiList.filter(n => !n.dibaca);
    }
    return this.notifikasiList;
  }

  bacaNotif(item: any) {
    if (item.dibaca) return;
    item.dibaca = true;
    this.api.markNotificationRead(item.id).subscribe({
      error: () => { item.dibaca = false; }
    });
  }

  get unreadCount(): number {
    return this.notifikasiList.filter(n => !n.dibaca).length;
  }

  goBack() { this.location.back(); }
}
