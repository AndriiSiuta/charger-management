import { Component, inject } from '@angular/core';
import { ChargerService } from './charger.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'ev-charger',
  imports: [
    TableModule,
    ProgressSpinner
  ],
  templateUrl: './charger.html',
  styleUrl: './charger.scss',
  standalone: true,
  providers: [ChargerService]
})
export class Charger {
  private readonly apiService = inject(ChargerService);
  readonly tableColumns = ['Charger ID', 'Charger Name', 'Max Charger Rate'];

  readonly chargers = toSignal(this.apiService.getChargers());
}
