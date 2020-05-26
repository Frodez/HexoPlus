import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { HexoService } from "../../core/services/hexo/hexo.service";

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html'
})
export class ViewerComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('iframe') element: ElementRef;

  constructor(private router: Router, public hexo: HexoService, private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    window.dispatchEvent(new Event('resize'));//refresh the window
  }

  ngOnDestroy(): void {
  }

}