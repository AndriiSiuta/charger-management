import { Injectable } from '@angular/core';
import { Charger } from './charger.types';
import { delay, Observable, of } from 'rxjs';
import { MOCK_CHARGERS } from './charger.const';

@Injectable()
export class ChargerService {
  getChargers(): Observable<Charger[]> {
    return of(MOCK_CHARGERS).pipe(
      delay(500))
  }
}
