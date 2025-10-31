import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Charger } from './charger';

describe('Charger', () => {
  let component: Charger;
  let fixture: ComponentFixture<Charger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Charger]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Charger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
