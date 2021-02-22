import {
  AnnotationEvent,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  FieldType,
  MutableDataFrame,
} from '@grafana/data';
import { BackendSrvRequest, getBackendSrv, getTemplateSrv } from '@grafana/runtime';
import { ChaosEvent, ChaosMeshOptions, ChaosMeshQuery, ChaosMeshVariableQuery, defaultQuery } from './types';

import defaults from 'lodash/defaults';

export class DataSource extends DataSourceApi<ChaosMeshQuery, ChaosMeshOptions> {
  url: string;
  limit = 25;

  constructor(instanceSettings: DataSourceInstanceSettings<ChaosMeshOptions>) {
    super(instanceSettings);

    this.url = instanceSettings.url!;
    if (instanceSettings.jsonData.limit) {
      this.limit = instanceSettings.jsonData.limit;
    }
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

  getVariables() {
    return getTemplateSrv()
      .getVariables()
      .filter((d: any) => d.datasource === 'Chaos Mesh')
      .map((d: any) => {
        const type = d.definition.split(': ')[1];

        return { [type === 'experiment' ? 'experimentName' : type]: d.current.value };
      })
      .reduce((acc, d) => ({ ...acc, ...d }), {});
  }

  async query(options: DataQueryRequest<ChaosMeshQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range.from.toISOString();
    const to = range.to.toISOString();

    const data = await Promise.all(
      options.targets.map(async target => {
        const query = { ...defaults(target, defaultQuery), ...this.getVariables() };

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
            limit: this.limit,
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

  async annotationQuery(options: any): Promise<AnnotationEvent[]> {
    const { range, dashboard } = options;
    const from = range.from.toISOString();
    const to = range.to.toISOString();
    const timezone = dashboard.timezone === '' ? undefined : dashboard.timezone;

    const query = defaults(options.annotation, defaultQuery);

    const data = (
      await this.fetchDryEvents({
        ...query,
        startTime: from,
        finishTime: to,
        limit: this.limit,
      })
    ).data;

    return data.map((d: ChaosEvent) => ({
      title: `Experiment: ${d.experiment}`,
      text: `
          <span>Status: ${d.finish_time ? 'Finished' : 'Running'}</span>
          <span>Started: ${new Date(d.start_time).toLocaleString('en-US', { timeZone: timezone })}</span>
          ${
            d.finish_time
              ? `<span>Started: ${new Date(d.start_time).toLocaleString('en-US', {
                  timeZone: timezone,
                })}</span>`
              : ''
          }
        `,
      tags: [`namespace:${d.namespace}`, `kind:${d.kind}`],
      time: Date.parse(d.start_time),
      timeEnd: Date.parse(d.finish_time),
      isRegion: true,
    }));
  }

  async metricFindQuery(query: ChaosMeshVariableQuery, options?: any) {
    let data = (
      await this.fetchDryEvents({
        limit: this.limit,
      } as ChaosMeshQuery)
    ).data;

    const { metric, experimentName, namespace, kind } = query;

    if (metric === 'experiment' && experimentName) {
      data = data.filter(d => d.experiment.includes(experimentName));
    }

    if (namespace) {
      data = data.filter(d => d.namespace === namespace);
    }

    if (kind) {
      data = data.filter(d => d.kind === kind);
    }

    return data.map(d => ({
      text:
        metric === 'experiment'
          ? d.experiment
          : metric === 'namespace'
          ? d.namespace
          : metric === 'kind'
          ? d.kind
          : d.experiment,
    }));
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
