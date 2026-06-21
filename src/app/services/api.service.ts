import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  formatImageUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    
    // Cloudinary URL
    if (url.includes('cloudinary.com') || url.includes('res.cloudinary.com')) {
      return url;
    }
    
    // Local storage path resolving against actual backend host
    if (url.includes('/storage/')) {
      const parts = url.split('/storage/');
      const storagePath = '/storage/' + parts[parts.length - 1];
      const baseUrl = this.apiUrl.replace('/api', '');
      return `${baseUrl}${storagePath}`;
    }
    
    // Relative path resolving
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      const baseUrl = this.apiUrl.replace('/api', '');
      return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    
    return url;
  }

  async logoutGoogle(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await GoogleAuth.signOut();
      } catch (err) {
        console.error('Error signing out from Capacitor Google Auth:', err);
      }
    } else {
      try {
        if (typeof google !== 'undefined' && google.accounts?.id) {
          google.accounts.id.disableAutoSelect();
        }
      } catch (err) {
        console.error('Error disabling auto-select on Google Identity Services:', err);
      }
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  private getFormHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
      // No Content-Type — browser sets multipart/form-data with boundary automatically
    });
  }

  // ===== AUTH =====
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }, {
      headers: new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
    });
  }

  register(name: string, email: string, phone: string, password: string, password_confirmation: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { name, email, phone, password, password_confirmation }, {
      headers: new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
    });
  }

  googleLogin(email: string, name: string, googleIdToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/google-login`, { email, name, google_id_token: googleIdToken }, {
      headers: new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers: this.getHeaders() });
  }

  getUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, { headers: this.getHeaders() });
  }

  updateProfile(data: { name: string; email: string; phone?: string; password?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile`, data, { headers: this.getHeaders() });
  }

  updateProfilePhoto(base64DataUri: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile/photo`, { photo: base64DataUri }, { headers: this.getHeaders() });
  }

  updateForgotPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password/reset`, { email, password: newPassword }, {
      headers: new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
    });
  }

  connectGoogle(googleIdToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile/connect-google`, { google_id_token: googleIdToken }, {
      headers: this.getHeaders()
    });
  }


  // ===== UNITS =====
  getUnits(): Observable<any> {
    return this.http.get(`${this.apiUrl}/units`, { headers: this.getHeaders() });
  }

  getUnitDetail(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/units/${id}`, { headers: this.getHeaders() });
  }

  // ===== BOOKINGS =====
  getBookings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/bookings`, { headers: this.getHeaders() });
  }

  createBooking(
    unitId: number, 
    startDate: string, 
    endDate: string, 
    paymentType: string,
    durationMonths: number,
    dpAmount: number,
    dueDay: number | null,
    ktpFile?: File
  ): Observable<any> {
    const formData = new FormData();
    formData.append('unit_id', unitId.toString());
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('payment_type', paymentType);
    formData.append('duration_months', durationMonths.toString());
    formData.append('dp_amount', dpAmount.toString());
    if (dueDay !== null && dueDay !== undefined) {
      formData.append('due_day', dueDay.toString());
    }
    if (ktpFile) {
      formData.append('ktp', ktpFile, ktpFile.name);
    }
    return this.http.post(`${this.apiUrl}/bookings`, formData, { headers: this.getFormHeaders() });
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bookings/${bookingId}`, { headers: this.getHeaders() });
  }

  syncCalendar(bookingId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings/${bookingId}/sync`, {}, { headers: this.getHeaders() });
  }

  // ===== BILLINGS & PAYMENT =====
  getBillings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/billings`, { headers: this.getHeaders() });
  }

  payBilling(billingId: number, type: string = 'full'): Observable<any> {
    return this.http.post(`${this.apiUrl}/billings/${billingId}/pay`, { type }, { headers: this.getHeaders() });
  }

  downloadReceipt(billingId: number): Observable<Blob> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/billings/${billingId}/receipt`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  // ===== COMPLAINTS =====
  getComplaints(): Observable<any> {
    return this.http.get(`${this.apiUrl}/complaints`, { headers: this.getHeaders() });
  }

  createComplaint(unitId: number, description: string, imageFile?: File): Observable<any> {
    if (imageFile) {
      const formData = new FormData();
      formData.append('unit_id', unitId.toString());
      formData.append('description', description);
      formData.append('image', imageFile, imageFile.name);
      return this.http.post(`${this.apiUrl}/complaints`, formData, { headers: this.getFormHeaders() });
    }
    return this.http.post(`${this.apiUrl}/complaints`, { unit_id: unitId, description }, { headers: this.getHeaders() });
  }

  // ===== MAINTENANCES =====
  getMaintenances(): Observable<any> {
    return this.http.get(`${this.apiUrl}/maintenances`, { headers: this.getHeaders() });
  }

  createMaintenance(unitId: number, description: string, imageFile?: File): Observable<any> {
    if (imageFile) {
      const formData = new FormData();
      formData.append('unit_id', unitId.toString());
      formData.append('description', description);
      formData.append('image', imageFile, imageFile.name);
      return this.http.post(`${this.apiUrl}/maintenances`, formData, { headers: this.getFormHeaders() });
    }
    return this.http.post(`${this.apiUrl}/maintenances`, { unit_id: unitId, description }, { headers: this.getHeaders() });
  }

  // ===== FACILITIES =====
  getFacilities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/facilities`, { headers: this.getHeaders() });
  }

  bookFacility(facilityId: number, data: {
    booking_date: string;
    start_time: string;
    end_time: string;
    guest_count: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/facilities/${facilityId}/book`, data, { headers: this.getHeaders() });
  }

  getFacilityBookings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/facility-bookings`, { headers: this.getHeaders() });
  }

  cancelFacilityBooking(bookingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/facility-bookings/${bookingId}`, { headers: this.getHeaders() });
  }

  // ===== ANNOUNCEMENTS =====
  getAnnouncements(): Observable<any> {
    return this.http.get(`${this.apiUrl}/announcements`, { headers: this.getHeaders() });
  }

  // ===== HISTORY =====
  getHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/history`, { headers: this.getHeaders() });
  }

  // ===== NOTIFICATIONS =====
  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  markNotificationRead(notificationId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/${notificationId}/read`, {}, { headers: this.getHeaders() });
  }
}
