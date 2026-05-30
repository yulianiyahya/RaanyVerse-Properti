import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-form-pemesanan',
  templateUrl: './form-pemesanan.page.html',
  styleUrls: ['./form-pemesanan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
  providers: [ApiService],
})
export class FormPemesananPage implements OnInit {
  unit: any = null;
  tanggalMulai: string = '';
  durasi: string = '3';
  catatan: string = '';
  today: string = new Date().toISOString().split('T')[0];
  
  ktpFile: File | null = null;
  ktpPreview: string | null = null;

  durasiList = [
    { value: '1', label: '1 Bulan' },
    { value: '2', label: '2 Bulan' },
    { value: '3', label: '3 Bulan' },
    { value: '6', label: '6 Bulan' },
    { value: '12', label: '12 Bulan' },
  ];

  isLoading: boolean = false;

  constructor(private router: Router, private location: Location, private api: ApiService) {}

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

  selectKtpFile() {
    const fileInput = document.getElementById('ktp-file-input');
    if (fileInput) {
      fileInput.click();
    }
  }

  onKtpFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file KTP terlalu besar. Maksimal 2MB.');
        return;
      }
      this.ktpFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.ktpPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  submitPesanan() {
    if (!this.tanggalMulai) {
      alert('Harap pilih tanggal mulai sewa.');
      return;
    }
    if (!this.ktpFile) {
      alert('Harap unggah foto KTP Anda terlebih dahulu.');
      return;
    }

    const start = new Date(this.tanggalMulai);
    const months = parseInt(this.durasi);
    const end = new Date(start);
    end.setMonth(start.getMonth() + months);
    
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    this.isLoading = true;
    this.api.createBooking(this.unit.id, startDateStr, endDateStr, this.ktpFile).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        alert('Pesanan berhasil dikirim! Pengelola akan memproses pesanan Anda.');
        this.router.navigate(['/pesanan']);
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Gagal mengirim pesanan. Silakan coba lagi.';
        alert(msg);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}