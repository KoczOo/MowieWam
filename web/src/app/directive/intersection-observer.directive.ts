import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  afterNextRender,
  inject,
  input,
  output,
} from '@angular/core';


@Directive({
  selector: '[appIntersectionObserver]',
  standalone: true,
})
export class IntersectionObserverDirective implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);

  readonly rootMargin = input<string>('0px');
  readonly visible = output<void>();

  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.initObserver();
    });
  }

  private initObserver(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          this.onVisible();
        }
      },
      { root: null, rootMargin: this.rootMargin() },
    );
    this.observer.observe(this.el.nativeElement);
  }

  private onVisible(): void {
    this.renderer.addClass(this.el.nativeElement, 'visible');
    this.renderer.removeClass(this.el.nativeElement, 'hidden-left');
    this.visible.emit();
    this.observer?.disconnect();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
