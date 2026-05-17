import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RequestMaintenancePage } from './request-maintenance.page';

describe('RequestMaintenancePage', () => {
  let component: RequestMaintenancePage;
  let fixture: ComponentFixture<RequestMaintenancePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestMaintenancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
