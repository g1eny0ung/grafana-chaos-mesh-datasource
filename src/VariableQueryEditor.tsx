import { ChaosMeshVariableQuery, ExperimentKind, kindOptions } from './types';
import { InlineFormLabel, LegacyForms } from '@grafana/ui';
import React, { SyntheticEvent, useEffect, useState } from 'react';

import { SelectableValue } from '@grafana/data';

const { Input, Select } = LegacyForms;

const metricOptions: Array<SelectableValue<string>> = [
  { label: 'Experiment', value: 'experiment' },
  { label: 'Namespace', value: 'namespace' },
  { label: 'Kind', value: 'kind' },
];

interface VariableQueryProps {
  query: ChaosMeshVariableQuery;
  onChange: (query: ChaosMeshVariableQuery, definition: string) => void;
}

export const VariableQueryEditor: React.FC<VariableQueryProps> = ({ query, onChange }) => {
  const [state, setState] = useState(query.metric ? query : { ...query, metric: 'experiment' as 'experiment' });

  const onMetricChange = (option: SelectableValue<string>) => {
    setState({ ...state, metric: option.value! as any });
  };

  const onInputChange = (e: SyntheticEvent<HTMLInputElement>) => {
    setState({ ...state, [e.currentTarget.name]: e.currentTarget.value });
  };

  const onKindChange = (option: SelectableValue<ExperimentKind>) => {
    setState({ ...state, kind: option.value! });
  };

  const onRunQuery = () => onChange(state, `metric: ${state.metric}`);

  useEffect(() => {
    onRunQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.metric, state.kind]);

  return (
    <>
      <div className="gf-form">
        <InlineFormLabel tooltip="Specify the data metric.">Metric</InlineFormLabel>
        <Select
          options={metricOptions}
          value={metricOptions.find(m => m.value === state.metric)}
          onChange={onMetricChange}
        />
      </div>
      <div className="gf-form">
        <InlineFormLabel tooltip="Filter chaos events by specifying the name of Experiments. Support fuzzy matching. Only available when the metric is Experiment.">
          Experiment
        </InlineFormLabel>
        <Input name="experimentName" value={state.experimentName} onChange={onInputChange} onBlur={onRunQuery} />
      </div>
      <div className="gf-form">
        <InlineFormLabel tooltip="Filter chaos events by choosing the Namespace of Experiments.">
          Namespace
        </InlineFormLabel>
        <Input name="namespace" value={state.namespace} onChange={onInputChange} onBlur={onRunQuery} />
      </div>
      <div className="gf-form">
        <InlineFormLabel tooltip="Filter chaos events by choosing the Kind of Experiments.">Kind</InlineFormLabel>
        <Select
          options={kindOptions}
          value={kindOptions.find(kind => kind.value === state.kind)}
          onChange={onKindChange}
        />
      </div>
    </>
  );
};
