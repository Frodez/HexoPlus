import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { MatDrawerContent, MatDrawerContainer } from '@angular/material/sidenav';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  loading: boolean = false;
  sidebarOpen: boolean = true;

  constructor(private router: Router) {
    router.events.subscribe((event) => {
      if(event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loading = false;
      } else {
        this.loading = true;
      }
    });
  }

  ngOnInit(): void {
  }

  sidebarToggler() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}