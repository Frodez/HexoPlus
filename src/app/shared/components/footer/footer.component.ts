import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <mat-divider></mat-divider>
    <footer>
        &copy; All rights reseved 2020
    </footer>
  `,
  styles: [
    `footer {
      padding: 20px;
    }`
  ]
})
export class FooterComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}