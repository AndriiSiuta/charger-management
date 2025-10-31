import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { PluginModal } from './plugin-modal';

describe('PluginModal', () => {
  let component: PluginModal;
  let fixture: ComponentFixture<PluginModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PluginModal],
      providers: [provideNoopAnimations()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PluginModal);
    component = fixture.componentInstance;
    
    // Set required input
    fixture.componentRef.setInput('availableEvs', []);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
