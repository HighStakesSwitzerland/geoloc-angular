import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {ChartOptions, ChartData, ChartType} from 'chart.js';
import * as pluginLabels from '@energiency/chartjs-plugin-piechart-outlabels';
import {AppService, ChainsNodeList, NodeDetail} from 'src/app/services/app.service';
import {ActivatedRoute, Router} from '@angular/router';
import {formatDate} from "@angular/common";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {

  markers: Array<any> = [];
  networks: Networks = {} as Networks;
  totalNodes: Number = 0;
  selectedNetwork: any;
  countries = [];
  selectedCountry: any;
  tableData = [];
  dialogTableData = [];
  cols: any[];
  loadingMap: boolean = true;
  hideSidebar: boolean = false;
  showDiaglog: boolean = false;
  map;
  pieChartOptions: ChartOptions;
  pieChartLabels: string[];
  pieChartData: ChartData;
  pieChartType: ChartType;
  pieChartLegend: boolean;
  pieChartPlugins = [];
  chartColors: Array<any>;

  constructor(
    public appService: AppService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
  }

  async ngOnInit() {

    this.countries = [
      {name: 'COUNTRY', groupBy: 'country'},
      {name: 'ISP', groupBy: 'isp'},
      {name: 'DATA_CENTER', groupBy: 'as'}
    ];
    this.selectedCountry = this.countries[0];

    this.cols = [
      {field: 'moniker', header: 'Moniker'},
      {field: 'nodeId', header: 'Node Id'},
      {field: 'chain', header: 'Chain'},
      {field: 'country', header: 'Country'},
      {field: 'isp', header: 'ISP'},
      {field: 'as', header: 'Data Center'}
    ];
  }

  initMap(): void {
    this.map = L.map('map', {
      center: [51.2, 7],
      zoom: 4
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Map data &copy; OpenStreetMap contributors'
    });
    tiles.addTo(this.map);
  }

  initChart(): void {

    this.pieChartType = 'pie';
    this.pieChartLegend = true;
    this.pieChartPlugins = [pluginLabels];

    // @ts-ignore
    this.pieChartOptions = {
      plugins: {
        // @ts-ignore
        legend: true,
        outlabels: {
          text: '%l %p',
          color: 'black',
          padding: 4,
          borderRadius: 4,
          stretch: 10,
          font: {
            resizable: true,
            minSize: 10,
            maxSize: 12
          }
        }
      }
    };
  }

  async initNetworks() {

    const networkIcons = this.appService.mapNetworkIcons;

    const {network} = this.activatedRoute.snapshot.params;

    this.networks.names = [{name: 'All Networks', value: 'all', icon: 'all.png', markerClassname: ''}];
    this.networks.data = await this.appService.listNetworks();

    for (const key of Object.keys(this.networks.data)) {
      const item = networkIcons.find(item => key.search(item.name) > -1);

      this.networks.names.push({
        name: key,
        value: key,
        icon: item ? item['icon'] : undefined,
        markerClassname: item ? item['className'] : ""
      })
    }

    this.selectedNetwork = this.networks.names[0];
    if (network) {
      if (!Object.keys(this.networks.data).find((key) => key.includes(network))) {
        this.router.navigate(['/']).then();
      } else {
        this.selectedNetwork = this.networks.names.find(item => item.name.includes(network));
      }
    }
  }

  async ngAfterViewInit() {
    setTimeout(async () => {
      await this.initMap();
      await this.initNetworks();
      await this.updateData();
      await this.initChart();
    });
  }

  updateData(): void {
    this.ngOnDestroy();
    this.initMap();

    let nodeList: Array<NodeDetail> = [];

    if (this.selectedNetwork.value === 'all') {
      for (let name in this.networks.data) {
        this.networks.data[name].nodes = this.networks.data[name].nodes.map(v => ({...v, chain: name, className: this.networks.names.find(v => v.name === name)?.markerClassname}));
        nodeList = nodeList.concat(this.networks.data[name].nodes);
      }
    } else {
      nodeList = nodeList.concat(this.networks.data[this.selectedNetwork.value].nodes);
      nodeList = nodeList.map(v => ({...v, chain: this.selectedNetwork.value}));
    }

    let formattedNodes = this.appService.groupBy(nodeList, this.selectedCountry['groupBy']);

    this.tableData = [];
    for (let country in formattedNodes) {
      this.tableData.push({
        country: country,
        nodes: formattedNodes[country].length
      });
    }

    this.dialogTableData = nodeList;
    this.totalNodes = nodeList.length;

    const sliceBy = 4;
    let slicedData = this.tableData.slice(0, sliceBy);
    const others = this.tableData.slice(sliceBy, this.tableData.length);
    const otherNodesCount = others.map(item => item['nodes']).reduce((a, b) => a + b);
    this.pieChartLabels = slicedData.map(item => item['country']).concat(['Others']);
    this.pieChartData = {
      datasets: [{
        data: slicedData.map(item => item['nodes']).concat([otherNodesCount]),
        backgroundColor: this.chartColors
      }],
      labels: this.pieChartLabels
    };
    this.chartColors = [
      {backgroundColor: this.appService.getRandomColors(slicedData.length + 1)}
    ];

    const markers = new L.MarkerClusterGroup();
    nodeList.forEach(item => {
      const markerIcon = L.icon({
        iconUrl: `assets/markers/marker.png`,
        className: item.className ? item.className : this.selectedNetwork.markerClassname,
        iconSize: [34, 43]
      });
      const marker = L.marker([item.lat, item.lon], {
        icon: markerIcon,
        riseOnHover: true,
        title: item.moniker
      });
      marker.bindPopup(`
        <p><b>Moniker: </b>${item.moniker}</p>
        <p><b>Chain: </b>${item.chain}</p>
        <p><b>Country: </b>${item.country}</p>
        <p><b>ISP: </b>${item.isp}</p>
        <p><b>Data Center: </b>${item.as}</p>
        <p><b>Last Seen: </b>${formatDate(item.last_seen, "medium", "en-US", "UTC")}</p>
      `);

      markers.addLayer(marker);
      this.markers.push(marker);
    });

    this.map.addLayer(markers);

    this.loadingMap = false;

    if (this.selectedNetwork.value === 'all') {
      this.router.navigate(['/']);
    } else {
      const routePrettyName = this.selectedNetwork.name.substring(0, this.selectedNetwork.name.lastIndexOf('-'));
      this.router.navigate([routePrettyName]);
    }
  }

  ngOnDestroy(): void {
    this.map.off();
    this.map.remove();
    this.map = undefined;
  }

}

interface Networks {
  names: Array<NetworkDetail>
  data: ChainsNodeList
}

interface NetworkDetail {
  name: string;
  value: string;
  icon: string;
  markerClassname: string;
}
