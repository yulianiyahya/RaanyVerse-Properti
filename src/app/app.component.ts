import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { App } from '@capacitor/app';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { SplashScreen } from '@capacitor/splash-screen';
import { NgIf } from '@angular/common';
import { NetworkService } from './services/network.service';
import { Subscription } from 'rxjs';
// Halaman root — jika di sini dan back ditekan, keluar app
const ROOT_ROUTES = ['/beranda-tenant', '/login', '/register', '/'];

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet, NgIf],
})
export class AppComponent implements OnInit, OnDestroy {
  private backButtonListener: any;
  public isOnline: boolean = true;
  private networkSub?: Subscription;

  constructor(
    private location: Location, 
    private router: Router,
    private networkService: NetworkService
  ) {}

  ngOnInit() {
    this.networkSub = this.networkService.getOnlineStatus().subscribe(status => {
      this.isOnline = status;
    });
    // Hide the splash screen once the app is ready and loaded
    try {
      SplashScreen.hide();
    } catch (err) {
      console.warn('SplashScreen.hide error (likely running in web browser):', err);
    }

    this.backButtonListener = App.addListener('backButton', () => {
      const currentUrl = this.router.url;
      const isRoot = ROOT_ROUTES.some(r => currentUrl === r || currentUrl.startsWith(r + '?'));

      if (isRoot) {
        App.exitApp();
      } else {
        this.location.back();
      }
    });
  }

  ngOnDestroy() {
    this.backButtonListener?.remove();
    this.networkSub?.unsubscribe();
  }
}

