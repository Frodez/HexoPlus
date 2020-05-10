import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import Vditor from 'vditor';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vditor',
  template: `
    <div #vditor></div>
  `
})
export class VditorComponent implements OnInit, OnDestroy, AfterViewInit {

  vditor: Vditor;

  currentLang: string = '';

  set text(text: string) {
    if(this.vditor) {
      setTimeout(() => {
        this.vditor.setValue(text);
      });
    }
  }

  get text(): string {
    return this.vditor ? this.vditor.getValue() : '';
  }

  languageChange: Subscription;

  @ViewChild("vditor") vditorHtmlElement: ElementRef

  constructor(private translateService: TranslateService) { }

  ngOnInit(): void {
    this.languageChange = this.translateService.onLangChange.subscribe((event: LangChangeEvent)=> {
      if(this.vditor && this.currentLang != event.lang) {
        const value = this.vditor.getValue();
        const language = this.getLang(event.lang);
        this.destroyVditor();
        this.createAndBindVditor(language);
        this.text = value;
      }
    })
  }

  ngOnDestroy(): void {
    this.languageChange.unsubscribe();
  }

  ngAfterViewInit(): void {
    const language = this.getLang(this.translateService.currentLang);
    this.createAndBindVditor(language);
  }

  private destroyVditor() {
    if(this.vditorHtmlElement) {
      const div = this.vditorHtmlElement.nativeElement as HTMLDivElement;
      div.innerHTML = '';
    }
  }

  private getLang(lang: string): "en_US" | "zh_CN" | "ko_KR" {
    let language: "en_US" | "zh_CN" | "ko_KR" = 'en_US';
    if(lang == 'zh_CN' || lang == 'en_US' || lang == 'ko_KR') {
      language = lang;
    }
    return language;
  }

  private createAndBindVditor(language: "en_US" | "zh_CN" | "ko_KR") {
    const menu = window.innerWidth < 768 ? undefined : [
      'emoji',
      'headings',
      'bold',
      'italic',
      'strike',
      'link',
      '|',
      'list',
      'ordered-list',
      'check',
      'outdent',
      'indent',
      '|',
      'quote',
      'line',
      'code',
      'inline-code',
      'insert-before',
      'insert-after',
      '|',
      'upload',
      'record',
      'table',
      '|',
      'undo',
      'redo',
      '|',
      'edit-mode',
      'content-theme',
      'code-theme',
      'both',
      'format',
      'preview',
      'info',
      'help'
    ];
    const div = this.vditorHtmlElement.nativeElement as HTMLDivElement;
    this.currentLang = language;
    this.vditor = new Vditor(div, {
      toolbar: menu,
      lang: language,
      cache: {
        id: 'vditorContent',
        enable: false
      },
      mode: "sv",
      debugger: true,
      typewriterMode: true,
      placeholder: 'placeholder',
      preview: {
        markdown: {
          codeBlockPreview: true,
          setext: true,
          toc: true,
        },
      },
      toolbarConfig: {
        pin: true,
      },
      counter: {
        enable: true,
        type: 'text',
      },
      hint: {
        emojiPath: '../../../../node_modules/vditor/dist/images/emoji',
        emoji: {
          'sd': '💔'
        },
      },
      tab: '\t'
    });
  }
}