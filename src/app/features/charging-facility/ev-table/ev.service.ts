import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { EV } from './ev.types';
import { MOCK_EVS } from './ev.const';

@Injectable()
export class EvService {
  getEVs(): Observable<EV[]> {
    return of(MOCK_EVS).pipe(
      delay(500)
    )
  }
}
