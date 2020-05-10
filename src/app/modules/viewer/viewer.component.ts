import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { HexoService } from "../../core/services/hexo/hexo.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html'
})
export class ViewerComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('iframe') iframe: ElementRef

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