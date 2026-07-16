import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { ONasComponent } from './pages/o-nas/o-nas.component';
import { OfertaComponent } from './pages/oferta/oferta.component';
import { PierwszaWizytaComponent } from './pages/pierwsza-wizyta/pierwsza-wizyta.component';
import { CennikComponent } from './pages/cennik/cennik.component';
import { BlogComponent } from './pages/blog/blog.component';
import { KontaktComponent } from './pages/kontakt/kontakt.component';
import { PolitykaPrywatnosciComponent } from './pages/polityka-prywatnosci/polityka-prywatnosci.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', pathMatch: 'full', component: HomeComponent, title: 'Mówię Wam – Logopeda Kielce, os. Ślichowice' },
      { path: 'o-nas', component: ONasComponent, title: 'O nas – Mówię Wam' },
      { path: 'oferta', component: OfertaComponent, title: 'Oferta – Mówię Wam' },
      { path: 'pierwsza-wizyta', component: PierwszaWizytaComponent, title: 'Pierwsza wizyta – Mówię Wam' },
      { path: 'cennik', component: CennikComponent, title: 'Cennik – Mówię Wam' },
      { path: 'blog', component: BlogComponent, title: 'Blog – Mówię Wam' },
      { path: 'kontakt', component: KontaktComponent, title: 'Kontakt – Mówię Wam' },
      { path: 'polityka-prywatnosci', component: PolitykaPrywatnosciComponent, title: 'Polityka prywatności – Mówię Wam' },
      { path: '**', component: NotFoundComponent, title: '404 – Mówię Wam' },
    ],
  },
];
