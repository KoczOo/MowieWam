import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
    selector: 'app-polityka-prywatnosci',
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './polityka-prywatnosci.component.html',
    styleUrl: './polityka-prywatnosci.component.scss',
})
export class PolitykaPrywatnosciComponent {
    constructor() {
        inject(SeoService).update({
            title: 'Polityka prywatności | Mówię Wam',
            description:
                'Informacje o przetwarzaniu danych osobowych w Centrum Logopedyczno-Terapeutycznym Mówię Wam w Kielcach.',
            url: '/polityka-prywatnosci',
            robots: 'noindex,follow',
        });
    }
}
