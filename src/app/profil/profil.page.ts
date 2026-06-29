import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

declare var google: any;

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ProfilPage implements OnInit {
  namaUser: string = '';
  emailUser: string = '';
  nama: string = '';
  email: string = '';
  noHp: string = '';
  fotoUrl: string = '';
  passwordLama: string = '';
  passwordBaru: string = '';
  passwordConfirm: string = '';
  showOld: boolean = false;
  showNew: boolean = false;
  showConfirm: boolean = false;
  isLoading: boolean = false;
  googleConnected: boolean = false;
  isNative: boolean = false;
  CLIENT_ID: string = '359478724727-557h4ugugks06fb0ge6ciqebb6g5rl5n.apps.googleusercontent.com';

  constructor(
    private router: Router,
    private location: Location,
    private api: ApiService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.isNative = Capacitor.isNativePlatform();
    if (this.isNative) {
      GoogleAuth.initialize({
        clientId: this.CLIENT_ID,
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
      });
    }

    // Load from localStorage first for instant display
    this.namaUser = localStorage.getItem('namaUser') || '';
    this.emailUser = localStorage.getItem('emailUser') || '';
    this.nama = this.namaUser;
    this.email = this.emailUser;
    this.fotoUrl = this.formatFotoUrl(localStorage.getItem('fotoUrl') || '');

    // Then fetch fresh data from API
    this.api.getUser().subscribe({
      next: (res: any) => {
        if (res) {
          this.nama = res.name || this.nama;
          this.email = res.email || this.email;
          this.noHp = res.phone || res.no_telp || res.no_hp || this.noHp;
          this.namaUser = this.nama;
          this.emailUser = this.email;
          
          // Check Google connection status
          this.googleConnected = !!res.google_refresh_token;

          localStorage.setItem('namaUser', this.nama);
          localStorage.setItem('emailUser', this.email);
          const foto = res.photo_url || res.profile_photo_url || res.avatar || res.foto;
          if (foto) {
            this.fotoUrl = this.formatFotoUrl(foto);
            localStorage.setItem('fotoUrl', foto);
          }
        }
      },
      error: (err) => {
        console.error('Gagal mengambil profil dari server:', err);
      }
    });
  }

  gantiFoto() {
    if (this.isLoading) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/gif,image/webp';
    input.onchange = (event: any) => {
      const file: File = event.target.files[0];
      if (!file) return;

      // Max 5MB
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('Ukuran foto maksimal 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result;
        // Show preview immediately + save to localStorage so it persists
        this.fotoUrl = base64;
        localStorage.setItem('fotoUrl', base64);

        this.isLoading = true;
        // Sync ke backend — will update fotoUrl with the real server URL
        this.api.updateProfilePhoto(base64).subscribe({
          next: (res: any) => {
            this.isLoading = false;
            if (res?.photo_url) {
              this.fotoUrl = this.formatFotoUrl(res.photo_url);
              localStorage.setItem('fotoUrl', res.photo_url);
            }
            this.showToast('Foto profil berhasil diubah!');
          },
          error: () => {
            this.isLoading = false;
            // Base64 already set — photo still shows, just warn about sync
            this.showToast('Foto tersimpan lokal, gagal sinkronisasi ke server.');
          }
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }

  simpan() {
    if (this.isLoading) return;
    if (!this.nama || !this.email) {
      this.showToast('Nama dan email tidak boleh kosong!');
      return;
    }

    // Validate password if user wants to change it
    if (this.passwordBaru || this.passwordConfirm) {
      if (this.passwordBaru !== this.passwordConfirm) {
        this.showToast('Konfirmasi password tidak cocok!');
        return;
      }
      if (this.passwordBaru.length < 8) {
        this.showToast('Password baru minimal 8 karakter!');
        return;
      }
    }

    const payload: { name: string; email: string; phone: string; password?: string } = {
      name: this.nama,
      email: this.email,
      phone: this.noHp,
    };
    if (this.passwordBaru) {
      payload.password = this.passwordBaru;
    }

    this.isLoading = true;
    // Preserve existing fotoUrl before API call
    const currentFoto = this.fotoUrl || localStorage.getItem('fotoUrl') || '';

    this.api.updateProfile(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        localStorage.setItem('namaUser', this.nama);
        localStorage.setItem('emailUser', this.email);
        localStorage.setItem('user', JSON.stringify(res.user || {}));

        // Preserve photo: use server URL if available, fallback to existing
        const serverPhoto = res.user?.photo_url || res.user?.profile_photo_url || res.user?.avatar || res.user?.foto;
        this.fotoUrl = this.formatFotoUrl(serverPhoto || currentFoto);
        localStorage.setItem('fotoUrl', serverPhoto || currentFoto);

        this.namaUser = this.nama;
        this.emailUser = this.email;
        this.passwordBaru = '';
        this.passwordConfirm = '';
        this.showToast('Profil berhasil disimpan!');
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Gagal menyimpan profil. Coba lagi.';
        this.showToast(msg);
      }
    });
  }

  goBack() {
    this.location.back();
  }

  logout() {
    this.api.logoutGoogle();
    this.api.logout().subscribe({
      next: () => {
        const hasSeenOnboarding = localStorage.getItem('has_seen_onboarding');
        localStorage.clear();
        if (hasSeenOnboarding) {
          localStorage.setItem('has_seen_onboarding', hasSeenOnboarding);
        }
        this.router.navigate(['/login']);
      },
      error: () => {
        const hasSeenOnboarding = localStorage.getItem('has_seen_onboarding');
        localStorage.clear();
        if (hasSeenOnboarding) {
          localStorage.setItem('has_seen_onboarding', hasSeenOnboarding);
        }
        this.router.navigate(['/login']);
      }
    });
  }

  async hubungkanGoogle() {
    if (this.isLoading) return;
    if (this.googleConnected) {
      this.showToast('Akun Google Calendar Anda sudah terhubung.');
      return;
    }

    try {
      this.isLoading = true;
      let googleUser: any;

      if (this.isNative) {
        googleUser = await GoogleAuth.signIn();
      } else {
        googleUser = await GoogleAuth.signIn();
      }

      const idToken = googleUser.authentication?.idToken || '';

      if (!idToken) {
        throw new Error('Google ID Token tidak ditemukan.');
      }

      this.api.connectGoogle(idToken).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.googleConnected = true;
          this.showToast('Berhasil menghubungkan Google Calendar!');
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error connecting Google account on backend:', err);
          const msg = err.error?.message || 'Gagal menyinkronkan Google ke server.';
          alert('Gagal: ' + msg);
        }
      });

    } catch (err: any) {
      this.isLoading = false;
      console.error('Google link error:', err);
      alert('Gagal menghubungkan Google: ' + (err.message || JSON.stringify(err)));
    }
  }

  formatFotoUrl(url: string | null): string {
    return this.api.formatImageUrl(url);
  }
}
