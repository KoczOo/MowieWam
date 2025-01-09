import { Routes } from '@angular/router';
import {LayoutComponent} from "./components/layout/layout.component";
import {ONasComponent} from "./pages/o-nas/o-nas.component";
import {CennikComponent} from "./pages/cennik/cennik.component";
import {KontaktComponent} from "./pages/kontakt/kontakt.component";

export const routes: Routes = [
    {
        path: "",
        component: LayoutComponent,
        children: [
            {
                path: "o-nas",
                component: ONasComponent
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
