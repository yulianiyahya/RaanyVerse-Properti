import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { ApiService } from '../services/api.service';

declare var google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isNative: boolean = false;

  private CLIENT_ID = '359478724727-557h4ugugks06fb0ge6ciqebb6g5rl5n.apps.googleusercontent.com';
  isLoading: boolean = false;

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit() {
    // Jika user sudah login, langsung ke beranda-tenant
    if (localStorage.getItem('auth_token')) {
      this.router.navigate(['/beranda-tenant']);
      return;
    }

    this.isNative = Capacitor.isNativePlatform();

    if (this.isNative) {
      GoogleAuth.initialize({
        clientId: this.CLIENT_ID,
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
      });
    } else {
      this.initGoogleSignIn();
    }
  }

  initGoogleSignIn() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      google.accounts.id.initialize({
        client_id: this.CLIENT_ID,
        callback: (response: any) => this.handleGoogleResponse(response),
        ux_mode: 'popup',
        cancel_on_tap_outside: false,
      });

      setTimeout(() => {
        const btnEl = document.getElementById('google-btn');
        if (btnEl) {
          google.accounts.id.renderButton(btnEl, {
            theme: 'outline',
            size: 'large',
            width: 340,
            text: 'signin_with',
            shape: 'rectangular',
          });
        }
      }, 500);
    };
  }

  handleGoogleResponse(response: any) {
    // response.credential is the raw Google ID token (JWT)
    const rawToken = response.credential;
    // Decode payload to extract name & email
    try {
      const payload = JSON.parse(atob(rawToken.split('.')[1]));
      // Send to Laravel backend to get a real auth token
      this.saveUserAndNavigate(payload.name || payload.email, payload.email, rawToken);
    } catch (err) {
      console.error('Gagal decode Google token:', err);
      alert('Login Google gagal. Coba lagi.');
    }
  }

  async loginWithGoogle() {
    try {
      const user: any = await GoogleAuth.signIn();
      const nama = user.displayName
        || user.name
        || (user.givenName + ' ' + user.familyName).trim()
        || user.email;
      // For native, use the authentication.idToken from Capacitor Google Auth
      const idToken = user.authentication?.idToken || '';
      this.saveUserAndNavigate(nama, user.email, idToken);
    } catch (err: any) {
      console.error('Google login error:', JSON.stringify(err));
      alert('Error detail: ' + JSON.stringify(err));
    }
  }

  saveUserAndNavigate(nama: string, email: string, googleIdToken: string) {
    this.isLoading = true;
    this.api.googleLogin(email, nama, googleIdToken).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        localStorage.setItem('auth_token', res.access_token);
        localStorage.setItem('namaUser', res.user.name);
        localStorage.setItem('emailUser', res.user.email);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/beranda-tenant']);
      },
      error: (err: any) => {
        this.isLoading = false;
        const status = err.status || 0;
        const msg = err.error?.message || err.message || 'Tidak dapat terhubung ke server.';
        // Tampilkan detail error untuk debugging
        if (status === 0) {
          alert('❌ Server tidak dapat dihubungi.\n\nPastikan Laravel sudah berjalan:\njalankan "php artisan serve"');
        } else if (status === 403) {
          alert('❌ Akun ini bukan tenant.\n\n' + msg);
        } else if (status === 422) {
          alert('❌ Data Google tidak valid:\n\n' + msg);
        } else {
          alert(`❌ Error ${status}:\n${msg}`);
        }
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.email || !this.password) {
      alert('Email dan kata sandi harus diisi!');
      return;
    }

    this.isLoading = true;
    this.api.login(this.email, this.password).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        localStorage.setItem('auth_token', res.access_token);
        localStorage.setItem('namaUser', res.user.name);
        localStorage.setItem('emailUser', res.user.email);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/beranda-tenant']);
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Login gagal. Email atau kata sandi salah.';
        alert(msg);
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
