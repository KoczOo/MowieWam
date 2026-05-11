import {Component, OnInit} from '@angular/core';
import {SlickCarouselModule} from "ngx-slick-carousel";
import {NgForOf, NgIf} from "@angular/common";
import {GooglePlacesService} from "../../services/google-places.service";
import {Reviews} from "../../dto/Reviews";
import {StarRatingComponent} from "../../components/star-rating/star-rating.component";
import {ActivatedRoute} from "@angular/router";
import {IntersectionObserverDirective} from "../../directive/intersection-observer.directive";
import {MatIcon} from "@angular/material/icon";

interface ServiceItem { icon: string; title: string; desc: string; }
interface ValueItem { icon: string; title: string; desc: string; }
interface ProcessStep { title: string; desc: string; }
interface IgPost { emoji: string; caption: string; }

@Component({
    selector: 'app-home',
    imports: [
        SlickCarouselModule,
        NgForOf,
        NgIf,
        StarRatingComponent,
        IntersectionObserverDirective,
        MatIcon
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
    isVisible = false;
    slides: Reviews[] = [];

    services: ServiceItem[] = [
        {
            icon: 'record_voice_over',
            title: 'Diagnoza logopedyczna',
            desc: 'Dokładna ocena rozwoju mowy i języka – pierwszy krok do skutecznej terapii.'
        },
        {
            icon: 'spellcheck',
            title: 'Terapia wad wymowy',
            desc: 'Pracujemy nad poprawną artykulacją głosek – w atmosferze zabawy i akceptacji.'
        },
        {
            icon: 'child_care',
            title: 'Opóźniony rozwój mowy',
            desc: 'Wspieramy rozwój mowy u maluchów, które „nie chcą” jeszcze mówić.'
        },
        {
            icon: 'psychology',
            title: 'Terapia neurologopedyczna',
            desc: 'Wsparcie dzieci z autyzmem, afazją czy dziecięcą apraksją mowy.'
        },
        {
            icon: 'pan_tool',
            title: 'Terapia ręki',
            desc: 'Rozwijamy precyzję, koordynację i grafomotorykę – również I i II stopnia.'
        },
        {
            icon: 'menu_book',
            title: 'Nauka czytania',
            desc: 'Sylabowa metoda symultaniczno-sekwencyjna – nauka, która naprawdę działa.'
        }
    ];

    values: ValueItem[] = [
        {
            icon: 'favorite',
            title: 'Ciepło i akceptacja',
            desc: 'Każde dziecko traktujemy z szacunkiem i wyrozumiałością. Bez pośpiechu.'
        },
        {
            icon: 'school',
            title: 'Najwyższe kwalifikacje',
            desc: 'Cały zespół stale się dokształca i pracuje na sprawdzonych metodach.'
        },
        {
            icon: 'auto_awesome',
            title: 'Terapia przez zabawę',
            desc: 'Zajęcia dostosowane są tak, by dziecko z radością wracało na kolejne spotkanie.'
        },
        {
            icon: 'groups',
            title: 'Wsparcie rodzica',
            desc: 'Po każdej wizycie otrzymujesz konkretne wskazówki i ćwiczenia do wykonania w domu.'
        }
    ];

    processSteps: ProcessStep[] = [
        {
            title: 'Kontakt i rejestracja',
            desc: 'Zadzwoń lub napisz – ustalamy dogodny termin pierwszej wizyty i odpowiadamy na wszystkie pytania.'
        },
        {
            title: 'Diagnoza',
            desc: 'Pierwsze spotkanie poświęcamy na rozmowę z rodzicem oraz dokładną ocenę rozwoju mowy i kompetencji dziecka.'
        },
        {
            title: 'Plan terapii',
            desc: 'Wspólnie omawiamy cele i przygotowujemy plan terapii dopasowany do potrzeb Twojego dziecka.'
        },
        {
            title: 'Regularna terapia',
            desc: 'Spotykamy się systematycznie. Po każdych zajęciach dostajesz wskazówki do pracy w domu.'
        }
    ];

    igPosts: IgPost[] = [
        {emoji: '🎵', caption: 'Logorytmika – muzyka, która uczy mówić'},
        {emoji: '🍄', caption: 'Sensoplastyka w sobotę o 13:30'},
        {emoji: '👩‍🎓', caption: 'Szkolenia – ciągle się dokształcamy'},
        {emoji: '💕', caption: 'Pierwsze terapeutyczne spotkanie'},
        {emoji: '🎨', caption: 'Terapia ręki w pełnej krasie'},
        {emoji: '✨', caption: 'Dzień otwarty w naszym Centrum'}
    ];

    slideConfig = {
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        dots: true,
        arrows: false,
        responsive: [
            {breakpoint: 1200, settings: {slidesToShow: 2, slidesToScroll: 1}},
            {breakpoint: 768, settings: {slidesToShow: 1, slidesToScroll: 1, fade: true, dots: true}}
        ]
    };

    constructor(private route: ActivatedRoute, private googlePlacesService: GooglePlacesService) {}

    onVisible(): void { this.isVisible = true; }

    ngOnInit() {
        this.route.params.subscribe(() => {
            this.loadPlaceDetails();
        });
    }

    loadPlaceDetails(): void {
        this.googlePlacesService.getPlaceDetails().subscribe({
            next: (response) => {
                if (response?.result?.reviews) {
                    this.slides = response.result.reviews;
                } else {
                    this.slides = this.fallbackReviews();
                }
            },
            error: () => {
                this.slides = this.fallbackReviews();
            }
        });
    }

    private fallbackReviews(): Reviews[] {
        return [
            new Reviews(
                'Mama Pawełka',
                'Polecam serdecznie! Pani Dominika pięknie pomogła synowi przejść przez całą terapię – od układania prostych zdań do czytania. Indywidualne podejście i ciepła atmosfera!',
                '2 miesiące temu',
                5
            ),
            new Reviews(
                'Mama Nadii',
                'Cudowne miejsce. Córka zaczęła wypowiadać głoski, których wcześniej nie mówiła i jeszcze nauczyła się czytać. Najważniejsze, że uwielbia chodzić na zajęcia!',
                '5 miesięcy temu',
                5
            ),
            new Reviews(
                'Mama Marcelinki',
                'Bardzo polecam to miejsce. Fantastyczne podejście do dzieci i ogromna wiedza Prowadzących. Doskonała konsultacja, nauka przez zabawę, przyjazna atmosfera.',
                '3 miesiące temu',
                5
            ),
            new Reviews(
                'Mama Wojtusia',
                'Cudowna atmosfera, ogromna wiedza, podejście do dziecka. Po każdym spotkaniu dostawaliśmy mnóstwo wskazówek do pracy w domu. Z czystym sumieniem polecamy!',
                '6 miesięcy temu',
                5
            ),
            new Reviews(
                'Mama Tosi',
                'Super podejście do dzieci, dzieciaki uwielbiają to miejsce. Widać, że Pani Dominika kocha to, co robi. Mega pozytywne wrażenie i efekty już od pierwszego spotkania.',
                '4 miesiące temu',
                5
            )
        ];
    }
}
