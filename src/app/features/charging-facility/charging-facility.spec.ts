import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ChargingFacility } from './charging-facility';

describe('ChargingFacility', () => {
  let component: ChargingFacility;
  let fixture: ComponentFixture<ChargingFacility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargingFacility, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChargingFacility);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
