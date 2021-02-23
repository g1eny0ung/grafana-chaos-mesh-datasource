# Chaos Mesh Data Source

Grafana data source plugin for Chaos Mesh.

## Features

- Visualize Chaos Events on the table
- Show Chaos Events on the graph with [Annotations](https://grafana.com/docs/grafana/latest/dashboards/annotations/)
- Display different Chaos Events by [Variables](https://grafana.com/docs/grafana/latest/variables/)

## Installation

```sh
grafana-cli plugins install g1eny0ung-chaos-mesh-datasource
```

## Setup

After installed, you can add this data source in `Configuration -> Data Sources`, then you will enter the settings page:

![img/settings.jpg](img/settings.jpg)

There has one field you only need to fill: `url`.

Assuming you have a local Chaos Mesh installed, the dashboard will default export its API in port `2333`. So, if you don't modify anything, you can simply fill `http://localhost:2333` into it.

Then use `port-forward` to active:

```sh
kubectl port-forward -n chaos-testing svc/chaos-dashboard 2333:2333
```

Finally, click **`Save & Test`** to test the connection. If it shows that the connection is successful, then the setup work has been completed.

### Options

Except for the `url`, this data source plugin has some options as below:

| Name  | Description                                                                                                           |
| ----- | --------------------------------------------------------------------------------------------------------------------- |
| Limit | Limit the number of returned Chaos Events. The default is 25. If you want to display more events, please increase it. |

## License

Same as Chaos Mesh. Under Apache-2.0 License.
