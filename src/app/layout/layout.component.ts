import { Component, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';

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