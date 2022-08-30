import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-more-details',
  templateUrl: './more-details.component.html',
  styleUrls: ['./more-details.component.scss']
})
export class MoreDetailsComponent implements OnInit {

  tableData = [];
  cols: any[];
  constructor() { }

  ngOnInit(): void {

    this.cols = [
      { field: 'moniker', header: 'Moniker' },
      { field: 'node_id', header: 'Node Id' },
      { field: 'chain', header: 'Chain' },
      { field: 'country', header: 'Country' },
      { field: 'isp', header: 'ISP' },
      { field: 'data_center', header: 'Data Center' }
    ];

    this.tableData = [
      { moniker: '00000', node_id: '94e69330d6f4cfe221cdd2ce49ee141e53e5f200', chain: '	osmosis-1', country: 'Singapore', isp: 'Leaseweb Asia Pacific pte. ltd', data_center: 'AS59253 Leaseweb Asia Pacific pte. ltd.' },
      { moniker: '000fm', node_id: 'cf84e3f178b32876dd1ea798a0c5d9b65e1f9dce', chain: '	osmosis-1', country: 'Pakistan', isp: 'Hetzner Online GmbH', data_center: 'AS24940 Hetzner Online GmbH' },
      { moniker: '00220', node_id: 'a113a5c702ea29cdfbbe41a2d4d0b6956117ebad', chain: '	osmosis-1', country: 'India', isp: 'LeaseWeb Netherlands B.V.', data_center: 'AS24673 Hetzner Online GmbH' },
      { moniker: '00150', node_id: '5895e0a5f496edd17d160c9be6619c3f5cc6e095', chain: '	osmosis-1', country: 'UK', isp: 'Hetzner', data_center: 'AS200295 Skoed Limited' },
      { moniker: '00rx6', node_id: '54055b9619090603a218e352bb83cc4a1d764005', chain: '	osmosis-1', country: 'Canada', isp: 'Amazon.com, Inc.', data_center: 'AS60781 LeaseWeb Netherlands B.V.' }
    ];
  }

}
