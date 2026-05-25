import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  LoadingController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, mailOutline } from 'ionicons/icons';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
  ],
})
export class ForgotPasswordPage {
  email = '';

  private SERVICE_ID  = 'service_inyj2li';
  private TEMPLATE_ID = 'template_54oyo3g';  // ← ganti yang ini
  private PUBLIC_KEY  = 'UhbfjTBTxU53qaghd';

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
  ) {
    addIcons({ homeOutline, mailOutline });
  }

  async sendOtp() {
    if (!this.email) {
      this.showToast('Masukkan email kamu');
      return;
    }

    // Cek apakah email terdaftar
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === this.email);
    if (!user) {
      this.showToast('Email tidak terdaftar');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Mengirim kode...' });
    await loading.present();

    // Generate OTP 4 digit
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    localStorage.setItem('resetOtp', otp);
    localStorage.setItem('resetEmail', this.email);

    try {
      await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        {
          to_email: this.email,
          otp_code: otp,
        },
        this.PUBLIC_KEY
      );

      await loading.dismiss();
      this.showToast('Kode verifikasi terkirim!');
      this.router.navigate(['/verify-otp'], {
        queryParams: { email: this.email }
      });

    } catch (err) {
      await loading.dismiss();
      this.showToast('Gagal mengirim kode. Coba lagi.');
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