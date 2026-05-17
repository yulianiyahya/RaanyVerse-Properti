import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BerandaTenantPage } from './beranda-tenant.page';

describe('BerandaTenantPage', () => {
  let component: BerandaTenantPage;
  let fixture: ComponentFixture<BerandaTenantPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BerandaTenantPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
