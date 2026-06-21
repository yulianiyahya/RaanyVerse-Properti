import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private onlineStatus$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.updateStatus(true));
    window.addEventListener('offline', () => this.updateStatus(false));
  }

  private updateStatus(isOnline: boolean) {
    this.onlineStatus$.next(isOnline);
  }

  getOnlineStatus(): Observable<boolean> {
    return this.onlineStatus$.asObservable();
  }

  isCurrentlyOnline(): boolean {
    return this.onlineStatus$.value;
  }
}
