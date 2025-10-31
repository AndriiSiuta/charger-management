import { Component, inject } from '@angular/core';
import { EvService } from './ev.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'ev-table',
  imports: [
    TableModule,
    ProgressSpinner
  ],
  templateUrl: './ev.html',
  styleUrl: './ev.scss',
  standalone: true,
  providers: [EvService]
})
export class EvTable {
  private readonly apiService = inject(EvService);

  readonly tableColumns = ['EV ID', 'EV NAME', 'Battery Capacity'];

  readonly evs = toSignal(this.apiService.getEVs());
}
