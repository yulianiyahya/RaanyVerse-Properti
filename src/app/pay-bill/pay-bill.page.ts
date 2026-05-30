import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-pay-bill',
  templateUrl: './pay-bill.page.html',
  styleUrls: ['./pay-bill.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule],
  providers: [ApiService],
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

  isLoading: boolean = false;

  constructor(private location: Location, private api: ApiService) {}

  ngOnInit() {
    this.loadBillings();
  }

  loadBillings() {
    this.api.getBillings().subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          this.punyaUnit = true;
          this.rincianTagihan = res.map((b: any) => {
            const statusLabel = b.status === 'paid' ? 'LUNAS' : (b.status === 'pending' ? 'PENDING' : 'BELUM BAYAR');
            const statusClass = b.status === 'paid' ? 'lunas' : (b.status === 'pending' ? 'proses' : 'belum');
            return {
              id: b.id,
              nama: b.unit?.name || 'Sewa Unit',
              periode: b.period || 'Periode Berjalan',
              nominal: b.amount || 0,
              status: statusClass,
              statusLabel: statusLabel,
              rawStatus: b.status
            };
          });
          
          this.totalTagihan = this.rincianTagihan
            .filter((t: any) => t.rawStatus !== 'paid')
            .reduce((acc: number, t: any) => acc + t.nominal, 0);

          const firstUnpaid = res.find((b: any) => b.status !== 'paid');
          this.jatuhTempo = firstUnpaid?.due_date ? new Date(firstUnpaid.due_date).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
          }) : '-';
        } else {
          this.punyaUnit = false;
        }
      },
      error: (err) => {
        console.error('Gagal mengambil data tagihan:', err);
        this.punyaUnit = false;
      }
    });
  }

  bayar() {
    const unpaidBill = this.rincianTagihan.find((t: any) => t.rawStatus !== 'paid');
    if (!unpaidBill) {
      alert('Tidak ada tagihan yang belum dibayar.');
      return;
    }

    this.isLoading = true;
    this.api.payBilling(unpaidBill.id, 'full').subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success && res.payment_url) {
          window.open(res.payment_url, '_system');
        } else {
          alert(res.message || 'Gagal memproses pembayaran Duitku.');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Gagal generate payment gateway URL. Silakan coba lagi.';
        alert(msg);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}