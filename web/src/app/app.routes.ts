import { Routes } from '@angular/router';
import {LayoutComponent} from "./components/layout/layout.component";
import {ONasComponent} from "./pages/o-nas/o-nas.component";
import {CennikComponent} from "./pages/cennik/cennik.component";
import {KontaktComponent} from "./pages/kontakt/kontakt.component";
import {HomeComponent} from "./pages/home/home.component";
import {PierwszaWizytaComponent} from "./pages/pierwsza-wizyta/pierwsza-wizyta.component";
import {OfertaComponent} from "./pages/oferta/oferta.component";
import {BlogComponent} from "./pages/blog/blog.component";
import {PolitykaPrywatnosciComponent} from "./pages/polityka-prywatnosci/polityka-prywatnosci.component";

export const routes: Routes = [
    {
        path: "",
        component: LayoutComponent,
        children: [
            {path: "", component: HomeComponent},
            {path: "o-nas", component: ONasComponent},
            {path: "oferta", component: OfertaComponent},
            {path: "pierwsza-wizyta", component: PierwszaWizytaComponent},
            {path: "cennik", component: CennikComponent},
            {path: "blog", component: BlogComponent},
            {path: "kontakt", component: KontaktComponent},
            {path: "polityka-prywatnosci", component: PolitykaPrywatnosciComponent},
            {path: "**", redirectTo: ""}
        ]
    },
];
