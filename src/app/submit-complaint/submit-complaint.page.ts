import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-submit-complaint',
  templateUrl: './submit-complaint.page.html',
  styleUrls: ['./submit-complaint.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class SubmitComplaintPage implements OnInit {
  punyaUnit: boolean = false;
  namaUnit: string = '';
  kategori: string = '';
  prioritas: string = 'sedang';
  judul: string = '';
  deskripsi: string = '';
  lokasi: string = '';

  prioritasList = [
    { value: 'rendah', label: 'Rendah' },
    { value: 'sedang', label: 'Sedang' },
    { value: 'tinggi', label: 'Tinggi' },
  ];

  riwayatList: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const email = localStorage.getItem('emailUser') || '';
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email);

    if (user?.unit) {
      this.punyaUnit = true;
      this.namaUnit = user.unit.nama || 'Unit Kamu';
      this.riwayatList = user.complaints || [];
    }
  }

  submit() {
    if (!this.kategori) {
      alert('Pilih kategori keluhan terlebih dahulu!');
      return;
    }
    if (!this.judul.trim()) {
      alert('Judul keluhan tidak boleh kosong!');
      return;
    }
    if (!this.deskripsi.trim()) {
      alert('Deskripsi keluhan tidak boleh kosong!');
      return;
    }

    const email = localStorage.getItem('emailUser') || '';
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex((u: any) => u.email === email);

    const complaint = {
      judul: this.judul,
      deskripsi: this.deskripsi,
      kategori: this.kategori,
      prioritas: this.prioritas,
      lokasi: this.lokasi,
      status: 'proses',
      statusLabel: 'DIPROSES',
      waktu: new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
    };

    if (!users[index].complaints) {
      users[index].complaints = [];
    }
    users[index].complaints.unshift(complaint);
    localStorage.setItem('users', JSON.stringify(users));

    this.riwayatList = users[index].complaints;

    alert('Keluhan berhasil dikirim! Kami akan segera menindaklanjuti.');

    this.kategori = '';
    this.judul = '';
    this.deskripsi = '';
    this.lokasi = '';
    this.prioritas = 'sedang';
  }

  goBack() {
    this.router.navigate(['/beranda-tenant']);
  }
}