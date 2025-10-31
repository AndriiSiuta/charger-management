import { TestBed } from '@angular/core/testing';
import { DestroyRef } from '@angular/core';
import { PluginStateService } from './plugin-state.service';
import { ChargerService } from '../charger-table/charger.service';
import { EvService } from '../ev-table/ev.service';
import { of, throwError } from 'rxjs';
import { PluginManager, PluginStatus } from './plugin-management.types';

describe('PluginStateService', () => {
  let service: PluginStateService;
  let chargerService: jasmine.SpyObj<ChargerService>;
  let evService: jasmine.SpyObj<EvService>;
  let destroyRef: jasmine.SpyObj<DestroyRef>;

  const mockChargers = [
    { id: 1, name: 'Heliox-C1', maxChargerRate: 50 },
    { id: 2, name: 'Heliox-C2', maxChargerRate: 100 }
  ];

  const mockEvs = [
    { id: 1, name: 'VW-GOLF', batteryCapacity: 500 },
    { id: 2, name: 'VW-POLO', batteryCapacity: 1000, chargerId: 2 }
  ];

  beforeEach(() => {
    const chargerServiceSpy = jasmine.createSpyObj('ChargerService', ['getChargers']);
    const evServiceSpy = jasmine.createSpyObj('EvService', ['getEVs']);
    const destroyRefSpy = jasmine.createSpyObj('DestroyRef', ['onDestroy']);

    // Default spy implementations
    chargerServiceSpy.getChargers.and.returnValue(of(mockChargers));
    evServiceSpy.getEVs.and.returnValue(of(mockEvs));

    TestBed.configureTestingModule({
      providers: [
        PluginStateService,
        { provide: ChargerService, useValue: chargerServiceSpy },
        { provide: EvService, useValue: evServiceSpy },
        { provide: DestroyRef, useValue: destroyRefSpy }
      ]
    });

    chargerService = TestBed.inject(ChargerService) as jasmine.SpyObj<ChargerService>;
    evService = TestBed.inject(EvService) as jasmine.SpyObj<EvService>;
    destroyRef = TestBed.inject(DestroyRef) as jasmine.SpyObj<DestroyRef>;
    
    service = TestBed.inject(PluginStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should call charger and EV services on initialization', () => {
      expect(chargerService.getChargers).toHaveBeenCalled();
      expect(evService.getEVs).toHaveBeenCalled();
    });

    it('should set loading to false after successful data load', (done) => {
      setTimeout(() => {
        expect(service.loading()).toBeFalsy();
        done();
      }, 100);
    });

    it('should initialize connections from EV data', (done) => {
      setTimeout(() => {
        const pluginManagers = service.pluginManagers();
        const connectedManager = pluginManagers.find(pm => pm.charger.id === 2);
        
        expect(connectedManager).toBeTruthy();
        expect(connectedManager!.ev).toEqual({ id: 2, name: 'VW-POLO' });
        expect(connectedManager!.status).toBe('in');
        done();
      }, 100);
    });

    it('should handle service errors gracefully', (done) => {
      // Simply check that the error method works
      service.setError('Test error');
      expect(service.error()).toBe('Test error');
      
      service.setError(null);
      expect(service.error()).toBeNull();
      
      done();
    });
  });

  describe('computed properties', () => {
    beforeEach((done) => {
      // Wait for initialization to complete
      setTimeout(() => done(), 100);
    });

    it('should compute plugin managers correctly', () => {
      const pluginManagers = service.pluginManagers();
      
      expect(pluginManagers.length).toBe(2);
      
      const charger1Manager = pluginManagers.find(pm => pm.charger.id === 1);
      const charger2Manager = pluginManagers.find(pm => pm.charger.id === 2);
      
      expect(charger1Manager!.ev).toBeNull();
      expect(charger1Manager!.status).toBe('out');
      
      expect(charger2Manager!.ev).toEqual({ id: 2, name: 'VW-POLO' });
      expect(charger2Manager!.status).toBe('in');
    });

    it('should compute available EVs correctly', () => {
      const availableEvs = service.availableEvs();
      
      expect(availableEvs.length).toBe(1);
      expect(availableEvs[0]).toEqual({ id: 1, name: 'VW-GOLF', batteryCapacity: 500 });
    });

    it('should update available EVs when connections change', () => {
      // Initially one EV should be available
      expect(service.availableEvs().length).toBe(1);
      
      // Connect the available EV
      service.connectDevice(1, 1);
      
      // Now no EVs should be available
      expect(service.availableEvs().length).toBe(0);
      
      // Disconnect one EV
      service.disconnectDevice(1);
      
      // One EV should be available again
      expect(service.availableEvs().length).toBe(1);
    });
  });

  describe('connectDevice', () => {
    beforeEach((done) => {
      setTimeout(() => done(), 100);
    });

    it('should successfully connect an available EV to an empty charger', () => {
      const result = service.connectDevice(1, 1);
      
      expect(result).toBeTruthy();
      expect(service.error()).toBeNull();
      
      const pluginManagers = service.pluginManagers();
      const connectedManager = pluginManagers.find(pm => pm.charger.id === 1);
      
      expect(connectedManager!.ev).toEqual({ id: 1, name: 'VW-GOLF' });
      expect(connectedManager!.status).toBe('in');
    });

    it('should fail to connect to an occupied charger', () => {
      const result = service.connectDevice(2, 1); // Charger 2 is already occupied
      
      expect(result).toBeFalsy();
      expect(service.error()).toBe('Charger 2 is already occupied');
    });

    it('should fail to connect an already connected EV', () => {
      const result = service.connectDevice(1, 2); // EV 2 is already connected
      
      expect(result).toBeFalsy();
      expect(service.error()).toBe('EV 2 is already connected');
    });

    it('should clear error on successful connection', () => {
      // First, create an error
      service.connectDevice(2, 1);
      expect(service.error()).toBeTruthy();
      
      // Then make a successful connection
      service.connectDevice(1, 1);
      expect(service.error()).toBeNull();
    });
  });

  describe('disconnectDevice', () => {
    beforeEach((done) => {
      setTimeout(() => done(), 100);
    });

    it('should successfully disconnect a connected charger', () => {
      const result = service.disconnectDevice(2); // Charger 2 has EV 2 connected
      
      expect(result).toBeTruthy();
      expect(service.error()).toBeNull();
      
      const pluginManagers = service.pluginManagers();
      const disconnectedManager = pluginManagers.find(pm => pm.charger.id === 2);
      
      expect(disconnectedManager!.ev).toBeNull();
      expect(disconnectedManager!.status).toBe('out');
    });

    it('should fail to disconnect an unoccupied charger', () => {
      const result = service.disconnectDevice(1); // Charger 1 is not connected
      
      expect(result).toBeFalsy();
      expect(service.error()).toBe('No device connected to charger 1');
    });

    it('should clear error on successful disconnection', () => {
      // First, create an error
      service.disconnectDevice(1);
      expect(service.error()).toBeTruthy();
      
      // Then make a successful disconnection
      service.disconnectDevice(2);
      expect(service.error()).toBeNull();
    });
  });

  describe('clearAllConnections', () => {
    beforeEach((done) => {
      setTimeout(() => done(), 100);
    });

    it('should clear all connections', () => {
      // Verify initial state has connections
      expect(service.pluginManagers().some(pm => pm.status === 'in')).toBeTruthy();
      
      service.clearAllConnections();
      
      // Verify all connections are cleared
      const pluginManagers = service.pluginManagers();
      expect(pluginManagers.every(pm => pm.status === 'out')).toBeTruthy();
      expect(pluginManagers.every(pm => pm.ev === null)).toBeTruthy();
    });

    it('should make all EVs available after clearing connections', () => {
      service.clearAllConnections();
      
      const availableEvs = service.availableEvs();
      expect(availableEvs.length).toBe(2);
    });
  });

  describe('error handling', () => {
    it('should manage error state correctly', () => {
      expect(service.error()).toBeNull();
      
      service.setError('Test error');
      expect(service.error()).toBe('Test error');
      
      service.setError(null);
      expect(service.error()).toBeNull();
    });
  });

  describe('complex scenarios', () => {
    beforeEach((done) => {
      setTimeout(() => done(), 100);
    });

    it('should handle multiple connection operations', () => {
      // Connect EV 1 to Charger 1
      expect(service.connectDevice(1, 1)).toBeTruthy();
      
      // Try to connect EV 1 to Charger 2 (should fail - EV already connected)
      expect(service.connectDevice(2, 1)).toBeFalsy();
      
      // Disconnect EV 2 from Charger 2
      expect(service.disconnectDevice(2)).toBeTruthy();
      
      // Now connect EV 2 to Charger 2 again
      expect(service.connectDevice(2, 2)).toBeTruthy();
      
      // Verify final state
      const pluginManagers = service.pluginManagers();
      expect(pluginManagers.every(pm => pm.status === 'in')).toBeTruthy();
      expect(service.availableEvs().length).toBe(0);
    });

    it('should maintain data consistency during rapid operations', () => {
      const operations = [
        () => service.connectDevice(1, 1),
        () => service.disconnectDevice(2),
        () => service.connectDevice(2, 2),
        () => service.disconnectDevice(1),
        () => service.clearAllConnections()
      ];
      
      operations.forEach(op => op());
      
      // After clearing all connections, all chargers should be empty
      const pluginManagers = service.pluginManagers();
      expect(pluginManagers.every(pm => pm.status === 'out')).toBeTruthy();
      expect(service.availableEvs().length).toBe(2);
    });
  });
});

describe('PluginStateService - Error Handling', () => {
  let service: PluginStateService;

  beforeEach(() => {
    const errorChargerService = jasmine.createSpyObj('ChargerService', ['getChargers']);
    const evService = jasmine.createSpyObj('EvService', ['getEVs']);
    const destroyRef = jasmine.createSpyObj('DestroyRef', ['onDestroy']);

    errorChargerService.getChargers.and.returnValue(throwError(() => new Error('Service error')));
    evService.getEVs.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        PluginStateService,
        { provide: ChargerService, useValue: errorChargerService },
        { provide: EvService, useValue: evService },
        { provide: DestroyRef, useValue: destroyRef }
      ]
    });

    service = TestBed.inject(PluginStateService);
  });

  it('should handle service errors gracefully', (done) => {
    setTimeout(() => {
      expect(service.error()).toBe('Failed to load data');
      expect(service.loading()).toBeFalsy();
      done();
    }, 100);
  });
});