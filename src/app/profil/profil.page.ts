import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

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

  constructor(private router: Router, private location: Location) {}

  ngOnInit() {
    const emailLogin = localStorage.getItem('emailUser') || '';
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === emailLogin);

    if (user) {
      this.nama = user.nama;
      this.email = user.email;
      this.noHp = user.noHp;
      this.fotoUrl = user.foto || '';
      this.namaUser = user.nama;
      this.emailUser = user.email;
    }
  }

  gantiFoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev: any) => {
        this.fotoUrl = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  simpan() {
    const emailLogin = localStorage.getItem('emailUser') || '';
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex((u: any) => u.email === emailLogin);

    if (index === -1) return;

    // Update nama & noHp
    users[index].nama = this.nama;
    users[index].noHp = this.noHp;
    users[index].foto = this.fotoUrl;

    // Ganti password jika diisi
    if (this.passwordLama || this.passwordBaru || this.passwordConfirm) {
      if (users[index].password !== this.passwordLama) {
        alert('Password lama tidak sesuai!');
        return;
      }
      if (this.passwordBaru !== this.passwordConfirm) {
        alert('Konfirmasi password tidak cocok!');
        return;
      }
      if (this.passwordBaru.length < 6) {
        alert('Password baru minimal 6 karakter!');
        return;
      }
      users[index].password = this.passwordBaru;
    }

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('namaUser', this.nama);

    alert('Profil berhasil disimpan!');
    this.namaUser = this.nama;
    this.passwordLama = '';
    this.passwordBaru = '';
    this.passwordConfirm = '';
  }

  goBack() {
    this.location.back();
  }

  logout() {
    localStorage.removeItem('namaUser');
    localStorage.removeItem('emailUser');
    this.router.navigate(['/login']);
  }
}