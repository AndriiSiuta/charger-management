import { TestBed } from '@angular/core/testing';
import { EvService } from './ev.service';
import { EV } from './ev.types';
import { MOCK_EVS } from './ev.const';
import { firstValueFrom } from 'rxjs';

describe('EvService', () => {
  let service: EvService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EvService]
    });
    service = TestBed.inject(EvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getEVs', () => {
    it('should return an Observable of EVs', () => {
      const evs$ = service.getEVs();
      expect(evs$).toBeTruthy();
    });

    it('should return the mock EVs data', async () => {
      const evs = await firstValueFrom(service.getEVs());
      expect(evs).toEqual(MOCK_EVS);
      expect(evs.length).toBe(2);
    });

    it('should return EVs with correct structure', async () => {
      const evs = await firstValueFrom(service.getEVs());
      
      evs.forEach((ev: EV) => {
        expect(ev.id).toBeDefined();
        expect(ev.name).toBeDefined();
        expect(ev.batteryCapacity).toBeDefined();
        expect(typeof ev.id).toBe('number');
        expect(typeof ev.name).toBe('string');
        expect(typeof ev.batteryCapacity).toBe('number');
        
        if (ev.chargerId) {
          expect(typeof ev.chargerId).toBe('number');
        }
      });
    });

    it('should return specific EV data', async () => {
      const evs = await firstValueFrom(service.getEVs());
      
      expect(evs[0]).toEqual({
        id: 1,
        name: 'VW-GOLF',
        batteryCapacity: 500
      });
      
      expect(evs[1]).toEqual({
        id: 2,
        name: 'VW-POLO',
        batteryCapacity: 1000,
        chargerId: 2
      });
    });

    it('should emit data after delay', (done) => {
      const startTime = Date.now();
      
      service.getEVs().subscribe({
        next: (evs) => {
          const elapsedTime = Date.now() - startTime;
          expect(elapsedTime).toBeGreaterThanOrEqual(450); // Account for timing variance
          expect(evs).toEqual(MOCK_EVS);
          done();
        }
      });
    });

    it('should handle EVs with and without charger connections', async () => {
      const evs = await firstValueFrom(service.getEVs());
      
      const connectedEv = evs.find(ev => ev.chargerId);
      const unconnectedEv = evs.find(ev => !ev.chargerId);
      
      expect(connectedEv).toBeTruthy();
      expect(unconnectedEv).toBeTruthy();
      expect(connectedEv!.chargerId).toBe(2);
      expect(unconnectedEv!.chargerId).toBeUndefined();
    });

    it('should return consistent data', async () => {
      const evs1 = await firstValueFrom(service.getEVs());
      const evs2 = await firstValueFrom(service.getEVs());
      
      expect(evs1).toEqual(evs2);
      expect(evs1).toEqual(MOCK_EVS);
    });

    it('should validate battery capacity constraints', async () => {
      const evs = await firstValueFrom(service.getEVs());
      
      evs.forEach(ev => {
        expect(ev.batteryCapacity).toBeGreaterThan(0);
        expect(ev.batteryCapacity).toBeLessThanOrEqual(2000); // Reasonable max
      });
    });

    it('should handle multiple subscribers correctly', async () => {
      const subscription1 = service.getEVs();
      const subscription2 = service.getEVs();
      
      const [result1, result2] = await Promise.all([
        firstValueFrom(subscription1),
        firstValueFrom(subscription2)
      ]);
      
      expect(result1).toEqual(MOCK_EVS);
      expect(result2).toEqual(MOCK_EVS);
      expect(result1).toEqual(result2);
    });

    it('should maintain data consistency across calls', async () => {
      const calls = Array(5).fill(null).map(() => firstValueFrom(service.getEVs()));
      const results = await Promise.all(calls);
      
      results.forEach(result => {
        expect(result).toEqual(MOCK_EVS);
      });
    });
  });
});