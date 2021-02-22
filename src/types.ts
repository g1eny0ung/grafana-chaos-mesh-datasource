import { DataQuery, DataSourceJsonData, SelectableValue } from '@grafana/data';

export type ExperimentKind =
  | 'PodChaos'
  | 'NetworkChaos'
  | 'IoChaos'
  | 'KernelChaos'
  | 'TimeChaos'
  | 'StressChaos'
  | 'DNSChaos';

export const kindOptions: Array<SelectableValue<ExperimentKind>> = [
  { label: 'Pod Chaos', value: 'PodChaos' },
  { label: 'Network Chaos', value: 'NetworkChaos' },
  { label: 'IO Chaos', value: 'IoChaos' },
  { label: 'Time Chaos', value: 'TimeChaos' },
  { label: 'Kernel Chaos', value: 'KernelChaos' },
  { label: 'Stress Chaos', value: 'StressChaos' },
  { label: 'DNS Chaos', value: 'DNSChaos' },
];

interface ChaosMeshCommonQuery {
  experimentName?: string;
  namespace?: string;
  kind?: ExperimentKind;
}

export interface ChaosMeshQuery extends DataQuery, ChaosMeshCommonQuery {
  startTime?: string;
  finishTime?: string;
}

export const defaultQuery: Partial<ChaosMeshQuery> = {
  namespace: 'default',
  kind: 'PodChaos',
};

export interface ChaosMeshVariableQuery extends ChaosMeshCommonQuery {
  metric: 'experiment' | 'namespace' | 'kind';
}

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
