import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, ToastController } from '@ionic/angular/standalone';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.page.html',
  styleUrls: ['./verify-otp.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent],
})
export class VerifyOtpPage implements OnInit {
  email = '';
  otpDigits: string[] = ['', '', '', ''];
  timer = 60;
  timerActive = true;
  private timerInterval: any;

  private SERVICE_ID  = 'service_inyj2li';
  private TEMPLATE_ID = 'xo5n02x';
  private PUBLIC_KEY  = 'UhbfjTBTxU53qaghd';

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private location: Location,
  ) {}

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'] || '';
    this.startTimer();
  }

  startTimer() {
    this.timer = 60;
    this.timerActive = true;
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer === 0) {
        clearInterval(this.timerInterval);
        this.timerActive = false;
      }
    }, 1000);
  }

  onOtpInput(event: any, index: number) {
    const value = event.target.value;
    this.otpDigits[index] = value;
    if (value && index < 3) {
      const inputs = this.otpInputs.toArray();
      inputs[index + 1].nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const inputs = this.otpInputs.toArray();
      inputs[index - 1].nativeElement.focus();
    }
  }

  verifyOtp() {
    const inputOtp = this.otpDigits.join('');
    const savedOtp = localStorage.getItem('resetOtp');
    const savedEmail = localStorage.getItem('resetEmail');

    if (inputOtp.length < 4) {
      this.showToast('Masukkan 4 digit kode OTP');
      return;
    }

    if (inputOtp === savedOtp && this.email === savedEmail) {
      this.showToast('Verifikasi berhasil!');
      this.router.navigate(['/reset-password'], {
        queryParams: { email: this.email }
      });
    } else {
      this.showToast('Kode OTP salah. Coba lagi.');
    }
  }

  async resend() {
    if (this.timerActive) return;

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    localStorage.setItem('resetOtp', otp);

    try {
      await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        { to_email: this.email, otp_code: otp },
        this.PUBLIC_KEY
      );
      this.showToast('Kode baru telah dikirim!');
      this.startTimer();
    } catch {
      this.showToast('Gagal kirim ulang. Coba lagi.');
    }
  }

  goBack() {
    this.location.back();
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