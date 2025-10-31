import { Routes } from '@angular/router';

export const chargingFacilityRoutes: Routes = [{
  path: 'chargers',
  loadComponent: () => import('./charger-table/charger').then((c) => c.Charger)
}, {
  path: 'ev-table',
  loadComponent: () => import('./ev-table/ev').then((c) => c.EvTable)
}, {
  path: 'status',
  loadComponent: () => import('./plugin-management/plugin-management').then((c) => c.PluginManagement)
}]
