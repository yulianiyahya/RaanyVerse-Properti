import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  register() {
    if (!this.nama || !this.email || !this.noHp || !this.password || !this.confirmPassword) {
      alert('Semua field harus diisi!');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Kata sandi tidak cocok!');
      return;
    }

    // Cek apakah email sudah terdaftar
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const sudahAda = users.find((u: any) => u.email === this.email);
    if (sudahAda) {
      alert('Email sudah terdaftar!');
      return;
    }

    // Simpan user baru
    users.push({
      nama: this.nama,
      email: this.email,
      noHp: this.noHp,
      password: this.password,
    });
    localStorage.setItem('users', JSON.stringify(users));

    // Langsung ke login tanpa alert
    this.router.navigate(['/login']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}