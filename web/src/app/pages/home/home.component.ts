import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { StarRatingComponent } from '../../components/star-rating/star-rating.component';
import { IntersectionObserverDirective } from '../../directive/intersection-observer.directive';
import { InstagramPost } from '../../dto/InstagramPost';
import { Review } from '../../dto/Reviews';
import { GooglePlacesService } from '../../services/google-places.service';
import { InstagramService } from '../../services/instagram.service';
import { SeoService } from '../../services/seo.service';

const IG_PROFILE_URL = 'https://www.instagram.com/mowie.wam/';
const IG_MAX_TILES = 8;
const IG_VARIANTS: readonly IgPostVariant[] = ['secondary', 'primary', 'tertiary', 'cream'];

function firstLine(text: string, maxChars: number): string {
    const line = (text.split(/\r?\n/)[0] ?? '').trim();
    return line.length > maxChars ? line.slice(0, maxChars - 1).trimEnd() + '…' : line;
}

function mapMediaType(t: InstagramPost['media_type']): IgPostType {
    switch (t) {
        case 'VIDEO': return 'video';
        case 'CAROUSEL_ALBUM': return 'carousel';
        default: return 'photo';
    }
}

function toTile(post: InstagramPost, idx: number): IgTile {
    const caption = post.caption ?? '';
    const heading = firstLine(caption, 40) || 'Zobacz na Instagramie';
    const rest = caption.slice(heading.length).replace(/^[\s\-–—:.]+/, '').trim();
    const sub = firstLine(rest, 55);
    const previewSrc =
        post.media_type === 'VIDEO' && post.thumbnail_url
            ? post.thumbnail_url
            : post.media_url;
    return {
        heading,
        sub: sub || '@mowie.wam',
        type: mapMediaType(post.media_type),
        variant: IG_VARIANTS[idx % IG_VARIANTS.length],
        mediaUrl: previewSrc,
        permalink: post.permalink,
    };
}

interface ServiceItem { icon: string; title: string; desc: string; }
interface ValueItem { icon: string; title: string; desc: string; }
interface ProcessStepCta { label: string; href: string; external?: boolean; }
interface ContactLinks { phone: string; sms: string; }
interface ProcessStep {
    title: string;
    desc: string;
    cta?: ProcessStepCta;
    contactLinks?: ContactLinks;
}
type IgPostType = 'photo' | 'video' | 'carousel';
type IgPostVariant = 'primary' | 'secondary' | 'tertiary' | 'cream';
interface IgTile {
    heading: string;
    sub: string;
    type: IgPostType;
    variant: IgPostVariant;
    emoji?: string;
    mediaUrl?: string;
    permalink?: string;
}
interface IgProfileStat { value: string; label: string; }

