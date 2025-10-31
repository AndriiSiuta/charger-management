import { Component, inject, signal } from '@angular/core';
import { PluginStateService } from './plugin-state.service';
import { ChargerService } from '../charger-table/charger.service';
import { EvService } from '../ev-table/ev.service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { Button, ButtonSeverity } from 'primeng/button';
import { PluginManager, PluginStatus } from './plugin-management.types';
import { PluginModal } from './plugin-modal/plugin-modal';
import { EV } from '../ev-table/ev.types';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Message } from 'primeng/message';

@Component({
  selector: 'ev-status-table',
  imports: [
    ProgressSpinner,
    TableModule,
    Button,
    PluginModal,
    Toast,
    Message
  ],
  templateUrl: './plugin-management.html',
  styleUrl: './plugin-management.scss',
  standalone: true,
  providers: [PluginStateService, ChargerService, EvService, MessageService]
})
export class PluginManagement {
  private readonly stateService = inject(PluginStateService);
  private readonly messageService = inject(MessageService);

  visibility = false;
  readonly selectedDevice = signal<PluginManager | null>(null);
  readonly operationInProgress = signal<boolean>(false);

  readonly pluginManagers = this.stateService.pluginManagers;
  readonly availableEvs = this.stateService.availableEvs;
  readonly loading = this.stateService.loading;
  readonly error = this.stateService.error;

  readonly tableColumns = ['EV ID', 'EV Name', 'Battery Capacity', 'Charger ID', 'Plugin Status'];

  getEvStatus(status: PluginStatus): ButtonSeverity {
    return status === 'in' ? 'danger' : 'success';
  }

  getPluginLabel(status: PluginStatus): string {
    return status === 'in' ? 'Plug Out' : 'Plug In';
  }

  togglePlugin(device: PluginManager): void {
    if (this.operationInProgress()) {
      return;
    }

    this.selectedDevice.set(device);

    if (device.status === 'out') {
      this.visibility = true;
    } else {
      this.handleDisconnection(device);
    }
  }

  handleConnection(ev: EV): void {
    const device = this.selectedDevice();
    if (!device) {
      this.showError('No device selected');
      return;
    }

    this.operationInProgress.set(true);
    this.visibility = false;

    const success = this.stateService.connectDevice(device.charger.id, ev.id);

    if (success) {
      this.showSuccess(`Successfully connected ${ev.name} to ${device.charger.name}`);
      this.selectedDevice.set(null);
    } else {
      const error = this.stateService.error();
      this.showError(error || 'Failed to connect device');
    }

    this.operationInProgress.set(false);
  }

  private handleDisconnection(device: PluginManager): void {
    if (!device.ev) {
      this.showError('No EV connected to disconnect');
      return;
    }

    this.operationInProgress.set(true);

    const success = this.stateService.disconnectDevice(device.charger.id);

    if (success) {
      this.showSuccess(`Successfully disconnected ${device.ev.name} from ${device.charger.name}`);
    } else {
      const error = this.stateService.error();
      this.showError(error || 'Failed to disconnect device');
    }

    this.operationInProgress.set(false);
  }

  closeModal(): void {
    this.visibility = false;
    this.selectedDevice.set(null);
  }

  clearError(): void {
    this.stateService.setError(null);
  }

  clearAllConnections(): void {
    this.stateService.clearAllConnections();
    this.showSuccess('All connections cleared');
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 1000
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 1000
    });
  }
}
