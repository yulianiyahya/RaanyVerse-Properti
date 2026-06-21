import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../services/api.service';

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

  isLoading: boolean = false;

  constructor(private location: Location, private api: ApiService) { }

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
            const fine = b.fine_amount || 0;
            const periodLabel = fine > 0 ? `${b.period} (Termasuk Denda: Rp ${fine.toLocaleString('id-ID')})` : b.period;
            return {
              id: b.id,
              nama: b.unit?.name || 'Sewa Unit',
              periode: periodLabel,
              nominal: (b.amount || 0) + fine,
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

    const nama = localStorage.getItem('namaUser') || 'Penyewa';
    const email = localStorage.getItem('emailUser') || '';

    let metodeNama = 'Transfer Bank';
    if (this.metodeTerpilih === 'ewallet') metodeNama = 'E-Wallet';
    else if (this.metodeTerpilih === 'tunai') metodeNama = 'Tunai / Cash';

    const phone = '6289601784887'; // Admin WhatsApp phone number
    const text = `Halo Admin RaanyVerse Properti,\n\nSaya ingin melakukan konfirmasi pembayaran tagihan dengan detail berikut:\n\n- *Nama*: ${nama}\n- *Email*: ${email}\n- *Unit*: ${unpaidBill.nama}\n- *Periode*: ${unpaidBill.periode}\n- *Nominal*: Rp ${unpaidBill.nominal.toLocaleString('id-ID')}\n- *Metode Pembayaran*: ${metodeNama}\n\nMohon bantuannya untuk memproses dan melakukan verifikasi. Terima kasih!`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_system');
  }

  salinTeks(teks: string) {
    navigator.clipboard.writeText(teks).then(() => {
      alert('Nomor rekening/e-wallet berhasil disalin!');
    }).catch(err => {
      console.error('Gagal menyalin teks:', err);
    });
  }

  downloadKuitansi(item: any) {
    if (this.isLoading) return;
    if (item.rawStatus !== 'paid') return;
    this.isLoading = true;
    this.api.downloadReceipt(item.id).subscribe({
      next: (blob: Blob) => {
        this.isLoading = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kuitansi-${item.nama.replace(/\s+/g, '-')}-${item.periode.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Gagal mengunduh kuitansi:', err);
        alert('Gagal mengunduh kuitansi pembayaran. Silakan hubungi admin.');
      }
    });
  }

  goBack() {
    this.location.back();
  }
}