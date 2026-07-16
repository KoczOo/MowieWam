import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { StarRatingComponent } from '../../components/star-rating/star-rating.component';
import { IntersectionObserverDirective } from '../../directive/intersection-observer.directive';
import { Review } from '../../dto/Reviews';
import { GooglePlacesService } from '../../services/google-places.service';
import { SeoService } from '../../services/seo.service';

interface ServiceItem { icon: string; title: string; desc: string; }
interface ValueItem { icon: string; title: string; desc: string; }
interface ProcessStep { title: string; desc: string; }
interface IgPost { emoji: string; caption: string; }

const FALLBACK_REVIEWS: readonly Review[] = [
    {
        author_name: 'Mama Pawełka',
        text: 'Polecam serdecznie! Pani Dominika pięknie pomogła synowi przejść przez całą terapię – od układania prostych zdań do czytania. Indywidualne podejście i ciepła atmosfera!',
        relative_time_description: '2 miesiące temu',
        rating: 5,
    },
    {
        author_name: 'Mama Nadii',
        text: 'Cudowne miejsce. Córka zaczęła wypowiadać głoski, których wcześniej nie mówiła i jeszcze nauczyła się czytać. Najważniejsze, że uwielbia chodzić na zajęcia!',
        relative_time_description: '5 miesięcy temu',
        rating: 5,
    },
    {
        author_name: 'Mama Marcelinki',
        text: 'Bardzo polecam to miejsce. Fantastyczne podejście do dzieci i ogromna wiedza Prowadzących. Doskonała konsultacja, nauka przez zabawę, przyjazna atmosfera.',
        relative_time_description: '3 miesiące temu',
        rating: 5,
    },
    {
        author_name: 'Mama Wojtusia',
        text: 'Cudowna atmosfera, ogromna wiedza, podejście do dziecka. Po każdym spotkaniu dostawaliśmy mnóstwo wskazówek do pracy w domu. Z czystym sumieniem polecamy!',
        relative_time_description: '6 miesięcy temu',
        rating: 5,
    },
    {
        author_name: 'Mama Tosi',
        text: 'Super podejście do dzieci, dzieciaki uwielbiają to miejsce. Widać, że Pani Dominika kocha to, co robi. Mega pozytywne wrażenie i efekty już od pierwszego spotkania.',
        relative_time_description: '4 miesiące temu',
        rating: 5,
    },
];

@Component({
    selector: 'app-home',
    imports: [
        SlickCarouselModule,
        StarRatingComponent,
        IntersectionObserverDirective,
        MatIcon,
        RouterLink,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent {
    private readonly seo = inject(SeoService);
    private readonly placesResponse = toSignal(inject(GooglePlacesService).getPlaceDetails(), {
        initialValue: null,
    });

    protected readonly reviews = computed<readonly Review[]>(
        () => this.placesResponse()?.result?.reviews ?? FALLBACK_REVIEWS,
    );

    protected readonly services: readonly ServiceItem[] = [
        { icon: 'record_voice_over', title: 'Diagnoza logopedyczna', desc: 'Dokładna ocena rozwoju mowy i języka – pierwszy krok do skutecznej terapii.' },
        { icon: 'spellcheck', title: 'Terapia wad wymowy', desc: 'Pracujemy nad poprawną artykulacją głosek – w atmosferze zabawy i akceptacji.' },
        { icon: 'child_care', title: 'Opóźniony rozwój mowy', desc: 'Wspieramy rozwój mowy u maluchów, które „nie chcą" jeszcze mówić.' },
        { icon: 'psychology', title: 'Terapia neurologopedyczna', desc: 'Wsparcie dzieci z autyzmem, afazją czy dziecięcą apraksją mowy.' },
        { icon: 'pan_tool', title: 'Terapia ręki', desc: 'Rozwijamy precyzję, koordynację i grafomotorykę – również I i II stopnia.' },
        { icon: 'menu_book', title: 'Nauka czytania', desc: 'Sylabowa metoda symultaniczno-sekwencyjna – nauka, która naprawdę działa.' },
    ];

    protected readonly values: readonly ValueItem[] = [
        { icon: 'favorite', title: 'Ciepło i akceptacja', desc: 'Każde dziecko traktujemy z szacunkiem i wyrozumiałością. Bez pośpiechu.' },
        { icon: 'school', title: 'Najwyższe kwalifikacje', desc: 'Cały zespół stale się dokształca i pracuje na sprawdzonych metodach.' },
        { icon: 'auto_awesome', title: 'Terapia przez zabawę', desc: 'Zajęcia dostosowane są tak, by dziecko z radością wracało na kolejne spotkanie.' },
        { icon: 'groups', title: 'Wsparcie rodzica', desc: 'Po każdej wizycie otrzymujesz konkretne wskazówki i ćwiczenia do wykonania w domu.' },
    ];

    protected readonly processSteps: readonly ProcessStep[] = [
        { title: 'Kontakt i rejestracja', desc: 'Zadzwoń lub napisz – ustalamy dogodny termin pierwszej wizyty i odpowiadamy na wszystkie pytania.' },
        { title: 'Diagnoza', desc: 'Pierwsze spotkanie poświęcamy na rozmowę z rodzicem oraz dokładną ocenę rozwoju mowy i kompetencji dziecka.' },
        { title: 'Plan terapii', desc: 'Wspólnie omawiamy cele i przygotowujemy plan terapii dopasowany do potrzeb Twojego dziecka.' },
        { title: 'Regularna terapia', desc: 'Spotykamy się systematycznie. Po każdych zajęciach dostajesz wskazówki do pracy w domu.' },
    ];

    protected readonly igPosts: readonly IgPost[] = [
        { emoji: '🎵', caption: 'Logorytmika – muzyka, która uczy mówić' },
        { emoji: '🍄', caption: 'Sensoplastyka w sobotę o 13:30' },
        { emoji: '👩‍🎓', caption: 'Szkolenia – ciągle się dokształcamy' },
        { emoji: '💕', caption: 'Pierwsze terapeutyczne spotkanie' },
        { emoji: '🎨', caption: 'Terapia ręki w pełnej krasie' },
        { emoji: '✨', caption: 'Dzień otwarty w naszym Centrum' },
    ];

    protected readonly slideConfig = {
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        dots: true,
        arrows: false,
        responsive: [
            { breakpoint: 1200, settings: { slidesToShow: 2, slidesToScroll: 1 } },
            { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1, fade: true, dots: true } },
        ],
    };

    constructor() {
        this.seo.update({
            title: 'Mówię Wam – Logopeda Kielce, os. Ślichowice',
            description:
                'Centrum Logopedyczno-Terapeutyczne Mówię Wam w Kielcach. Diagnoza i terapia logopedyczna, neurologopedyczna, terapia ręki, wczesna interwencja. Umów wizytę u mgr Dominiki Gębskiej.',
            url: '/',
            keywords: [
                'logopeda Kielce',
                'neurologopeda Kielce',
                'terapia logopedyczna Kielce',
                'terapia ręki Kielce',
                'Mówię Wam',
                'Dominika Gębska',
                'Ślichowice',
            ],
        });
    }
}
