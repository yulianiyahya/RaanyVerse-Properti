import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
  providers: [ApiService],
})
export class ProfilPage implements OnInit {
  namaUser: string = '';
  emailUser: string = '';
  nama: string = '';
  email: string = '';
  noHp: string = '';
  fotoUrl: string = '';
  passwordLama: string = '';
  passwordBaru: string = '';
  passwordConfirm: string = '';
  showOld: boolean = false;
  showNew: boolean = false;
  showConfirm: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router, private location: Location, private api: ApiService) {}

  ngOnInit() {
    // Load from localStorage first for instant display
    this.namaUser = localStorage.getItem('namaUser') || '';
    this.emailUser = localStorage.getItem('emailUser') || '';
    this.nama = this.namaUser;
    this.email = this.emailUser;

    // Then fetch fresh data from API
    this.api.getUser().subscribe({
      next: (res: any) => {
        if (res) {
          this.nama = res.name || this.nama;
          this.email = res.email || this.email;
          this.namaUser = this.nama;
          this.emailUser = this.email;
          localStorage.setItem('namaUser', this.nama);
          localStorage.setItem('emailUser', this.email);
        }
      },
      error: (err) => {
        console.error('Gagal mengambil profil dari server:', err);
      }
    });
  }

  gantiFoto() {
    alert('Fungsi ganti foto belum diimplementasikan.');
  }

  simpan() {
    if (!this.nama || !this.email) {
      alert('Nama dan email tidak boleh kosong!');
      return;
    }

    // Validate password if user wants to change it
    if (this.passwordBaru || this.passwordConfirm) {
      if (this.passwordBaru !== this.passwordConfirm) {
        alert('Konfirmasi password tidak cocok!');
        return;
      }
      if (this.passwordBaru.length < 8) {
        alert('Password baru minimal 8 karakter!');
        return;
      }
    }

    const payload: { name: string; email: string; password?: string } = {
      name: this.nama,
      email: this.email,
    };
    if (this.passwordBaru) {
      payload.password = this.passwordBaru;
    }

    this.isLoading = true;
    this.api.updateProfile(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        localStorage.setItem('namaUser', this.nama);
        localStorage.setItem('emailUser', this.email);
        localStorage.setItem('user', JSON.stringify(res.user || {}));
        this.namaUser = this.nama;
        this.emailUser = this.email;
        this.passwordBaru = '';
        this.passwordConfirm = '';
        alert('Profil berhasil disimpan!');
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Gagal menyimpan profil. Coba lagi.';
        alert(msg);
      }
    });
  }

  goBack() {
    this.location.back();
  }

  logout() {
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
