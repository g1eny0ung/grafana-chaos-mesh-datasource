import { DataQuery, DataSourceJsonData } from '@grafana/data';

export type ExperimentKind =
  | 'PodChaos'
  | 'NetworkChaos'
  | 'IoChaos'
  | 'KernelChaos'
  | 'TimeChaos'
  | 'StressChaos'
  | 'DNSChaos';

export interface ChaosMeshQuery extends DataQuery {
  experimentName: string;
  namespace: string;
  kind: ExperimentKind;
  startTime: string;
  finishTime: string;
}

export const defaultQuery: Partial<ChaosMeshQuery> = {
  namespace: 'default',
  kind: 'PodChaos',
};

export interface ChaosMeshOptions extends DataSourceJsonData {
  limit?: number;
}

export interface ChaosEvent {
  id: number;
  experiment: string;
  namespace: string;
  kind: ExperimentKind;
  message: string;
  start_time: string;
  finish_time: string;
}
