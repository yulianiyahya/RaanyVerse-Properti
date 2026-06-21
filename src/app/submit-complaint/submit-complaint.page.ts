import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../services/api.service';

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
  selectedImage: File | null = null;

  prioritasList = [
    { value: 'rendah', label: 'Rendah' },
    { value: 'sedang', label: 'Sedang' },
    { value: 'tinggi', label: 'Tinggi' },
  ];

  riwayatList: any[] = [];
  unitId: number = 0;
  isLoading: boolean = false;

  constructor(private location: Location, private api: ApiService) {}

  ngOnInit() {
    this.loadComplaints();
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedImage = files[0];
    } else {
      this.selectedImage = null;
    }
  }

  loadComplaints() {
    this.api.getBillings().subscribe({
      next: (billings: any) => {
        if (billings && billings.length > 0) {
          this.punyaUnit = true;
          this.unitId = billings[0].unit_id;
          this.namaUnit = billings[0].unit?.name || 'Unit Anda';
          
          this.api.getComplaints().subscribe({
            next: (res: any) => {
              this.riwayatList = (res || []).map((c: any) => {
                let parsedDesc = c.description;
                let judul = 'Keluhan Unit';
                let kategori = 'Umum';
                let prioritas = 'sedang';
                let lokasi = '';
                
                if (c.description.includes('### KELUHAN ###')) {
                  const parts = c.description.split('\n');
                  kategori = parts.find((p: string) => p.startsWith('Kategori:'))?.split(':')[1]?.trim() || kategori;
                  prioritas = parts.find((p: string) => p.startsWith('Prioritas:'))?.split(':')[1]?.trim() || prioritas;
                  judul = parts.find((p: string) => p.startsWith('Judul:'))?.split(':')[1]?.trim() || judul;
                  lokasi = parts.find((p: string) => p.startsWith('Lokasi:'))?.split(':')[1]?.trim() || lokasi;
                  parsedDesc = parts.find((p: string) => p.startsWith('Deskripsi:'))?.split(':')[1]?.trim() || parsedDesc;
                }
                
                return {
                  judul: judul,
                  deskripsi: parsedDesc,
                  kategori: kategori,
                  prioritas: prioritas,
                  lokasi: lokasi,
                  status: c.status === 'approved' ? 'inprogress' : (c.status === 'completed' || c.status === 'resolved' ? 'completed' : (c.status === 'rejected' ? 'rejected' : 'pending')),
                  statusLabel: c.status === 'approved' ? 'IN PROGRESS' : (c.status === 'completed' || c.status === 'resolved' ? 'COMPLETED' : (c.status === 'rejected' ? 'REJECTED' : 'PENDING')),
                  waktu: new Date(c.created_at).toLocaleDateString('id-ID', {
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
    if (this.isLoading) return;
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
    if (!this.unitId) {
      alert('Anda belum memiliki unit aktif untuk dilaporkan.');
      return;
    }

    const fullDescription = `### KELUHAN ###\nJudul: ${this.judul}\nKategori: ${this.kategori}\nPrioritas: ${this.prioritas}\nLokasi: ${this.lokasi}\nDeskripsi: ${this.deskripsi}`;

    this.isLoading = true;
    this.api.createComplaint(this.unitId, fullDescription, this.selectedImage || undefined).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        alert('Keluhan berhasil dikirim! Kami akan segera menindaklanjuti.');
        
        this.kategori = '';
        this.judul = '';
        this.deskripsi = '';
        this.lokasi = '';
        this.prioritas = 'sedang';
        this.selectedImage = null;
        
        this.loadComplaints();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Gagal mengirim keluhan. Coba lagi.';
        alert(msg);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}