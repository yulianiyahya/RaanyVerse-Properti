import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormPemesananPage } from './form-pemesanan.page';

describe('FormPemesananPage', () => {
  let component: FormPemesananPage;
  let fixture: ComponentFixture<FormPemesananPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FormPemesananPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
