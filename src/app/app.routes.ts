import { Routes } from '@angular/router';
import { chargingFacilityRoutes } from './features/charging-facility/charging-facility.routes';

export const routes: Routes = [{
  path: '',
  redirectTo: 'charging-facility',
  pathMatch: 'full'
}, {
  path: 'charging-facility',
  loadComponent: () => import('./features/charging-facility/charging-facility').then(m => m.ChargingFacility),
  children: [{
    path: '',
    pathMatch: 'full',
    redirectTo: 'chargers'
  }, ...chargingFacilityRoutes]
}];
