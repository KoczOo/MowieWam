import { BreakpointObserver } from '@angular/cdk/layout';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { fromEvent, throttleTime } from 'rxjs';
import {
  AUTO_STYLE,
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MenuElement } from '../../../dto/MenuElement';

const DEFAULT_DURATION = 300;
const MOBILE_BREAKPOINT = '(max-width: 1100px)';
const SCROLL_STICKY = 30;
const SCROLL_FLOATING = 160;

@Component({
  selector: 'app-navbar',
  imports: [MatIcon, MatIconButton, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  animations: [
    trigger('collapse', [
      state('false', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
      state('true', style({ height: '0', visibility: 'hidden' })),
      transition('false => true', animate(DEFAULT_DURATION + 'ms ease-in')),
      transition('true => false', animate(DEFAULT_DURATION + 'ms ease-out')),
    ]),
  ],
})
export class NavbarComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly doc = inject(DOCUMENT);

  protected readonly menuElements: readonly MenuElement[] = [
    { header: 'Strona główna', url: '/', exact: true },
    { header: 'O nas', url: '/o-nas' },
    { header: 'Oferta', url: '/oferta' },
    { header: 'Cennik', url: '/cennik' },
    { header: 'Blog', url: '/blog' },
    { header: 'Kontakt', url: '/kontakt' },
  ];

  protected readonly phoneDisplay = '+48 509 792 650';
  protected readonly phoneHref = 'tel:+48509792650';
  protected readonly instagramUrl = 'https://www.instagram.com/mowie.wam/';
  protected readonly facebookUrl = 'https://www.facebook.com/mowiewam';

  protected readonly isMobile = signal(true);
  protected readonly isCollapsed = signal(true);
  private readonly scrollY = signal(0);

  protected readonly isScrolled = computed(() => this.scrollY() > SCROLL_STICKY);
  protected readonly showFloatingNav = computed(
    () => !this.isMobile() && this.scrollY() > SCROLL_FLOATING,
  );

  constructor() {
    this.breakpointObserver
      .observe([MOBILE_BREAKPOINT])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ matches }) => {
        this.isMobile.set(matches);
        if (matches) this.isCollapsed.set(true);
      });

    if (isPlatformBrowser(this.platformId)) {
      fromEvent(this.doc, 'scroll', { passive: true })
        .pipe(throttleTime(50, undefined, { leading: true, trailing: true }), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.scrollY.set(window.scrollY));
    }
  }

  protected toggleCollapse(): void {
    this.isCollapsed.update((v) => !v);
  }

  protected closeMenu(): void {
    if (this.isMobile()) this.isCollapsed.set(true);
  }
}
