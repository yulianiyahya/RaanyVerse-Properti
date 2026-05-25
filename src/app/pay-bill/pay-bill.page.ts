import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-pay-bill',
  templateUrl: './pay-bill.page.html',
  styleUrls: ['./pay-bill.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class PayBillPage implements OnInit {
  punyaUnit: boolean = false;
  totalTagihan: number = 0;
  jatuhTempo: string = '';
  metodeTerpilih: string = 'transfer';

  rincianTagihan: any[] = [];

  metodeList = [
    {
      id: 'transfer',
      icon: '🏦',
      nama: 'Transfer Bank',
      deskripsi: 'BCA / Mandiri / BNI / BRI',
    },
    {
      id: 'ewallet',
      icon: '📱',
      nama: 'E-Wallet',
      deskripsi: 'GoPay / OVO / Dana / ShopeePay',
    },
    {
      id: 'tunai',
      icon: '💵',
      nama: 'Tunai ke Admin',
      deskripsi: 'Bayar langsung ke kantor pengelola',
    },
  ];

  constructor(private location: Location) {}

  ngOnInit() {
    const email = localStorage.getItem('emailUser') || '';
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email);

    if (user?.unit) {
      this.punyaUnit = true;
      this.jatuhTempo = user.unit.jatuhTempo || '-';
      this.rincianTagihan = user.unit.tagihan || [];
      this.totalTagihan = this.rincianTagihan
        .filter((t: any) => t.status === 'belum')
        .reduce((acc: number, t: any) => acc + t.nominal, 0);
    } else {
      this.punyaUnit = false;
    }
  }

  bayar() {
    const metodeNama = this.metodeList.find(m => m.id === this.metodeTerpilih)?.nama || '';
    alert(`Pembayaran Rp ${this.totalTagihan.toLocaleString('id-ID')} via ${metodeNama} sedang diproses!`);
  }

  goBack() {
    this.location.back();
  }
}