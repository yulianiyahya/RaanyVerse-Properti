import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-beranda-tenant',
  templateUrl: './beranda-tenant.page.html',
  styleUrls: ['./beranda-tenant.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class BerandaTenantPage implements OnInit {
  namaUser: string = '';
  sapaan: string = '';
  unitData: any = null;
  aktivitasList: any[] = [];
  menuOpen: boolean = false;

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit() {
    const nama = localStorage.getItem('namaUser') || 'Pengguna';
    this.namaUser = nama.charAt(0).toUpperCase() + nama.slice(1);

    const jam = new Date().getHours();
    if (jam >= 0 && jam <= 4) {
      this.sapaan = 'Selamat Dini Hari';
    } else if (jam >= 5 && jam <= 10) {
      this.sapaan = 'Selamat Pagi';
    } else if (jam >= 11 && jam <= 15) {
      this.sapaan = 'Selamat Siang';
    } else if (jam >= 16 && jam <= 18) {
      this.sapaan = 'Selamat Sore';
    } else {
      this.sapaan = 'Selamat Malam';
    }

    // Ambil data user profil terbaru dari API
    this.api.getUser().subscribe({
      next: (res: any) => {
        if (res && res.name) {
          this.namaUser = res.name.charAt(0).toUpperCase() + res.name.slice(1);
          localStorage.setItem('namaUser', res.name);
          localStorage.setItem('emailUser', res.email);
        }
      },
      error: (err) => {
        console.error('Gagal mengambil profil user:', err);
      }
    });

    // Ambil tagihan aktif sebagai Unit data
    this.api.getBillings().subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          const billing = res[0];
          this.unitData = {
            id: billing.unit?.id,
            nama: billing.unit?.name || 'Unit Anda',
            jatuhTempo: billing.due_date ? new Date(billing.due_date).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric'
            }) : 'Sesuai Kontrak'
          };
        } else {
          this.unitData = null;
        }
      },
      error: () => {
        this.unitData = null;
      }
    });

    this.api.getHistory().subscribe({
      next: (res: any) => {
        this.aktivitasList = (res || []).map((act: any) => {
          let icon = 'document-text-outline';
          let tipe = 'info';
          if (act.module === 'booking') {
            icon = 'calendar-outline';
            tipe = 'booking';
          } else if (act.module === 'complaint') {
            icon = 'megaphone-outline';
            tipe = 'complaint';
          } else if (act.module === 'maintenance') {
            icon = 'construct-outline';
            tipe = 'maintenance';
          } else if (act.module === 'payment') {
            icon = 'card-outline';
            tipe = 'payment';
          }
          
          const descLower = (act.description || '').toLowerCase();
          const actionLower = (act.action || '').toLowerCase();
          const dynamicStatus = act.dynamic_status;
          
          let status = 'proses';
          let statusLabel = 'Terkirim';

          if (dynamicStatus) {
            if (dynamicStatus === 'completed' || dynamicStatus === 'success') {
              status = 'selesai';
              statusLabel = 'Selesai';
            } else if (dynamicStatus === 'approved') {
              status = 'lunas';
              statusLabel = 'Disetujui';
            } else if (dynamicStatus === 'rejected') {
              status = 'ditolak';
              statusLabel = 'Ditolak';
            } else if (dynamicStatus === 'cancelled') {
              status = 'ditolak';
              statusLabel = 'Batal';
            } else if (dynamicStatus === 'pending') {
              status = 'proses';
              statusLabel = 'Diproses';
            }
          } else {
            if (actionLower.includes('closed') || actionLower.includes('complete') || descLower.includes('to completed')) {
              status = 'selesai';
              statusLabel = 'Selesai';
            } else if (actionLower.includes('approve') || descLower.includes('to approved')) {
              status = 'lunas';
              statusLabel = 'Disetujui';
            } else if (actionLower.includes('reject') || descLower.includes('to rejected')) {
              status = 'ditolak';
              statusLabel = 'Ditolak';
            } else if (actionLower.includes('cancel') || actionLower.includes('cancelled')) {
              status = 'ditolak';
              statusLabel = 'Batal';
            } else if (actionLower.includes('submitted') || actionLower.includes('created')) {
              status = 'proses';
              statusLabel = 'Terkirim';
            } else if (actionLower.includes('sync')) {
              status = 'lunas';
              statusLabel = 'Sukses';
            }
          }

          return {
            judul: act.action || 'Aktivitas',
            deskripsi: act.description || '',
            waktu: new Date(act.created_at).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }),
            tipe: tipe,
            icon: icon,
            status: status,
            statusLabel: statusLabel
          };
        }).slice(0, 5); // Tampilkan 5 terbaru di beranda
      },
      error: () => {
        this.aktivitasList = [];
      }
    });
  }

  getEmoji(): string {
    return '';
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  goToBeranda() {
    this.router.navigate(['/beranda-tenant']);
  }

  goToUnit() {
    this.router.navigate(['/unit']);
  }

  goToDetailUnit() {
    if (this.unitData && this.unitData.id) {
      localStorage.setItem('selectedUnit', JSON.stringify({
        id: this.unitData.id,
        nama: this.unitData.nama,
        isMyUnit: true
      }));
      this.router.navigate(['/detail-unit']);
    }
  }

  goToPesanan() {
    this.router.navigate(['/pesanan']);
  }

  goToProfil() {
    this.menuOpen = false;
    this.router.navigate(['/profil']);
  }

  goToNotifikasi() {
    this.router.navigate(['/notifikasi']);
  }

  goToPayBill() {
    this.router.navigate(['/pay-bill']);
  }

  goToComplaint() {
    this.router.navigate(['/submit-complaint']);
  }

  goToMaintenance() {
    this.router.navigate(['/request-maintenance']);
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }

  logout() {
    this.menuOpen = false;
    this.api.logoutGoogle();
    this.api.logout().subscribe({
      next: () => {
        localStorage.clear();
        this.router.navigate(['/login']);
      },
      error: () => {
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}