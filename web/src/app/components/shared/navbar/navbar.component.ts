import {Component, HostListener, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, NgForOf, NgIf} from "@angular/common";
import {MenuElement} from "../../../dto/MenuElement";
import {BreakpointObserver} from "@angular/cdk/layout";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {animate, AUTO_STYLE, state, style, transition, trigger} from "@angular/animations";

const DEFAULT_DURATION = 300;

@Component({
    selector: 'app-navbar',
    imports: [
        NgForOf,
        NgIf,
        MatIcon,
        MatIconButton
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
    animations: [
        trigger('collapse', [
            state('false', style({height: AUTO_STYLE, visibility: AUTO_STYLE})),
            state('true', style({height: '0', visibility: 'hidden'})),
            transition('false => true', animate(DEFAULT_DURATION + 'ms ease-in')),
            transition('true => false', animate(DEFAULT_DURATION + 'ms ease-out'))
        ])
    ]
})
export class NavbarComponent implements OnInit {
    menuElements: MenuElement[] = [];
    protected isMobile: boolean = true;
    isCollapsed: boolean = true;
    isScrolled: boolean = false;
    showFloatingNav: boolean = false;

    readonly phoneDisplay = '+48 509 792 650';
    readonly phoneHref = 'tel:+48509792650';
    readonly location = 'Kielce, os. Ślichowice';
    readonly instagramUrl = 'https://www.instagram.com/mowie.wam/';
    readonly facebookUrl = 'https://www.facebook.com/mowiewam';

    constructor(
        private observer: BreakpointObserver,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    ngOnInit(): void {
        this.createMenu();
        this.observer.observe(['(max-width: 1100px)']).subscribe((screenSize) => {
            this.isMobile = screenSize.matches;
            if (this.isMobile) {
                this.isCollapsed = true;
            }
        });
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        if (isPlatformBrowser(this.platformId)) {
            const y = window.scrollY;
            this.isScrolled = y > 30;
            // floating pretty bar pojawia się dopiero po opuszczeniu obszaru headera
            this.showFloatingNav = y > 160;
        }
    }

    createMenu() {
        this.menuElements = [
            {header: "Strona główna", url: "/", exact: true},
            {header: "O nas", url: "/o-nas", exact: true},
            {header: "Oferta", url: "/oferta", exact: true},
            {header: "Cennik", url: "/cennik", exact: true},
            {header: "Blog", url: "/blog", exact: true},
            {header: "Kontakt", url: "/kontakt", exact: true}
        ];
    }

    collapseMenu() {
        this.isCollapsed = !this.isCollapsed;
    }
}
