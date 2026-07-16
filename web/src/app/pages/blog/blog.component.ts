import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IntersectionObserverDirective } from '../../directive/intersection-observer.directive';
import { SeoService } from '../../services/seo.service';

interface BlogTopic { icon: string; title: string; desc: string; }

@Component({
    selector: 'app-blog',
    imports: [MatIcon, RouterLink, IntersectionObserverDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './blog.component.html',
    styleUrl: './blog.component.scss',
})
export class BlogComponent {
    private readonly seo = inject(SeoService);

    protected readonly topics: readonly BlogTopic[] = [
        { icon: 'record_voice_over', title: 'Rozwój mowy etap po etapie', desc: 'Czego oczekiwać w danym wieku? Kiedy zacząć się martwić? Przewodnik dla rodziców.' },
        { icon: 'menu_book', title: 'Książki, które rozwijają mowę', desc: 'Subiektywne polecenia – co warto czytać maluchom w różnym wieku.' },
        { icon: 'restaurant', title: 'Jedzenie a mowa', desc: 'Dlaczego prawidłowe gryzienie i konsystencja pokarmu mają znaczenie dla rozwoju mowy.' },
        { icon: 'air', title: 'Oddech, który leczy', desc: 'Jak nauczyć dziecko (i siebie) prawidłowego oddychania przez nos.' },
        { icon: 'toys', title: 'Ćwiczenia do domu', desc: 'Proste zabawy, które wesprą terapię logopedyczną i można robić codziennie.' },
        { icon: 'favorite', title: 'Kulisy Mówię Wam', desc: 'Historie z gabinetu, sukcesy naszych podopiecznych i wnioski z codziennej pracy.' },
    ];

    constructor() {
        this.seo.update({
            title: 'Blog logopedyczny – wkrótce | Mówię Wam',
            description:
                'Wkrótce znajdziesz tu artykuły o rozwoju mowy, ćwiczenia do domu i porady logopedy z Kielc i województwa świętokrzyskiego. Zaglądaj lub śledź nas na Instagramie.',
            url: '/blog',
        });
        this.seo.setPageSchemas(
            this.seo.breadcrumbSchema([
                { name: 'Strona główna', url: '/' },
                { name: 'Blog', url: '/blog' },
            ]),
        );
    }
}
