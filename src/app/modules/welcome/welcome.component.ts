import { Component, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html'
})
export class WelcomeComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private router: Router) {
  }
  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
  }
  ngOnDestroy(): void {
  }

}