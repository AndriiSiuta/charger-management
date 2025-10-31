import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { EV } from '../ev-table/ev.types';
import { Charger } from '../charger-table/charger.types';
import { PluginManager, PluginStatus } from './plugin-management.types';
import { ChargerService } from '../charger-table/charger.service';
import { EvService } from '../ev-table/ev.service';
import { catchError, forkJoin, map, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class PluginStateService {
  private readonly chargerService = inject(ChargerService);
  private readonly evService = inject(EvService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly _chargers = signal<Charger[]>([]);
  private readonly _evs = signal<EV[]>([]);
  private readonly _connections = signal<Map<number, number>>(new Map());
  readonly pluginManagers = computed(() => {
    const chargers = this._chargers();
    const evs = this._evs();
    const connections = this._connections();

    return chargers.map(charger => {
      const connectedEvId = connections.get(charger.id);
      const connectedEv = connectedEvId ? evs.find(ev => ev.id === connectedEvId) : null;

      return {
        ev: connectedEv ? {id: connectedEv.id, name: connectedEv.name} : null,
        charger: {id: charger.id, name: charger.name},
        status: connectedEv ? 'in' as PluginStatus : 'out' as PluginStatus
      } satisfies PluginManager;
    });
  });
  readonly availableEvs = computed(() => {
    const evs = this._evs();
    const connections = this._connections();
    const connectedEvIds = new Set(connections.values());

    return evs.filter(ev => !connectedEvIds.has(ev.id));
  });
  private readonly _loading = signal<boolean>(false);
  readonly loading = computed(() => this._loading());
  private readonly _error = signal<string | null>(null);
  readonly error = computed(() => this._error());

  constructor() {
    this.initializeData();
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  connectDevice(chargerId: number, evId: number): boolean {
    const connections = new Map(this._connections());

    if (connections.has(chargerId)) {
      this.setError(`Charger ${chargerId} is already occupied`);
      return false;
    }

    if (Array.from(connections.values()).includes(evId)) {
      this.setError(`EV ${evId} is already connected`);
      return false;
    }

    connections.set(chargerId, evId);
    this._connections.set(connections);
    this.setError(null);
    return true;
  }

  disconnectDevice(chargerId: number): boolean {
    const connections = new Map(this._connections());

    if (!connections.has(chargerId)) {
      this.setError(`No device connected to charger ${chargerId}`);
      return false;
    }

    connections.delete(chargerId);
    this._connections.set(connections);
    this.setError(null);
    return true;
  }

  clearAllConnections(): void {
    this._connections.set(new Map());
  }

  private initializeData(): void {
    this._loading.set(true);

    forkJoin({
      chargers: this.chargerService.getChargers(),
      evs: this.evService.getEVs()
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      map(({chargers, evs}) => {
        this._chargers.set(chargers);
        this._evs.set(evs);

        this.initializeConnections(evs);

        this._loading.set(false);
      }),
      catchError((err) => {
        this._error.set('Failed to load data');
        this._loading.set(false);
        return of(err);
      })
    ).subscribe();
  }

  private initializeConnections(evs: EV[]): void {
    const initialConnections = new Map<number, number>();

    evs.forEach(ev => {
      if (ev.chargerId) {
        initialConnections.set(ev.chargerId, ev.id);
      }
    });

    this._connections.set(initialConnections);

    initialConnections.forEach((evId, chargerId) => {
      const ev = evs.find(e => e.id === evId);
    });
  }
}
