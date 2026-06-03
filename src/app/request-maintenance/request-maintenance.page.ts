import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-request-maintenance',
  templateUrl: './request-maintenance.page.html',
  styleUrls: ['./request-maintenance.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
  providers: [ApiService],
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
  selectedImage: File | null = null;

  urgensiList = [
    { value: 'rendah', label: 'Rendah' },
    { value: 'sedang', label: 'Sedang' },
    { value: 'tinggi', label: 'Tinggi' },
  ];

  riwayatList: any[] = [];
  unitId: number = 0;
  isLoading: boolean = false;

  constructor(private location: Location, private api: ApiService) {}

  ngOnInit() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.loadMaintenances();
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedImage = files[0];
    } else {
      this.selectedImage = null;
    }
  }

  loadMaintenances() {
    this.api.getBillings().subscribe({
      next: (billings: any) => {
        if (billings && billings.length > 0) {
          this.punyaUnit = true;
          this.unitId = billings[0].unit_id;
          this.namaUnit = billings[0].unit?.name || 'Unit Anda';
          
          this.api.getMaintenances().subscribe({
            next: (res: any) => {
              this.riwayatList = (res || []).map((m: any) => {
                let parsedDesc = m.description;
                let judul = 'Perbaikan Hunian';
                let jenis = 'Lainnya';
                let urgensi = 'sedang';
                let lokasi = '';
                let jadwal = '';
                
                if (m.description.includes('### PERBAIKAN ###')) {
                  const parts = m.description.split('\n');
                  jenis = parts.find((p: string) => p.startsWith('Jenis:'))?.split(':')[1]?.trim() || jenis;
                  urgensi = parts.find((p: string) => p.startsWith('Urgensi:'))?.split(':')[1]?.trim() || urgensi;
                  judul = parts.find((p: string) => p.startsWith('Judul:'))?.split(':')[1]?.trim() || judul;
                  lokasi = parts.find((p: string) => p.startsWith('Lokasi:'))?.split(':')[1]?.trim() || lokasi;
                  jadwal = parts.find((p: string) => p.startsWith('Jadwal:'))?.split(':')[1]?.trim() || jadwal;
                  parsedDesc = parts.find((p: string) => p.startsWith('Deskripsi:'))?.split(':')[1]?.trim() || parsedDesc;
                }
                
                return {
                  judul: judul,
                  deskripsi: parsedDesc,
                  jenis: jenis,
                  urgensi: urgensi,
                  urgensiLabel: urgensi.charAt(0).toUpperCase() + urgensi.slice(1),
                  lokasi: lokasi,
                  jadwal: jadwal,
                  status: m.status === 'resolved' ? 'selesai' : 'menunggu',
                  statusLabel: m.status === 'resolved' ? 'SELESAI' : 'MENUNGGU',
                  waktu: new Date(m.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })
                };
              });
            }
          });
        } else {
          this.punyaUnit = false;
        }
      },
      error: () => {
        this.punyaUnit = false;
      }
    });
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
    if (!this.unitId) {
      alert('Anda belum memiliki unit aktif.');
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

    const formattedJenis = jenisLabel[this.jenis] || this.jenis;
    const fullDescription = `### PERBAIKAN ###\nJudul: ${this.judul}\nJenis: ${formattedJenis}\nUrgensi: ${this.urgensi}\nJadwal: ${this.jadwal}\nLokasi: ${this.lokasi || '-'}\nDeskripsi: ${this.deskripsi}`;

    this.isLoading = true;
    this.api.createMaintenance(this.unitId, fullDescription, this.selectedImage || undefined).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        alert('Permintaan maintenance berhasil dikirim! Teknisi akan menghubungi kamu sesuai jadwal.');
        
        this.jenis = '';
        this.judul = '';
        this.deskripsi = '';
        this.lokasi = '';
        this.jadwal = '';
        this.urgensi = 'sedang';
        this.selectedImage = null;
        
        this.loadMaintenances();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Gagal mengirim permintaan. Coba lagi.';
        alert(msg);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}