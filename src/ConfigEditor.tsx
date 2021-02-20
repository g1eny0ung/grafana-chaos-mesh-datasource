import React from 'react';
import { DataSourceHttpSettings } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { ChaosMeshOptions } from './types';
import ChaosMeshSettings from './ChaosMeshSettings';

type Props = DataSourcePluginOptionsEditorProps<ChaosMeshOptions>;

export const ConfigEditor: React.FC<Props> = props => {
  const { options, onOptionsChange } = props;

  return (
    <>
      <DataSourceHttpSettings
        defaultUrl="http://localhost:2333"
        dataSourceConfig={options}
        showAccessOptions={true}
        onChange={onOptionsChange}
      />
      <ChaosMeshSettings options={options} onOptionsChange={onOptionsChange} />
    </>
  );
};
