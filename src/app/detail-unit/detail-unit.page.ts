import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detail-unit',
  templateUrl: './detail-unit.page.html',
  styleUrls: ['./detail-unit.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class DetailUnitPage implements OnInit {
  unit: any = null;
  isFavorit: boolean = false;

  fasilitasList = [
    { icon: '🛋️', label: 'Furnished' },
    { icon: '❄️', label: 'AC' },
    { icon: '📶', label: 'WiFi' },
    { icon: '🅿️', label: 'Parkir' },
    { icon: '🔒', label: 'Security' },
    { icon: '🏊', label: 'Kolam' },
    { icon: '🏋️', label: 'Gym' },
    { icon: '🧺', label: 'Laundry' },
  ];

  constructor(private router: Router, private location: Location) {}

  ngOnInit() {
    const data = localStorage.getItem('selectedUnit');
    this.unit = data ? JSON.parse(data) : null;

    if (this.unit) {
      const favorit = JSON.parse(localStorage.getItem('favoritUnit') || '[]');
      this.isFavorit = favorit.some((f: any) => f.id === this.unit.id);
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