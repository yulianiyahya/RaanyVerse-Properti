import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-request-maintenance',
  templateUrl: './request-maintenance.page.html',
  styleUrls: ['./request-maintenance.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RequestMaintenancePage implements OnInit {
  punyaUnit: boolean = false;
  namaUnit: string = '';
  jenis: string = '';
  urgensi: string = 'sedang';
  judul: string = '';
  deskripsi: string = '';
  lokasi: string = '';
  jadwal: string = '';
  minDate: string = '';

  urgensiList = [
    { value: 'rendah', label: 'Rendah' },
    { value: 'sedang', label: 'Sedang' },
    { value: 'tinggi', label: 'Tinggi' },
  ];

  riwayatList: any[] = [];

  constructor(private location: Location) {}

  ngOnInit() {
    // Set min date ke hari ini
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    const email = localStorage.getItem('emailUser') || '';
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email);

    if (user?.unit) {
      this.punyaUnit = true;
      this.namaUnit = user.unit.nama || 'Unit Kamu';
      this.riwayatList = user.maintenance || [];
    }
  }

  submit() {
    if (!this.jenis) {
      alert('Pilih jenis perbaikan terlebih dahulu!');
      return;
    }
    if (!this.judul.trim()) {
      alert('Judul permintaan tidak boleh kosong!');
      return;
    }
    if (!this.deskripsi.trim()) {
      alert('Deskripsi masalah tidak boleh kosong!');
      return;
    }
    if (!this.jadwal) {
      alert('Pilih jadwal yang diinginkan!');
      return;
    }

    const jenisLabel: any = {
      plumbing: 'Plumbing',
      listrik: 'Listrik',
      ac: 'AC & Ventilasi',
      pintu: 'Pintu & Jendela',
      lantai: 'Lantai & Dinding',
      atap: 'Atap & Plafon',
      furniture: 'Furnitur',
      lainnya: 'Lainnya',
    };

    const urgensiLabel: any = {
      rendah: 'Rendah',
      sedang: 'Sedang',
      tinggi: 'Tinggi',
    };

    const email = localStorage.getItem('emailUser') || '';
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex((u: any) => u.email === email);

    const maintenance = {
      judul: this.judul,
      deskripsi: this.deskripsi,
      jenis: jenisLabel[this.jenis] || this.jenis,
      urgensi: this.urgensi,
      urgensiLabel: urgensiLabel[this.urgensi],
      lokasi: this.lokasi || '-',
      jadwal: this.jadwal,
      status: 'menunggu',
      statusLabel: 'MENUNGGU',
      waktu: new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
    };

    if (!users[index].maintenance) {
      users[index].maintenance = [];
    }
    users[index].maintenance.unshift(maintenance);
    localStorage.setItem('users', JSON.stringify(users));

    this.riwayatList = users[index].maintenance;

    alert('Permintaan maintenance berhasil dikirim! Teknisi akan menghubungi kamu sesuai jadwal.');

    this.jenis = '';
    this.judul = '';
    this.deskripsi = '';
    this.lokasi = '';
    this.jadwal = '';
    this.urgensi = 'sedang';
  }

  goBack() {
    this.location.back();
  }
}