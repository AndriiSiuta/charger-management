import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginManagement } from './plugin-management';

describe('PluginManagement', () => {
  let component: PluginManagement;
  let fixture: ComponentFixture<PluginManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PluginManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PluginManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
