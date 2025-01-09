import {Component, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import {MenuElement} from "../../../dto/MenuElement";
import {BreakpointObserver} from "@angular/cdk/layout";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {animate, AUTO_STYLE, state, style, transition, trigger} from "@angular/animations";

const DEFAULT_DURATION = 300;

@Component({
    selector: 'app-navbar',
    imports: [
        RouterLinkActive,
        RouterLink,
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
    isCollapsed: boolean = false;

    constructor(private observer: BreakpointObserver) {
    }

    ngOnInit(): void {
        this.createMenu();
        this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
            this.isMobile = screenSize.matches;
        });
    }

    createMenu() {
        this.menuElements = [
            {
                header: "Strona główna",
                url: "/",
                exact: true
            },
            {
                header: "O nas",
                url: "/o-nas",
                exact: true
            }
            ,
            {
                header: "Cennik",
                url: "/cennik",
                exact: true
            },
            {
                header: "Kontakt",
                url: "/kontakt",
                exact: true
            }
        ]
    }

    collapseMenu() {
        this.isCollapsed = !this.isCollapsed;
    }
}
