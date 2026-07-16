import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IntersectionObserverDirective } from '../../directive/intersection-observer.directive';
import { SeoService } from '../../services/seo.service';

interface PriceItem {
    name: string;
    duration?: string;
    price: string;
    description?: string;
    popular?: boolean;
}

interface PriceCategory {
    title: string;
    icon: string;
    items: PriceItem[];
}

interface Note { icon: string; title: string; desc: string; }

@Component({
    selector: 'app-cennik',
    imports: [MatIcon, RouterLink, IntersectionObserverDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './cennik.component.html',
    styleUrl: './cennik.component.scss',
})
export class CennikComponent {
    private readonly seo = inject(SeoService);

    protected readonly categories: readonly PriceCategory[] = [
        {
            title: 'Diagnoza', icon: 'fact_check',
            items: [
                { name: 'Diagnoza logopedyczna', duration: '60 min', price: '200 zł', description: 'Wywiad, badanie, opinia pisemna', popular: true },
                { name: 'Diagnoza neurologopedyczna', duration: '90 min', price: '280 zł', description: 'Pełna diagnoza wraz z opinią pisemną' },
                { name: 'Diagnoza terapii ręki', duration: '60 min', price: '200 zł', description: 'Ocena grafomotoryki i koordynacji' },
                { name: 'Konsultacja logopedyczna', duration: '45 min', price: '150 zł', description: 'Krótkie spotkanie konsultacyjne' },
            ],
        },
        {
            title: 'Terapia indywidualna', icon: 'self_improvement',
            items: [
                { name: 'Terapia logopedyczna', duration: '45 min', price: '130 zł', popular: true },
                { name: 'Terapia neurologopedyczna', duration: '45 min', price: '150 zł' },
                { name: 'Terapia ręki', duration: '45 min', price: '130 zł' },
                { name: 'Nauka czytania metodą sylabową', duration: '45 min', price: '130 zł' },
                { name: 'Terapia miofunkcjonalna', duration: '45 min', price: '150 zł' },
                { name: 'Terapia wybiórczości pokarmowej', duration: '45 min', price: '150 zł' },
            ],
        },
        {
            title: 'Zajęcia grupowe', icon: 'groups',
            items: [
                { name: 'Logorytmika', duration: '45 min', price: '60 zł', description: 'Cena za jedne zajęcia' },
                { name: 'Sensoplastyka®', duration: '60 min', price: '70 zł', description: 'Cena za jedne zajęcia' },
                { name: 'TUS – Trening Umiejętności Społecznych', duration: '60 min', price: '90 zł', description: 'Cena za jedne zajęcia' },
            ],
        },
    ];

    protected readonly notes: readonly Note[] = [
        { icon: 'payments', title: 'Płatność', desc: 'Akceptujemy gotówkę oraz BLIK / przelew na miejscu.' },
        { icon: 'event_busy', title: 'Odwoływanie wizyt', desc: 'Wizytę można bezpłatnie odwołać minimum 24h przed terminem.' },
        { icon: 'receipt_long', title: 'Faktury', desc: 'Na życzenie wystawiamy fakturę – również imienne dla rodzica.' },
        { icon: 'local_offer', title: 'Karnety', desc: 'Stałym pacjentom proponujemy korzystne pakiety karnetowe.' },
    ];

    constructor() {
        this.seo.update({
            title: 'Cennik – Logopeda Kielce | Mówię Wam',
            description:
                'Cennik usług logopedycznych, neurologopedycznych, terapii ręki i zajęć grupowych w centrum Mówię Wam w Kielcach i województwie świętokrzyskim. Diagnoza od 150 zł, terapia od 130 zł.',
            url: '/cennik',
            keywords: ['cennik logopeda Kielce', 'logopeda świętokrzyskie'],
        });
        this.seo.setPageSchemas(
            this.seo.breadcrumbSchema([
                { name: 'Strona główna', url: '/' },
                { name: 'Cennik', url: '/cennik' },
            ]),
        );
    }
}
