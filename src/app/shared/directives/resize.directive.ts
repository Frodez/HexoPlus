import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[resize]'
})
export class ResizeDirective {

  constructor(private el: ElementRef) {}

  @HostListener('window:load') onLoad() {
    this.resize();
  }

  @HostListener('window:resize') onResize() {
    this.resize();
  }

  resize() {
    const element = this.el.nativeElement as HTMLElement;
    element.style.height = element.parentElement.offsetHeight + 'px';
    element.style.width = element.parentElement.offsetWidth + 'px';
  }

}