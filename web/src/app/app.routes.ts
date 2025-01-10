import { Routes } from '@angular/router';
import {LayoutComponent} from "./components/layout/layout.component";
import {ONasComponent} from "./pages/o-nas/o-nas.component";
import {CennikComponent} from "./pages/cennik/cennik.component";
import {KontaktComponent} from "./pages/kontakt/kontakt.component";
import {HomeComponent} from "./pages/home/home.component";
import {PierwszaWizytaComponent} from "./pages/pierwsza-wizyta/pierwsza-wizyta.component";

export const routes: Routes = [
    {
        path: "",
        component: LayoutComponent,
        children: [
            {
              path: "",
              component: HomeComponent
            },
            {
                path: "o-nas",
                component: ONasComponent
            },
            {
              path: "pierwsza-wizyta",
              component: PierwszaWizytaComponent
            },
            {
                path: "cennik",
                component: CennikComponent
            },
            {
                path: "kontakt",
                component: KontaktComponent
            },
        ]
    },
];
