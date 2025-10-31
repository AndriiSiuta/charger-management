import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvTable } from './ev';

describe('EvTable', () => {
  let component: EvTable;
  let fixture: ComponentFixture<EvTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
