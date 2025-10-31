import { Component, effect, inject, signal } from '@angular/core';
import { Tab, TabList, TabPanel, Tabs } from 'primeng/tabs';
import { CHARGER_LINKS, ChargerLinks } from './charging-facility.constants';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'ev-charging-facility',
  imports: [
    Tabs,
    TabList,
    Tab,
    TabPanel,
    RouterOutlet,
  ],
  templateUrl: './charging-facility.html',
  styleUrl: './charging-facility.scss',
  standalone: true
})
export class ChargingFacility {
  readonly tabs = CHARGER_LINKS;
  readonly router = inject(Router);

  selectedTabValue = signal('chargers');

  constructor() {
    effect(() => {
      const router = this.router.url;

      const matchingTab = this.tabs.find((tab: ChargerLinks) => router.includes(tab.routerLink));

      if (matchingTab) {
        this.selectedTabValue.set(matchingTab.value);
      }
    });
  }

  navigate(link: ChargerLinks) {
    void this.router.navigate(['charging-facility', link.routerLink]);

    this.selectedTabValue.set(link.value);
  }
}
