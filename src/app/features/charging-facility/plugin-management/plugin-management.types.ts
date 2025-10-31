import { EV } from '../ev-table/ev.types';
import { Charger } from '../charger-table/charger.types';

export type PluginStatus = 'in' | 'out';

export type PluginManager = {
  ev: Pick<EV, 'id' | 'name'> | null;
  charger: Pick<Charger, 'id' | 'name'> ;
  status: PluginStatus;
};
