import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PayBillPage } from './pay-bill.page';

describe('PayBillPage', () => {
  let component: PayBillPage;
  let fixture: ComponentFixture<PayBillPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PayBillPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