// TODO: podmienić na finalny link do rezerwacji w Logoplan
const LOGOPLAN_URL = '#';
const CONTACT_PHONE = '+48509792650';

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
        () => this.placesResponse()?.result?.reviews ?? [],
    );
    protected readonly hasReviews = computed(() => this.reviews().length > 0);
    protected readonly googleRating = computed(() => {
        const rating = this.placesResponse()?.result?.rating;
        return typeof rating === 'number' ? rating.toFixed(1) : '5.0';
    });

    protected readonly services: readonly ServiceItem[] = [
        { icon: 'fact_check', title: 'Diagnoza logopedyczna / neurologopedyczna', desc: 'Wywiad, badanie, plan terapii i zalecenia.' },
        { icon: 'record_voice_over', title: 'Terapia logopedyczna / neurologopedyczna', desc: 'Niemowlęta, dzieci i dorośli – indywidualnie dobrany plan.' },
        { icon: 'spa', title: 'Terapia miofunkcjonalna', desc: 'Wsparcie oddychania nosem, pozycji języka, warg i żuchwy; nauka gryzienia, żucia i połykania.' },
        { icon: 'medical_services', title: 'Przygotowanie do zabiegów', desc: 'Frenotomia, adenotomia, operacje ortognatyczne – opieka przed i po.' },
        { icon: 'bedtime', title: 'Bruksizm', desc: 'Praca nad napięciem mięśniowym i nawykami parafunkcyjnymi.' },
        { icon: 'spellcheck', title: 'Wady wymowy', desc: 'Seplenienie, brak realizacji głosek, mowa „niezrozumiała".' },
        { icon: 'child_care', title: 'Opóźniony rozwój mowy', desc: 'Nauka mówienia i komunikacji u najmłodszych.' },
        { icon: 'baby_changing_station', title: 'Wsparcie noworodków i niemowląt', desc: 'Karmienie piersią, dobór butelki, smoczka, gryzaków, wsparcie laktacji.' },
        { icon: 'restaurant', title: 'Rozszerzanie diety', desc: 'Nauka jedzenia od urodzenia do 24. miesiąca życia.' },
        { icon: 'psychology', title: 'Afazja', desc: 'Terapia komunikacji po incydentach neurologicznych.' },
        { icon: 'interpreter_mode', title: 'Dyzartria', desc: 'Praca nad wyrazistością mowy przy zaburzeniach neurologicznych.' },
        { icon: 'forum', title: 'Zaburzenia komunikacji, AAC', desc: 'Nauka komunikacji, dobór odpowiednich urządzeń i metod komunikacji.' },
        { icon: 'graphic_eq', title: 'Zaburzenia głosu', desc: 'Chrypka, wystąpienia publiczne, guzki głosowe, polipy, torbiele, niedomykalność.' },
        { icon: 'speaker_notes', title: 'Jąkanie', desc: 'Terapia płynności mowy u dzieci i dorosłych.' },
        { icon: 'menu_book', title: 'Nauka czytania', desc: 'Sylabowa metoda symultaniczno-sekwencyjna – nauka, która naprawdę działa.' },
        { icon: 'pan_tool', title: 'Terapia ręki', desc: 'Precyzja, koordynacja i grafomotoryka – I i II stopień.' },
    ];

    protected readonly values: readonly ValueItem[] = [
        { icon: 'school', title: 'Najwyższe kwalifikacje', desc: 'Cały zespół stale się doszkala.' },
        { icon: 'handshake', title: 'Współpraca', desc: 'Współpracujemy z najlepszymi specjalistami w Kielcach – co skutkuje szybkim i trwałym efektem.' },
        { icon: 'self_improvement', title: 'Uważność', desc: 'Szacunek, brak pośpiechu i pełne zaangażowanie terapeutów.' },
        { icon: 'favorite', title: 'Pasja', desc: 'Każda z nas kocha to, co robi!' },
    ];

    protected readonly processSteps: readonly ProcessStep[] = [
        {
            title: 'Kontakt i rejestracja',
            desc: 'Zadzwoń lub napisz SMS albo zarezerwuj wizytę online.',
            contactLinks: { phone: CONTACT_PHONE, sms: CONTACT_PHONE },
            cta: { label: 'Rezerwacja przez Logoplan', href: LOGOPLAN_URL, external: true },
        },
        {
            title: 'Przygotowanie do wizyty',
            desc: 'Po zapisie na pierwsze spotkanie omawiamy je telefonicznie – dzięki temu wiesz, czego się spodziewać.',
        },
        {
            title: 'Konsultacja',
            desc: 'Zbieramy szczegółowy wywiad, przeprowadzamy badanie, omawiamy plan terapii i przekazujemy zalecenia po wizycie.',
        },
        {
            title: 'Terapia',
            desc: 'Ustalana w zależności od wieku i potrzeb – np. raz w tygodniu lub raz w miesiącu.',
        },
    ];

    // Fallback wyświetlany gdy Instagram Graph API jest niedostępny (brak
    // konfiguracji, wygaśnięcie tokenu, awaria Meta). Zapewnia że sekcja
    // nigdy nie znika – ważne dla ciągłości designu strony.
    private readonly mockIgPosts: readonly IgTile[] = [
        { emoji: '🗣️', heading: 'Terapia logopedyczna', sub: 'z Panią Dominiką', type: 'video', variant: 'secondary' },
        { emoji: '🎨', heading: 'Sensoplastyka', sub: 'w sobotę o 13:30', type: 'carousel', variant: 'primary' },
        { emoji: '👄', heading: 'Terapia miofunkcjonalna', sub: 'praca z językiem i wargami', type: 'photo', variant: 'tertiary' },
        { emoji: '🤱', heading: 'Karmienie piersią', sub: 'wsparcie od pierwszych dni', type: 'video', variant: 'cream' },
        { emoji: '🎵', heading: 'Logorytmika', sub: 'muzyka, która uczy mówić', type: 'carousel', variant: 'primary' },
        { emoji: '📚', heading: 'Nauka czytania', sub: 'metoda symultaniczno-sekwencyjna', type: 'photo', variant: 'tertiary' },
        { emoji: '👶', heading: 'Wsparcie niemowląt', sub: 'od pierwszych dni życia', type: 'video', variant: 'cream' },
        { emoji: '🎓', heading: 'Szkolenia', sub: 'ciągle się dokształcamy', type: 'carousel', variant: 'secondary' },
    ];

    private readonly realIgPosts = toSignal(
        inject(InstagramService).getPosts(IG_MAX_TILES),
        { initialValue: [] as ReadonlyArray<InstagramPost> },
    );

    protected readonly igTiles = computed<readonly IgTile[]>(() => {
        const real = this.realIgPosts();
        if (real.length === 0) return this.mockIgPosts;
        const mapped = real.map((p, i) => toTile(p, i));
        return mapped.length < IG_MAX_TILES
            ? [...mapped, ...this.mockIgPosts.slice(mapped.length)]
            : mapped.slice(0, IG_MAX_TILES);
    });

    protected readonly igProfileUrl = IG_PROFILE_URL;

    protected readonly igProfileStats: readonly IgProfileStat[] = [
        { value: '324', label: 'Posty' },
        { value: '1.2K', label: 'Obserwujących' },
        { value: '186', label: 'Obserwowani' },
    ];

    protected readonly slideConfig = {
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: false,
        pauseOnFocus: false,
        dots: false,
        arrows: false,
        responsive: [
            { breakpoint: 1200, settings: { slidesToShow: 2, slidesToScroll: 1 } },
            { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1, fade: true, dots: false } },
        ],
    };

    constructor() {
        this.seo.update({
            title: 'Mówię Wam – Logopeda Kielce i świętokrzyskie',
            description:
                'Centrum Logopedyczno-Terapeutyczne Mówię Wam w Kielcach (os. Ślichowice) – logopeda i neurologopeda dla mieszkańców Kielc i województwa świętokrzyskiego. Diagnoza, terapia mowy, terapia ręki, wczesna interwencja.',
            url: '/',
            keywords: [
                'logopeda Kielce',
                'logopeda świętokrzyskie',
                'neurologopeda Kielce',
                'terapia logopedyczna Kielce',
                'terapia ręki Kielce',
                'Mówię Wam',
                'Dominika Gębska',
                'Ślichowice',
            ],
        });
        this.seo.setPageSchemas(
            this.seo.breadcrumbSchema([{ name: 'Strona główna', url: '/' }]),
        );
    }
}
