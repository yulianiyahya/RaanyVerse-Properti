import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
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
    this.api.register(this.nama, this.email, this.noHp, this.password, this.confirmPassword).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        alert('Registrasi berhasil! Silakan masuk menggunakan akun Anda.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Registrasi gagal. Coba lagi.';
        alert(msg);
      }
    });
  }

  goToLogin() { this.router.navigate(['/login']); }
  goToPrivacyPolicy() { this.router.navigate(['/privacy-policy']); }
}
