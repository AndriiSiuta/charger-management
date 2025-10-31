import { TestBed } from '@angular/core/testing';
import { ChargerService } from './charger.service';
import { Charger } from './charger.types';
import { MOCK_CHARGERS } from './charger.const';
import { firstValueFrom } from 'rxjs';

describe('ChargerService', () => {
  let service: ChargerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChargerService]
    });
    service = TestBed.inject(ChargerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getChargers', () => {
    it('should return an Observable of chargers', () => {
      const chargers$ = service.getChargers();
      expect(chargers$).toBeTruthy();
    });

    it('should return the mock chargers data', async () => {
      const chargers = await firstValueFrom(service.getChargers());
      expect(chargers).toEqual(MOCK_CHARGERS);
      expect(chargers.length).toBe(2);
    });

    it('should return chargers with correct structure', async () => {
      const chargers = await firstValueFrom(service.getChargers());
      
      chargers.forEach((charger: Charger) => {
        expect(charger.id).toBeDefined();
        expect(charger.name).toBeDefined();
        expect(charger.maxChargerRate).toBeDefined();
        expect(typeof charger.id).toBe('number');
        expect(typeof charger.name).toBe('string');
        expect(typeof charger.maxChargerRate).toBe('number');
      });
    });

    it('should return specific charger data', async () => {
      const chargers = await firstValueFrom(service.getChargers());
      
      expect(chargers[0]).toEqual({
        id: 1,
        name: 'Heliox-C1',
        maxChargerRate: 50
      });
      
      expect(chargers[1]).toEqual({
        id: 2,
        name: 'Heliox-C2',
        maxChargerRate: 100
      });
    });

    it('should emit data after delay', (done) => {
      const startTime = Date.now();
      
      service.getChargers().subscribe({
        next: (chargers) => {
          const elapsedTime = Date.now() - startTime;
          expect(elapsedTime).toBeGreaterThanOrEqual(450); // Account for timing variance
          expect(chargers).toEqual(MOCK_CHARGERS);
          done();
        }
      });
    });

    it('should return consistent data', async () => {
      const chargers1 = await firstValueFrom(service.getChargers());
      const chargers2 = await firstValueFrom(service.getChargers());
      
      expect(chargers1).toEqual(chargers2);
      expect(chargers1).toEqual(MOCK_CHARGERS);
    });

    it('should handle multiple subscribers', async () => {
      const subscription1 = service.getChargers();
      const subscription2 = service.getChargers();
      
      const [result1, result2] = await Promise.all([
        firstValueFrom(subscription1),
        firstValueFrom(subscription2)
      ]);
      
      expect(result1).toEqual(MOCK_CHARGERS);
      expect(result2).toEqual(MOCK_CHARGERS);
      expect(result1).toEqual(result2);
    });

    it('should validate charger rate constraints', async () => {
      const chargers = await firstValueFrom(service.getChargers());
      
      chargers.forEach(charger => {
        expect(charger.maxChargerRate).toBeGreaterThan(0);
        expect(charger.maxChargerRate).toBeLessThanOrEqual(1000); // Reasonable max
      });
    });
  });
});