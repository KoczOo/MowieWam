import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {NavbarComponent} from "../shared/navbar/navbar.component";
import {FooterComponent} from "../shared/footer/footer.component";

@Component({
  selector: 'app-layout',
    imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

}
