import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

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
  
  ktpFile: File | null = null;
  ktpPreview: string | null = null;

  paymentType: string = 'sewa';
  dpAmount: number = 0;
  dueDay: number | null = null;
  dueDayList = Array.from({ length: 28 }, (_, i) => i + 1);

  durasiList: { value: string, label: string }[] = [];
  isLoading: boolean = false;

  constructor(private router: Router, private location: Location, private api: ApiService) {}

  ngOnInit() {
    const data = localStorage.getItem('selectedUnit');
    this.unit = data ? JSON.parse(data) : null;

    if (this.unit && this.unit.has_pending_booking) {
      alert('Unit tidak bisa dipesan karena ada permintaan sewa/pembelian yang belum di-approve oleh admin.');
      this.location.back();
      return;
    }
    
    // Auto-default paymentType based on cached property_type first
    if (this.unit && this.unit.property_type) {
      const propType = this.unit.property_type.toLowerCase();
      if (propType === 'ruko') {
        this.paymentType = 'sewa';
      } else if (propType === 'rumah') {
        this.paymentType = 'cicilan';
      }
    }
    this.updateDurasiList();

    if (this.unit) {
      // Fetch fresh data from API to bypass local storage caching
      this.api.getUnitDetail(this.unit.id).subscribe({
        next: (res: any) => {
          this.unit = {
            ...this.unit,
            id: res.id,
            nama: res.name || this.unit.nama,
            harga: res.price || this.unit.harga,
            status: res.status === 'available' ? 'tersedia' : (res.status === 'occupied' ? 'disewa' : (res.status === 'maintenance' ? 'perawatan' : res.status)),
            tipe: res.type || this.unit.tipe,
            gambar: this.api.formatImageUrl(res.image) || this.unit.gambar,
            blok: res.blok || '',
            nomor_unit: res.nomor_unit || '',
            property_type: res.property_type || '',
            lokasi: res.estate?.address || res.estate?.name || this.unit.lokasi,
            has_pending_booking: res.has_pending_booking || false,
          };
          localStorage.setItem('selectedUnit', JSON.stringify(this.unit));

          if (this.unit.has_pending_booking) {
            alert('Unit tidak bisa dipesan karena ada permintaan sewa/pembelian yang belum di-approve oleh admin.');
            this.location.back();
            return;
          }
          
          // Refresh default options with the latest data
          if (this.unit.property_type) {
            const propType = this.unit.property_type.toLowerCase();
            if (propType === 'ruko') {
              this.paymentType = 'sewa';
            } else if (propType === 'rumah') {
              this.paymentType = 'cicilan';
            }
          }
          this.updateDurasiList();
        }
      });
    }
  }

  updateDurasiList() {
    if (this.paymentType === 'sewa') {
      this.durasiList = [
        { value: '1', label: '1 Bulan' },
        { value: '2', label: '2 Bulan' },
        { value: '3', label: '3 Bulan' },
        { value: '6', label: '6 Bulan' },
        { value: '12', label: '12 Bulan' },
      ];
      this.durasi = '3';
    } else {
      this.durasiList = [
        { value: '12', label: '12 Bulan (1 Tahun)' },
        { value: '24', label: '24 Bulan (2 Tahun)' },
        { value: '36', label: '36 Bulan (3 Tahun)' },
        { value: '48', label: '48 Bulan (4 Tahun)' },
        { value: '60', label: '60 Bulan (5 Tahun)' },
        { value: '120', label: '120 Bulan (10 Tahun)' },
        { value: '144', label: '144 Bulan (12 Tahun)' },
      ];
      this.durasi = '12';
    }
  }

  getTotalHarga(): number {
    if (this.paymentType === 'sewa') {
      return (this.unit?.harga || 0) * parseInt(this.durasi);
    } else {
      return (this.unit?.harga || 0);
    }
  }

  getDeposit(): number {
    if (this.paymentType === 'sewa') {
      const bulan = parseInt(this.durasi);
      let depositLabel = 3;
      if (bulan <= 2) depositLabel = 1;
      else if (bulan <= 6) depositLabel = 2;
      return (this.unit?.harga || 0) * depositLabel;
    }
    return 0;
  }

  getTotalKontrak(): number {
    return this.getTotalHarga() + this.getDeposit();
  }

  getSisaPembayaran(): number {
    const sisa = this.getTotalKontrak() - this.dpAmount;
    return sisa > 0 ? sisa : 0;
  }

  getCicilanBulanan(): number {
    const durasiBulan = parseInt(this.durasi);
    if (durasiBulan > 0) {
      return this.getSisaPembayaran() / durasiBulan;
    }
    return 0;
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
    if (this.isLoading) return;
    if (this.unit?.has_pending_booking) {
      alert('Unit tidak bisa dipesan karena ada permintaan sewa/pembelian yang belum di-approve oleh admin.');
      this.location.back();
      return;
    }
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
    this.api.createBooking(
      this.unit.id, 
      startDateStr, 
      endDateStr, 
      this.paymentType,
      months,
      this.dpAmount,
      this.dueDay,
      this.ktpFile
    ).subscribe({
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