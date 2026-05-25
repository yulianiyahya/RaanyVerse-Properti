import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class ResetPasswordPage implements OnInit {
  email = '';
  password = '';
  confirmPassword = '';
  showPw1 = false;
  showPw2 = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
  ) {
    addIcons({ lockClosedOutline, eyeOutline, eyeOffOutline });
  }

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'] || '';
  }

  resetPassword() {
    if (!this.password || !this.confirmPassword) {
      this.showToast('Semua kolom harus diisi');
      return;
    }

    if (this.password.length < 6) {
      this.showToast('Kata sandi minimal 6 karakter');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showToast('Kata sandi tidak cocok');
      return;
    }

    // Update password di localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex((u: any) => u.email === this.email);

    if (index !== -1) {
      users[index].password = this.password;
      localStorage.setItem('users', JSON.stringify(users));

      // Hapus OTP setelah selesai
      localStorage.removeItem('resetOtp');
      localStorage.removeItem('resetEmail');

      this.showToast('Kata sandi berhasil diubah!');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
    } else {
      this.showToast('Email tidak ditemukan');
    }
  }

  async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }
}