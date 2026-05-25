import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-pemesanan',
  templateUrl: './form-pemesanan.page.html',
  styleUrls: ['./form-pemesanan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class FormPemesananPage implements OnInit {
  unit: any = null;
  tanggalMulai: string = '';
  durasi: string = '3';
  catatan: string = '';
  today: string = new Date().toISOString().split('T')[0];

  durasiList = [
    { value: '1', label: '1 Bulan' },
    { value: '2', label: '2 Bulan' },
    { value: '3', label: '3 Bulan' },
    { value: '6', label: '6 Bulan' },
    { value: '12', label: '12 Bulan' },
  ];

  constructor(private router: Router, private location: Location) {}

  ngOnInit() {
    const data = localStorage.getItem('selectedUnit');
    this.unit = data ? JSON.parse(data) : null;
  }

  getTotalEstimasi(): number {
    return (this.unit?.harga || 0) * parseInt(this.durasi);
  }

  getDepositLabel(): number {
    const bulan = parseInt(this.durasi);
    if (bulan <= 2) return 1;
    if (bulan <= 6) return 2;
    return 3;
  }

  getDeposit(): number {
    return (this.unit?.harga || 0) * this.getDepositLabel();
  }

  getTotalKontrak(): number {
    return this.getTotalEstimasi() + this.getDeposit();
  }

  getBayarDiAwal(): number {
    return (this.unit?.harga || 0) + this.getDeposit();
  }

  submitPesanan() {
    if (!this.tanggalMulai) {
      alert('Harap pilih tanggal mulai sewa.');
      return;
    }

    const pesananBaru = {
      id: Date.now(),
      unitId: this.unit.id,
      nama: this.unit.nama,
      lokasi: this.unit.lokasi,
      harga: this.unit.harga,
      gambar: this.unit.gambar,
      tanggal: new Date(this.tanggalMulai).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
      }),
      durasi: this.durasi,
      catatan: this.catatan,
      bayarDiAwal: this.getBayarDiAwal(),
      totalKontrak: this.getTotalKontrak(),
      status: 'menunggu',
    };

    const existing = JSON.parse(localStorage.getItem('daftarPesanan') || '[]');
    const sudahAda = existing.some((p: any) => p.unitId === this.unit.id && p.status === 'menunggu');
    if (sudahAda) {
      alert('Kamu sudah memiliki pesanan aktif untuk unit ini!');
      return;
    }

    existing.push(pesananBaru);
    localStorage.setItem('daftarPesanan', JSON.stringify(existing));
    alert('Pesanan berhasil dikirim! Admin akan menghubungi kamu segera.');
    this.router.navigate(['/pesanan']);
  }

  goBack() {
    this.location.back();
  }
}