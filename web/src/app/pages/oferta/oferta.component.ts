import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IntersectionObserverDirective } from '../../directive/intersection-observer.directive';
import { SeoService } from '../../services/seo.service';

interface ServiceMeta { duration?: string; for?: string; }

interface OfferService {
    icon: string;
    title: string;
    short: string;
    paragraphs: string[];
    helpsWhen?: string[];
    includes?: string[];
    meta?: ServiceMeta;
    highlight?: boolean;
}

interface OfferCategory {
    id: string;
    eyebrow: string;
    title: string;
    description: string;
    background?: 'cream' | 'white' | 'pink';
    services: OfferService[];
}

interface AnchorChip { id: string; label: string; }
interface AlertSignal { icon: string; age: string; text: string; }
interface Faq { q: string; a: string; }

@Component({
    selector: 'app-oferta',
    imports: [MatIcon, RouterLink, IntersectionObserverDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './oferta.component.html',
    styleUrl: './oferta.component.scss',
})
export class OfertaComponent {
    private readonly doc = inject(DOCUMENT);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly seo = inject(SeoService);

    protected readonly anchors: readonly AnchorChip[] = [
        { id: 'sygnaly', label: 'Sygnały alarmowe' },
        { id: 'logopedia', label: 'Diagnoza i terapia' },
        { id: 'specjalistyczne', label: 'Specjalistyczne wsparcie' },
        { id: 'grupowe', label: 'Zajęcia grupowe' },
        { id: 'faq', label: 'FAQ' },
    ];

    protected readonly signals: readonly AlertSignal[] = [
        { icon: 'baby_changing_station', age: '0–12 m-cy', text: 'Trudności z karmieniem piersią/butelką, brak gaworzenia, ulewania.' },
        { icon: 'child_friendly', age: '12–18 m-cy', text: 'Brak pierwszych słów, brak reakcji na własne imię.' },
        { icon: 'child_care', age: '2 lata', text: 'Słownik aktywny poniżej 50 słów, brak prostych zdań dwuwyrazowych.' },
        { icon: 'face', age: '3 lata', text: 'Mowa niezrozumiała dla otoczenia, brak zdań prostych z czasownikami.' },
        { icon: 'sentiment_satisfied', age: '4–5 lat', text: 'Wady wymowy: seplenienie, reranie, problemy z głoskami sz, ż, cz, dż.' },
        { icon: 'school', age: '6+ lat', text: 'Trudności z nauką czytania, pisania, koncentracją, grafomotoryką.' },
        { icon: 'air', age: 'każdy wiek', text: 'Oddychanie przez usta, otwarte usta w spoczynku, chrapanie.' },
        { icon: 'restaurant', age: 'każdy wiek', text: 'Wybiórczość pokarmowa, problemy z gryzieniem, połykaniem, krztuszenie.' },
    ];

    protected readonly categories: readonly OfferCategory[] = [
        {
            id: 'logopedia',
            eyebrow: 'Etap pierwszy',
            title: 'Diagnoza i terapia logopedyczna',
            description: 'Wszystko zaczyna się od dokładnej diagnozy. Na jej podstawie planujemy terapię dopasowaną do potrzeb i tempa rozwoju Twojego dziecka.',
            background: 'white',
            services: [
                {
                    icon: 'fact_check', title: 'Diagnoza logopedyczna', short: 'Pierwszy krok do skutecznej terapii.', highlight: true,
                    paragraphs: [
                        'To pierwsze, najważniejsze spotkanie. Poświęcamy mu czas, by spokojnie poznać dziecko, porozmawiać z rodzicem i dokładnie przyjrzeć się rozwojowi mowy.',
                        'Po diagnozie omawiamy każdy element badania, a Ty otrzymujesz pisemną opinię logopedyczną oraz indywidualnie dobrany plan terapii.',
                    ],
                    includes: ['Szczegółowy wywiad z rodzicem', 'Badanie funkcjonowania aparatu mowy', 'Analiza mowy spontanicznej dziecka', 'Standaryzowane testy diagnostyczne', 'Pisemna opinia z planem terapii'],
                    meta: { duration: '60 min', for: 'dzieci i dorośli' },
                },
                {
                    icon: 'spellcheck', title: 'Terapia wad wymowy', short: 'Praca nad poprawną artykulacją głosek.',
                    paragraphs: [
                        'Spotkania nakierowane na usunięcie konkretnej wady wymowy – zniekształconej realizacji głoski lub jej braku. Rozpoczęcie terapii zawsze poprzedza diagnoza.',
                        'Po każdej wizycie rodzic otrzymuje materiały oraz wskazówki do ćwiczeń w domu – bo systematyczna praca to klucz do trwałych efektów.',
                    ],
                    helpsWhen: ['Sepleni (ś, ź, ć, dź zamiast s, z, c, dz lub sz, ż, cz, dż)', 'Reranie – brak głoski [r] lub [r] gardłowe', 'Mowa bezdźwięczna lub zniekształcona', 'Mowa niewyraźna mimo wieku ≥ 4 r.ż.'],
                    meta: { duration: '45 min', for: 'dzieci i dorośli' },
                },
                {
                    icon: 'child_care', title: 'Terapia opóźnionego rozwoju mowy (ORM)', short: 'Wsparcie dla maluchów, które „nie chcą" jeszcze mówić.',
                    paragraphs: [
                        'Spotkania adresowane do najmłodszych dzieci, u których stwierdzono opóźnienia w rozwoju mowy. Terapia prowadzona jest w formie zabawy – po prostu fascynującej dla malucha.',
                        'Naszym celem jest zwiększenie liczby słów, motywowanie do budowania prostych zdań oraz ogólna poprawa jakości komunikacji z otoczeniem.',
                    ],
                    helpsWhen: ['Maluch nie mówi pierwszych słów po 18 m-cu życia', 'Słownik aktywny poniżej 50 słów po 2 r.ż.', 'Brak prostych zdań dwuwyrazowych po 2,5 r.ż.', 'Mowa niezrozumiała dla otoczenia po 3 r.ż.'],
                    meta: { duration: '45 min', for: 'maluchy 1–4 lata' },
                },
                {
                    icon: 'psychology', title: 'Terapia neurologopedyczna', short: 'Spektrum autyzmu, afazja, dziecięca apraksja mowy.',
                    paragraphs: [
                        'Każde spotkanie dopasowujemy do możliwości i potrzeb dziecka. W terapii apraksji i afazji korzystamy z zasad motorycznego uczenia się.',
                        'Pracując z dziećmi w spektrum autyzmu, kierujemy się aktualną wiedzą i sprawdzonymi metodami – budujemy reakcję na imię, wspólne pole uwagi, korzystamy z komunikacji wspomagającej (AAC).',
                    ],
                    helpsWhen: ['Diagnoza spektrum autyzmu lub Aspergera', 'Afazja rozwojowa lub po przebytym udarze', 'Dziecięca apraksja mowy (CAS)', 'Niepełnosprawność intelektualna', 'Zaburzenia przetwarzania słuchowego'],
                    meta: { duration: '45–60 min', for: 'dzieci od 1. r.ż.' },
                },
            ],
        },
        {
            id: 'specjalistyczne',
            eyebrow: 'Etap drugi',
            title: 'Specjalistyczne wsparcie',
            description: 'Pełen rozwój dziecka to mowa, ale również prawidłowy oddech, jedzenie, motoryka i zmysły. Dla każdego z tych obszarów mamy indywidualną terapię.',
            background: 'pink',
            services: [
                {
                    icon: 'air', title: 'Terapia miofunkcjonalna', short: 'Język na właściwym miejscu, prawidłowy oddech, harmonijny zgryz.',
                    paragraphs: [
                        'Praca skupiona na normalizacji napięcia mięśniowego układu stomatognatycznego, nauce prawidłowej pozycji spoczynkowej żuchwy, warg i języka.',
                        'Dzięki temu funkcje takie jak oddychanie, gryzienie, żucie i połykanie przebiegają prawidłowo – co przekłada się na zdrowy wzrost twarzoczaszki i piękny zgryz.',
                    ],
                    helpsWhen: ['Oddychanie torem ustnym', 'Otwarte usta w spoczynku', 'Wsparcie leczenia ortodontycznego', 'Język spoczywa na dnie jamy ustnej'],
                    meta: { duration: '45 min', for: 'dzieci i dorośli' },
                },
                {
                    icon: 'baby_changing_station', title: 'Wczesna interwencja logopedyczna', short: 'Opieka nad noworodkiem i niemowlęciem.',
                    paragraphs: [
                        'Prowadzimy terapię noworodków i niemowląt – wsparcie karmienia piersią/butelką, dobór odpowiednich smoczków, instruktaż opieki nad maluszkiem.',
                        'Diagnozujemy skrócone wędzidełka jamy ustnej, przygotowujemy do zabiegu korekty oraz opiekujemy się pacjentem po zabiegu. Pomagamy także przy trudnościach z rozszerzaniem diety.',
                    ],
                    helpsWhen: ['Trudności w karmieniu piersią lub butelką', 'Częste ulewania, niepokój przy jedzeniu', 'Podejrzenie skróconego wędzidełka', 'Trudności z rozszerzaniem diety'],
                    meta: { duration: '60 min', for: 'noworodki i niemowlęta' },
                },
                {
                    icon: 'pan_tool', title: 'Diagnoza i terapia ręki', short: 'Precyzja, koordynacja, grafomotoryka – I i II stopień.',
                    paragraphs: [
                        'Wspieramy rozwój małej motoryki, grafomotoryki i koordynacji wzrokowo-ruchowej. Przygotowujemy dziecko do nauki pisania w sposób bezstresowy i atrakcyjny.',
                        'Pierwsze spotkanie to diagnoza – sprawdzamy napięcie mięśniowe, chwyt, ułożenie ciała, lateralizację. Następnie planujemy ćwiczenia dopasowane indywidualnie.',
                    ],
                    helpsWhen: ['Nieprawidłowo trzyma narzędzie pisarskie', 'Unika aktywności plastycznych', 'Zbyt mocno lub zbyt delikatnie naciska kredką', 'Obniżona sprawność grafomotoryczna', 'Zamiennie posługuje się prawą i lewą ręką'],
                    meta: { duration: '45 min', for: 'dzieci od 3 r.ż.' },
                },
                {
                    icon: 'menu_book', title: 'Nauka czytania metodą sylabową', short: 'Symultaniczno-sekwencyjna metoda – nauka, która naprawdę działa.',
                    paragraphs: [
                        'Uczymy czytania sylabami (bez głoskowania po literze). Dzięki temu czytanie od początku jest płynne, a dziecko nie musi „rozgryzać" każdego słowa.',
                        'Z najmłodszymi dziećmi spotkania prowadzimy w formie zabawy. Oprócz nauki pięknego czytania, zajęcia wspomagają pamięć, koncentrację i naukę pisania.',
                    ],
                    helpsWhen: ['Dziecko od 3 r.ż. wykazujące zainteresowanie literami', 'Wsparcie nauki w klasach 1–3', 'Trudności z syntezą i analizą sylabową', 'Profilaktyka dysleksji'],
                    meta: { duration: '45 min', for: 'dzieci od 3 r.ż.' },
                },
                {
                    icon: 'restaurant', title: 'Terapia wybiórczości pokarmowej', short: 'Wsparcie dla małych „niejadków".',
                    paragraphs: [
                        'Pracujemy z dziećmi, które mają trudności z jedzeniem – odmawiają nowych smaków, konsystencji, wybierają tylko kilka produktów.',
                        'Łączymy pracę nad sferą sensoryczną z konsultacjami dla rodziców. Krok po kroku rozszerzamy doświadczenia smakowe dziecka, dbając o jego komfort.',
                    ],
                    helpsWhen: ['Dziecko je tylko kilka wybranych produktów', 'Niechęć do nowych konsystencji lub smaków', 'Krztuszenie się przy jedzeniu', 'Stres w trakcie posiłków – własny lub rodzica'],
                    meta: { duration: '45 min', for: 'dzieci od 1 r.ż.' },
                },
                {
                    icon: 'hearing', title: 'Terapia funkcji słuchowych', short: 'Słyszę – ale czy odbieram? Trening percepcji słuchowej.',
                    paragraphs: [
                        'Prowadzimy terapię funkcji słuchowych w ramach terapii logopedycznej. Wykorzystujemy programy multimedialne oraz słuchawki Forbrain z przewodnictwem kostnym.',
                        'Terapia wspiera rozwój pamięci słuchowej, koncentracji oraz poprawia jakość komunikacji.',
                    ],
                    helpsWhen: ['Dziecko nie reaguje na polecenia mimo dobrego słuchu', 'Trudności z rozumieniem złożonych wypowiedzi', 'Słaba koncentracja i pamięć słuchowa', 'Wsparcie nauki czytania i pisania'],
                    meta: { duration: '45 min', for: 'dzieci od 4 r.ż.' },
                },
            ],
        },
        {
            id: 'grupowe',
            eyebrow: 'Etap trzeci',
            title: 'Zajęcia grupowe',
            description: 'Razem raźniej! Rozwijamy komunikację, kreatywność i kompetencje społeczne w bezpiecznej grupie rówieśniczej.',
            background: 'cream',
            services: [
                {
                    icon: 'music_note', title: 'Logorytmika', short: 'Muzyka, ruch i mowa w jednej przygodzie.',
                    paragraphs: [
                        'Zajęcia łączące śpiewanie piosenek, pracę nad melodią, rytmem i grą na prostych instrumentach. To jedna z najprzyjemniejszych form stymulacji mowy.',
                        'Niezwykle rozwijają pamięć, koncentrację, percepcję słuchową i koordynację ruchową – wszystko przy wybuchach śmiechu i radości.',
                    ],
                    includes: ['Piosenki i rytmiczanki', 'Gra na prostych instrumentach', 'Ćwiczenia oddechowe i głosowe', 'Zabawy ruchowe z elementem mowy'],
                    meta: { duration: '45 min', for: 'maluchy i przedszkolaki' },
                },
                {
                    icon: 'palette', title: 'Sensoplastyka®', short: 'Stymulacja zmysłów przez sztukę.',
                    paragraphs: [
                        'Twórcza zabawa z bezpiecznymi, jadalnymi materiałami. Dzieci tworzą, doświadczają, mieszają, wąchają – w pełni angażując zmysły.',
                        'To nie tylko świetna zabawa – Sensoplastyka rozwija małą motorykę, kreatywność, uczy współpracy i odporności na bałagan (rodzica też 😉).',
                    ],
                    includes: ['Bezpieczne, jadalne barwniki i masy', 'Pełna swoboda twórcza dziecka', 'Praca w małej grupie', 'Dyplom uczestnika po cyklu'],
                    meta: { duration: '60 min', for: 'dzieci od 6 m.ż.' },
                },
                {
                    icon: 'groups', title: 'Trening Umiejętności Społecznych (TUS)', short: 'Komunikacja, emocje i relacje rówieśnicze.',
                    paragraphs: [
                        'Zajęcia w małej grupie, w której dzieci ćwiczą rozpoznawanie emocji, komunikację, radzenie sobie z trudnymi sytuacjami i nawiązywanie relacji.',
                        'TUS jest szczególnie cenny dla dzieci nieśmiałych, w spektrum autyzmu, z trudnościami w nawiązywaniu kontaktów oraz z nadmierną reaktywnością.',
                    ],
                    helpsWhen: ['Dziecko ma trudności z nawiązywaniem kontaktów', 'Spektrum autyzmu / Asperger', 'Wybuchy emocji, trudność z ich rozpoznaniem', 'Nieśmiałość uniemożliwiająca funkcjonowanie w grupie'],
                    meta: { duration: '60 min', for: 'dzieci 5–14 lat' },
                },
            ],
        },
    ];

    protected readonly faqs: readonly Faq[] = [
        { q: 'Od jakiego wieku mogę przyprowadzić dziecko?', a: 'Pracujemy z dziećmi w każdym wieku. Już u kilkumiesięcznego niemowlaka warto obserwować rozwój komunikacji – zachęcamy do konsultacji wczesnej interwencji nawet od 6. miesiąca życia.' },
        { q: 'Skąd wiem, że moje dziecko potrzebuje logopedy?', a: 'Jeśli masz wątpliwości – zadzwoń. Czasem jedna konsultacja wystarczy, by uspokoić rodzica. Najczęstsze sygnały to: brak gaworzenia, opóźniony rozwój mowy, problemy z artykulacją po 4 r.ż., problemy z jedzeniem czy oddychanie przez usta.' },
        { q: 'Ile trwa terapia?', a: 'To zawsze indywidualna sprawa. Niektóre wady wymowy można wypracować w kilka miesięcy, inne wymagają systematycznej, dłuższej pracy. Wszystko omawiamy podczas diagnozy.' },
        { q: 'Czy rodzic uczestniczy w zajęciach?', a: 'W przypadku małych dzieci – często tak. U starszych dziecko zostaje z terapeutą w gabinecie, a rodzic na koniec zajęć dostaje krótkie podsumowanie i wskazówki do pracy w domu.' },
        { q: 'Czy zajęcia są refundowane przez NFZ?', a: 'Mówię Wam to placówka prywatna – nie pracujemy w ramach NFZ. Wystawiamy faktury, które można wykorzystać przy ulgach podatkowych lub ubezpieczeniach prywatnych.' },
        { q: 'Czy pracujecie również z dorosłymi?', a: 'Tak. Prowadzimy terapię wad wymowy oraz terapię miofunkcjonalną u dorosłych. Wspieramy także leczenie ortodontyczne oraz pacjentów po przebytych udarach (afazja).' },
    ];

    constructor() {
        this.seo.update({
            title: 'Oferta terapii logopedycznej i ręki | Mówię Wam Kielce',
            description:
                'Pełen zakres terapii dla dziecka: logopedia, neurologopedia, terapia ręki, miofunkcjonalna, wybiórczości pokarmowej, logorytmika, TUS. Kielce, os. Ślichowice.',
            url: '/oferta',
        });

        this.seo.setStructuredData({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: this.faqs.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
        });
    }

    protected scrollTo(id: string, event: Event): void {
        event.preventDefault();
        if (!isPlatformBrowser(this.platformId)) return;
        this.doc.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    protected bgClass(bg?: OfferCategory['background']): string {
        if (bg === 'cream') return 'section-cream';
        if (bg === 'pink') return 'section-bg';
        return '';
    }
}
