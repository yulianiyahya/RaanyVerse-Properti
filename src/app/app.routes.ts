import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'beranda-tenant',
    loadComponent: () => import('./beranda-tenant/beranda-tenant.page').then( m => m.BerandaTenantPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'profil',
    loadComponent: () => import('./profil/profil.page').then( m => m.ProfilPage)
  },
  {
    path: 'pay-bill',
    loadComponent: () => import('./pay-bill/pay-bill.page').then( m => m.PayBillPage)
  },
  {
    path: 'notifikasi',
    loadComponent: () => import('./notifikasi/notifikasi.page').then( m => m.NotifikasiPage)
  },
  {
    path: 'submit-complaint',
    loadComponent: () => import('./submit-complaint/submit-complaint.page').then( m => m.SubmitComplaintPage)
  },
  {
    path: 'request-maintenance',
    loadComponent: () => import('./request-maintenance/request-maintenance.page').then( m => m.RequestMaintenancePage)
  },
  {
    path: 'history',
    loadComponent: () => import('./history/history.page').then( m => m.HistoryPage)
  },
  {
    path: 'unit',
    loadComponent: () => import('./unit/unit.page').then( m => m.UnitPage)
  },
  {
    path: 'detail-unit',
    loadComponent: () => import('./detail-unit/detail-unit.page').then( m => m.DetailUnitPage)
  },
  {
    path: 'pesanan',
    loadComponent: () => import('./pesanan/pesanan.page').then( m => m.PesananPage)
  },
  {
    path: 'form-pemesanan',
    loadComponent: () => import('./form-pemesanan/form-pemesanan.page').then( m => m.FormPemesananPage)
  },
];