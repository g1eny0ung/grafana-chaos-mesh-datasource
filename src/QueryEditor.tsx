import defaults from 'lodash/defaults';

import React, { PureComponent, SyntheticEvent } from 'react';
import { LegacyForms, InlineFormLabel } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './DataSource';
import { ExperimentKind, defaultQuery, ChaosMeshOptions, ChaosMeshQuery } from './types';

const { Input, Select } = LegacyForms;
const MarginRight4: React.FC = ({ children }) => <div style={{ marginRight: 4 }}>{children}</div>;

const kindOptions: Array<SelectableValue<ExperimentKind>> = [
  { label: 'Pod Chaos', value: 'PodChaos' },
  { label: 'Network Chaos', value: 'NetworkChaos' },
  { label: 'IO Chaos', value: 'IoChaos' },
  { label: 'Time Chaos', value: 'TimeChaos' },
  { label: 'Kernel Chaos', value: 'KernelChaos' },
  { label: 'Stress Chaos', value: 'StressChaos' },
  { label: 'DNS Chaos', value: 'DNSChaos' },
];

type Props = QueryEditorProps<DataSource, ChaosMeshQuery, ChaosMeshOptions>;

interface State {
  dnsServerCreate: boolean;
  availableNamespaces: Array<SelectableValue<string>>;
  experimentName: string;
  namespace: SelectableValue<string>;
  kind: SelectableValue<ExperimentKind>;
}

export class QueryEditor extends PureComponent<Props, State> {
  query: ChaosMeshQuery;
  datasource: DataSource;

  constructor(props: Props) {
    super(props);

    this.query = defaults(this.props.query, defaultQuery);
    this.datasource = this.props.datasource;
    this.state = {
      dnsServerCreate: false,
      availableNamespaces: [],
      experimentName: '',
      namespace: { label: 'default', value: 'default' },
      kind: kindOptions[0],
    };
  }

  componentDidMount() {
    this.datasource
      .fetchAvailableNamespaces()
      .then(({ data }) => this.setState({ availableNamespaces: data.map(d => ({ label: d, value: d })) }));
    this.datasource.fetchConfig().then(({ data }) => this.setState({ dnsServerCreate: data.dns_server_create }));
  }

  onExperimentNameChange = (e: SyntheticEvent<HTMLInputElement>) => {
    const name = e.currentTarget.value;
    this.query.experimentName = name;
    this.setState({ experimentName: name });
  };

  onNamespaceChange = (option: SelectableValue<string>) => {
    this.query.namespace = option.value!;
    this.setState({ namespace: option }, this.onRunQuery);
  };

  onKindChange = (option: SelectableValue<ExperimentKind>) => {
    this.query.kind = option.value!;
    this.setState({ kind: option }, this.onRunQuery);
  };

  onRunQuery = () => {
    this.props.onChange(this.query);
    this.props.onRunQuery();
  };

  render() {
    const { dnsServerCreate, availableNamespaces, experimentName, namespace, kind } = this.state;

    return (
      <div className="gf-form-inline">
        <MarginRight4>
          <div className="gf-form">
            <InlineFormLabel tooltip="Filter chaos events by specifying the name of Experiments.">
              Experiment
            </InlineFormLabel>
            <Input value={experimentName} onChange={this.onExperimentNameChange} onBlur={this.onRunQuery} />
          </div>
        </MarginRight4>
        <MarginRight4>
          <div className="gf-form">
            <InlineFormLabel tooltip="Filter chaos events by choosing the Namespace of Experiments.">
              Namespace
            </InlineFormLabel>
            <Select options={availableNamespaces} value={namespace} onChange={this.onNamespaceChange} />
          </div>
        </MarginRight4>
        <MarginRight4>
          <div className="gf-form">
            <InlineFormLabel tooltip="Filter chaos events by choosing the Kind of Experiments.">Kind</InlineFormLabel>
            <Select
              options={dnsServerCreate ? kindOptions : kindOptions.filter(kind => kind.value !== 'DNSChaos')}
              value={kind}
              onChange={this.onKindChange}
            />
          </div>
        </MarginRight4>
      </div>
    );
  }
}
