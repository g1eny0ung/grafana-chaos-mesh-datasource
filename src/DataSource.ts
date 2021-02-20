import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';
import { BackendSrvRequest, getBackendSrv } from '@grafana/runtime';

import { ChaosMeshQuery, ChaosMeshOptions, defaultQuery, ChaosEvent } from './types';

export class DataSource extends DataSourceApi<ChaosMeshQuery, ChaosMeshOptions> {
  url: string;
  limit: number;

  constructor(instanceSettings: DataSourceInstanceSettings<ChaosMeshOptions>) {
    super(instanceSettings);

    this.url = instanceSettings.url!;
    this.limit = instanceSettings.jsonData.limit!;
  }

  private _fetch<T = any>(path: string, options: Omit<BackendSrvRequest, 'url'> = {}) {
    return getBackendSrv()
      .fetch<T>({
        url: this.url + '/api' + path,
        ...options,
      })
      .toPromise();
  }

  fetchConfig = () => this._fetch('/common/config');

  fetchAvailableNamespaces = () => this._fetch<string[]>('/common/chaos-available-namespaces');

  fetchDryEvents = (params?: ChaosMeshQuery) =>
    this._fetch<ChaosEvent[]>('/events/dry', {
      params,
    });

  async query(options: DataQueryRequest<ChaosMeshQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range.from.toISOString();
    const to = range.to.toISOString();

    const data = await Promise.all(
      options.targets.map(async target => {
        const query = defaults(target, defaultQuery);

        const frame = new MutableDataFrame({
          refId: query.refId,
          fields: [
            { name: 'Experiment', type: FieldType.string },
            { name: 'Namespace', type: FieldType.string },
            { name: 'Kind', type: FieldType.string },
            { name: 'Start Time', type: FieldType.time },
            { name: 'Finish Time', type: FieldType.time },
            { name: 'Message', type: FieldType.string },
          ],
        });

        const data = (
          await this.fetchDryEvents({
            ...query,
            startTime: from,
            finishTime: to,
          })
        ).data;

        data.forEach(d =>
          frame.add({
            Experiment: d.experiment,
            Namespace: d.namespace,
            Kind: d.kind,
            'Start Time': d.start_time,
            'Finish Time': d.finish_time,
            Message: d.message,
          })
        );

        return frame;
      })
    );

    return { data };
  }

  async testDatasource() {
    try {
      await this.fetchConfig();

      return {
        status: 'success',
        message: 'Success',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error,
      };
    }
  }
}
