import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmitComplaintPage } from './submit-complaint.page';

describe('SubmitComplaintPage', () => {
  let component: SubmitComplaintPage;
  let fixture: ComponentFixture<SubmitComplaintPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitComplaintPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
