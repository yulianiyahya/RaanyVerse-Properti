import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'welcome',
    loadComponent: () => import('./welcome/welcome.page').then(m => m.WelcomePage)
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./privacy-policy/privacy-policy.page').then(m => m.PrivacyPolicyPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then(m => m.RegisterPage),
    canActivate: [guestGuard]
  },
  {
    path: 'beranda-tenant',
    loadComponent: () => import('./beranda-tenant/beranda-tenant.page').then(m => m.BerandaTenantPage),
    canActivate: [authGuard]
  },
  {
    path: 'profil',
    loadComponent: () => import('./profil/profil.page').then(m => m.ProfilPage),
    canActivate: [authGuard]
  },
  {
    path: 'unit',
    loadComponent: () => import('./unit/unit.page').then(m => m.UnitPage),
    canActivate: [authGuard]
  },
  {
    path: 'detail-unit',
    loadComponent: () => import('./detail-unit/detail-unit.page').then(m => m.DetailUnitPage),
    canActivate: [authGuard]
  },
  {
    path: 'form-pemesanan',
    loadComponent: () => import('./form-pemesanan/form-pemesanan.page').then(m => m.FormPemesananPage),
    canActivate: [authGuard]
  },
  {
    path: 'pesanan',
    loadComponent: () => import('./pesanan/pesanan.page').then(m => m.PesananPage),
    canActivate: [authGuard]
  },
  {
    path: 'pay-bill',
    loadComponent: () => import('./pay-bill/pay-bill.page').then(m => m.PayBillPage),
    canActivate: [authGuard]
  },
  {
    path: 'submit-complaint',
    loadComponent: () => import('./submit-complaint/submit-complaint.page').then(m => m.SubmitComplaintPage),
    canActivate: [authGuard]
  },
  {
    path: 'request-maintenance',
    loadComponent: () => import('./request-maintenance/request-maintenance.page').then(m => m.RequestMaintenancePage),
    canActivate: [authGuard]
  },
  {
    path: 'fasilitas',
    loadComponent: () => import('./fasilitas/fasilitas.page').then(m => m.FasilitasPage),
    canActivate: [authGuard]
  },
  {
    path: 'pengumuman',
    loadComponent: () => import('./pengumuman/pengumuman.page').then(m => m.PengumumanPage),
    canActivate: [authGuard]
  },
  {
    path: 'notifikasi',
    loadComponent: () => import('./notifikasi/notifikasi.page').then(m => m.NotifikasiPage),
    canActivate: [authGuard]
  },
  {
    path: 'history',
    loadComponent: () => import('./history/history.page').then(m => m.HistoryPage),
    canActivate: [authGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage),
    canActivate: [guestGuard]
  },
  {
    path: 'verify-otp',
    loadComponent: () => import('./verify-otp/verify-otp.page').then(m => m.VerifyOtpPage),
    canActivate: [guestGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password/reset-password.page').then(m => m.ResetPasswordPage),
    canActivate: [guestGuard]
  },
];
