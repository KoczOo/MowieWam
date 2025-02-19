import { Directive, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appIntersectionObserver]',
  standalone: true
})
export class IntersectionObserverDirective implements OnInit, OnDestroy {
  @Input() rootMargin: string = '0px';
  @Output() visible = new EventEmitter<void>();

  private observer!: IntersectionObserver;

  constructor(
      private el: ElementRef,
      private renderer: Renderer2,
      @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initObserver();
    }
  }

  private initObserver(): void {
    this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.onVisible();
          }
        },
        {
          root: null,
          rootMargin: this.rootMargin
        }
    );
    this.observer.observe(this.el.nativeElement);
  }

  private onVisible(): void {
    this.renderer.addClass(this.el.nativeElement, 'visible');
    this.renderer.removeClass(this.el.nativeElement, 'hidden-left');
    this.visible.emit();
    this.observer.disconnect();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
