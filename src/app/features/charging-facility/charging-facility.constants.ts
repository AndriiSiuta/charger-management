export interface ChargerLinks {
  id: number;
  name: string;
  value: string;
  routerLink: string;
  icon: string;
}

export const CHARGER_LINKS: ChargerLinks[] = [
  {id: 1, name: 'Chargers', value: 'chargers', routerLink: 'chargers', icon: 'pi pi-bolt'},
  {id: 2, name: 'EV List', value: 'ev', routerLink: 'ev-table', icon: 'pi pi-car'},
  {id: 3, name: 'Status', value: 'status', routerLink: 'status', icon: 'pi pi-chart-line'},
];


