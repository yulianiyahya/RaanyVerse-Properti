import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit() {
    const email = localStorage.getItem('emailUser') || '';
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email);

    if (user) {
      const notifList: any[] = [];

      // Notifikasi dari complaints
      (user.complaints || []).forEach((c: any) => {
        notifList.push({
          id: 'c_' + c.waktu,
          tipe: 'info',
          judul: 'Complaint Dikirim',
          deskripsi: `Complaint "${c.judul}" berhasil dikirim dan sedang diproses.`,
          waktu: c.waktu,
          dibaca: false,
        });
      });

      // Notifikasi dari maintenance
      (user.maintenance || []).forEach((m: any) => {
        notifList.push({
          id: 'm_' + m.waktu,
          tipe: 'info',
          judul: 'Request Maintenance Dikirim',
          deskripsi: `Permintaan maintenance "${m.judul}" berhasil dikirim. Teknisi akan menghubungi kamu.`,
          waktu: m.waktu,
          dibaca: false,
        });
      });

      // Notifikasi dari pembayaran
      (user.pembayaran || []).forEach((p: any) => {
        notifList.push({
          id: 'p_' + p.waktu,
          tipe: 'sukses',
          judul: 'Pembayaran Berhasil',
          deskripsi: `Pembayaran sebesar Rp ${p.nominal?.toLocaleString('id-ID')} telah dikonfirmasi.`,
          waktu: p.waktu,
          dibaca: false,
        });
      });

      // Notifikasi jika punya unit
      if (user.unit) {
        notifList.push({
          id: 'unit_assigned',
          tipe: 'tagihan',
          judul: 'Unit Berhasil Ditetapkan',
          deskripsi: `Unit ${user.unit.nama} telah ditetapkan untukmu. Jatuh tempo: ${user.unit.jatuhTempo}.`,
          waktu: 'Baru saja',
          dibaca: false,
        });
      }

      this.notifikasiList = notifList;
    }
  }

  getFilteredNotif() {
    if (this.filterAktif === 'belum') {
      return this.notifikasiList.filter(n => !n.dibaca);
    }
    return this.notifikasiList;
  }

  bacaNotif(item: any) {
    item.dibaca = true;
  }

  goBack() {
    this.router.navigate(['/beranda-tenant']);
  }
}