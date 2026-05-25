import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { App } from '@capacitor/app';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

// Halaman root — jika di sini dan back ditekan, keluar app
const ROOT_ROUTES = ['/beranda-tenant', '/login', '/register', '/'];

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  private backButtonListener: any;

  constructor(private location: Location, private router: Router) {}

  ngOnInit() {
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
  }
}

