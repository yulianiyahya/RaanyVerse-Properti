import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-detail-unit',
  templateUrl: './detail-unit.page.html',
  styleUrls: ['./detail-unit.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule],
  providers: [ApiService],
})
export class DetailUnitPage implements OnInit {
  unit: any = null;
  isFavorit: boolean = false;
  isLoading: boolean = false;
  fasilitasList: any[] = [
    { icon: 'wifi-outline', nama: 'WiFi' },
    { icon: 'snow-outline', nama: 'AC' },
    { icon: 'bed-outline', nama: 'Kasur' },
    { icon: 'desktop-outline', nama: 'Meja' }
  ];

  constructor(private router: Router, private location: Location, private api: ApiService) {}

  ngOnInit() {
    // Load from localStorage first for instant display
    const data = localStorage.getItem('selectedUnit');
    this.unit = data ? JSON.parse(data) : null;

    if (this.unit) {
      // Check favorite status
      const favorit = JSON.parse(localStorage.getItem('favoritUnit') || '[]');
      this.isFavorit = favorit.some((f: any) => f.id === this.unit.id);

      // Fetch fresh data from API
      this.isLoading = true;
      this.api.getUnitDetail(this.unit.id).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          // Merge API data with local display format
          this.unit = {
            ...this.unit,
            id: res.id,
            nama: res.name || this.unit.nama,
            harga: res.price || this.unit.harga,
            status: res.status === 'available' ? 'tersedia' : res.status,
            tipe: res.type || this.unit.tipe,
            gambar: res.image || this.unit.gambar,
            blok: res.blok || '',
            nomor_unit: res.nomor_unit || '',
            property_type: res.property_type || '',
            lokasi: res.estate?.address || res.estate?.name || this.unit.lokasi,
          };
          // Update localStorage with fresh data
          localStorage.setItem('selectedUnit', JSON.stringify(this.unit));
        },
        error: () => {
          this.isLoading = false;
          // Keep using localStorage data if API fails
        }
      });
    }
  }

  toggleFavorit(event: any) {
    event.stopPropagation();
    event.preventDefault();
    this.isFavorit = !this.isFavorit;

    let favorit = JSON.parse(localStorage.getItem('favoritUnit') || '[]');
    if (this.isFavorit) {
      favorit.push(this.unit);
    } else {
      favorit = favorit.filter((f: any) => f.id !== this.unit.id);
    }
    localStorage.setItem('favoritUnit', JSON.stringify(favorit));
  }

  pesan() {
    this.router.navigate(['/form-pemesanan']);
  }

  goBack() {
    this.location.back();
  }
}
