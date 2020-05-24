import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeurl' })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}

@Pipe({ name: 'saferesourceurl' })
export class SafeResourceUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(resourceurl: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(resourceurl);
  }
}

@Pipe({ name: 'safehtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

@Pipe({ name: 'safescript' })
export class SafeScriptPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(script: string) {
    return this.sanitizer.bypassSecurityTrustScript(script);
  }
}