import { Component, input, output, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { EV } from '../../ev-table/ev.types';
import { Charger } from '../../charger-table/charger.types';

@Component({
  selector: 'ev-plugin-modal',
  imports: [
    Dialog,
    Select,
    FormsModule,
    Button
  ],
  templateUrl: './plugin-modal.html',
  styleUrl: './plugin-modal.scss',
  standalone: true
})
export class PluginModal {
  availableEvs = input.required<EV[]>();
  selectedCharger = input<Pick<Charger, 'id' | 'name'> | null>(null);
  visible = true;

  connectedEv = output<EV>();
  modalClosed = output<void>();

  selectedEv = signal<EV | null>(null);

  onEvSelectionChange(ev: EV): void {
    this.selectedEv.set(ev);
  }

  connectEv(): void {
    const ev = this.selectedEv();
    if (ev) {
      this.connectedEv.emit(ev);
    }
  }

  close(): void {
    this.modalClosed.emit();
  }

  canConnect(): boolean {
    return !!this.selectedEv() && this.availableEvs().length > 0;
  }
}
