import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailUnitPage } from './detail-unit.page';

describe('DetailUnitPage', () => {
  let component: DetailUnitPage;
  let fixture: ComponentFixture<DetailUnitPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailUnitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
