import { Component, OnDestroy, OnInit } from '@angular/core';
import { HexoService } from '../../../core/services/hexo/hexo.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  constructor(public hexoConfig: HexoService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.hexoConfig.stop();
  }

}