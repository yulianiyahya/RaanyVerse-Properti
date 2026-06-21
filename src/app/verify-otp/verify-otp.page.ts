import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, ToastController, IonSpinner } from '@ionic/angular/standalone';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.page.html',
  styleUrls: ['./verify-otp.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonSpinner],
})
export class VerifyOtpPage implements OnInit {
  email = '';
  otpDigits: string[] = ['', '', '', '', '', ''];
  timer = 60;
  timerActive = true;
  isLoading = false;
  private timerInterval: any;

  private SERVICE_ID  = 'service_inyj2li';
  private TEMPLATE_ID = 'template_54oyo3g';
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
    if (value && index < 5) {
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
    if (this.isLoading) return;
    const inputOtp = this.otpDigits.join('');
    const savedOtp = localStorage.getItem('resetOtp');
    const savedEmail = localStorage.getItem('resetEmail');

    if (inputOtp.length < 6) {
      this.showToast('Masukkan 6 digit kode OTP');
      return;
    }

    this.isLoading = true;
    if (inputOtp === savedOtp && this.email === savedEmail) {
      // Hapus OTP dari storage setelah berhasil diverifikasi
      localStorage.removeItem('resetOtp');
      this.showToast('Verifikasi berhasil!');
      this.isLoading = false;
      this.router.navigate(['/reset-password'], {
        queryParams: { email: this.email }
      });
    } else {
      this.isLoading = false;
      this.showToast('Kode OTP salah atau sudah kadaluarsa.');
    }
  }

  async resend() {
    if (this.timerActive || this.isLoading) return;

    this.isLoading = true;
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('resetOtp', otp);

    try {
      await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        { to_email: this.email, otp_code: otp },
        this.PUBLIC_KEY
      );
      this.showToast('Kode baru telah dikirim ke email kamu!');
      this.startTimer();
    } catch {
      this.showToast('Gagal kirim ulang. Coba lagi.');
    } finally {
      this.isLoading = false;
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