import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
  providers: [ApiService],
})
export class RegisterPage {
  nama: string = '';
  email: string = '';
  noHp: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router, private api: ApiService) {}

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  register() {
    if (!this.nama || !this.email || !this.noHp || !this.password || !this.confirmPassword) {
      alert('Semua field harus diisi!'); return;
    }
    if (this.password !== this.confirmPassword) {
      alert('Kata sandi tidak cocok!'); return;
    }
    if (this.password.length < 8) {
      alert('Password minimal 8 karakter!'); return;
    }

    this.isLoading = true;
    this.api.register(this.nama, this.email, this.password, this.confirmPassword).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        localStorage.setItem('auth_token', res.access_token);
        localStorage.setItem('namaUser', res.user.name);
        localStorage.setItem('emailUser', res.user.email);
        
        // Simpan data ke array 'users' di localStorage agar halaman profil bisa membaca noHp
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const exists = users.find((u: any) => u.email === res.user.email);
        if (!exists) {
          users.push({ nama: res.user.name, email: res.user.email, noHp: this.noHp, password: this.password });
        } else {
          const index = users.findIndex((u: any) => u.email === res.user.email);
          users[index].nama = res.user.name;
          users[index].noHp = this.noHp;
          users[index].password = this.password;
        }
        localStorage.setItem('users', JSON.stringify(users));

        localStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/beranda-tenant']);
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Registrasi gagal. Coba lagi.';
        alert(msg);
      }
    });
  }

  goToLogin() { this.router.navigate(['/login']); }
}