import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon, ToastController, LoadingController, IonSpinner } from '@ionic/angular/standalone';
import { ApiService } from '../services/api.service';
import { addIcons } from 'ionicons';
import { lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSpinner],
})
export class ResetPasswordPage implements OnInit {
  email = '';
  password = '';
  confirmPassword = '';
  showPw1 = false;
  showPw2 = false;
  isLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private api: ApiService,
  ) {
    addIcons({ lockClosedOutline, eyeOutline, eyeOffOutline });
  }

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'] || '';
    // Jika tidak ada email, kembali ke forgot-password
    if (!this.email) {
      this.router.navigate(['/forgot-password']);
    }
  }

  async resetPassword() {
    if (this.isLoading) return;
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

    const loading = await this.loadingCtrl.create({ message: 'Memperbarui kata sandi...' });
    await loading.present();
    this.isLoading = true;

    // Panggil backend Laravel untuk reset password
    this.api.updateForgotPassword(this.email, this.password).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isLoading = false;

        // Bersihkan data reset dari localStorage
        localStorage.removeItem('resetOtp');
        localStorage.removeItem('resetEmail');

        this.showToast('Kata sandi berhasil diubah! Silakan login.');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: async (err: any) => {
        await loading.dismiss();
        this.isLoading = false;
        const msg = err.error?.message || 'Gagal memperbarui kata sandi. Coba lagi.';
        this.showToast(msg);
      }
    });
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