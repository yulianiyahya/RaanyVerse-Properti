import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

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

  private CLIENT_ID = '788458855289-ll2lt1poim3b89aulqvql7qf2aaheida.apps.googleusercontent.com';
  
  constructor(private router: Router) {}

  ngOnInit() {
    this.isNative = Capacitor.isNativePlatform();

    if (this.isNative) {
      GoogleAuth.initialize({
        clientId: this.CLIENT_ID,
        scopes: ['profile', 'email'],
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
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    this.saveUserAndNavigate(payload.name, payload.email);
  }

  async loginWithGoogle() {
    try {
      const user: any = await GoogleAuth.signIn();
      const nama = user.displayName
        || user.name
        || (user.givenName + ' ' + user.familyName).trim()
        || user.email;
      this.saveUserAndNavigate(nama, user.email);
    } catch (err: any) {
      console.error('Google login error:', JSON.stringify(err));
      alert('Error detail: ' + JSON.stringify(err));
    }
  }

  saveUserAndNavigate(nama: string, email: string) {
    localStorage.setItem('namaUser', nama);
    localStorage.setItem('emailUser', email);

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const exists = users.find((u: any) => u.email === email);
    if (!exists) {
      users.push({ nama, email, password: '' });
      localStorage.setItem('users', JSON.stringify(users));
    }

    this.router.navigate(['/beranda-tenant']);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.email || !this.password) {
      alert('Email dan kata sandi harus diisi!');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === this.email && u.password === this.password);

    if (!user) {
      alert('Email atau kata sandi salah! Silakan daftar terlebih dahulu.');
      return;
    }

    localStorage.setItem('namaUser', user.nama);
    localStorage.setItem('emailUser', user.email);
    this.router.navigate(['/beranda-tenant']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}