import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IntersectionObserverDirective } from '../../directive/intersection-observer.directive';
import { SeoService } from '../../services/seo.service';

interface Step { icon: string; title: string; desc: string; }
interface Prep { icon: string; title: string; desc: string; }
interface Faq { q: string; a: string; }

@Component({
    selector: 'app-pierwsza-wizyta',
    imports: [MatIcon, RouterLink, IntersectionObserverDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './pierwsza-wizyta.component.html',
    styleUrl: './pierwsza-wizyta.component.scss',
})
export class PierwszaWizytaComponent {
    private readonly seo = inject(SeoService);

    protected readonly steps: readonly Step[] = [
        { icon: 'phone_in_talk', title: 'Skontaktuj się z nami', desc: 'Zadzwoń, napisz SMS lub maila. Odpowiemy na wszystkie pytania, ustalimy potrzeby i zarezerwujemy dogodny termin.' },
        { icon: 'event_available', title: 'Umów termin diagnozy', desc: 'Pierwsza wizyta to spokojna rozmowa, ocena rozwoju mowy oraz omówienie naszych obserwacji.' },
        { icon: 'fact_check', title: 'Diagnoza i plan terapii', desc: 'Otrzymujesz pisemną opinię logopedyczną wraz z indywidualnie dobranym planem dalszej pracy.' },
        { icon: 'autorenew', title: 'Regularna terapia', desc: 'Spotykamy się systematycznie. Po każdych zajęciach dostajesz wskazówki do pracy w domu.' },
    ];

    protected readonly prepare: readonly Prep[] = [
        { icon: 'badge', title: 'Dane dziecka', desc: 'Imię, nazwisko, data urodzenia.' },
        { icon: 'description', title: 'Wcześniejsze opinie', desc: 'Jeśli posiadasz – weź ze sobą wcześniejsze diagnozy lub opinie.' },
        { icon: 'mood', title: 'Spokój i czas', desc: 'Zaplanuj wizytę bez pośpiechu – pierwsze spotkanie trwa ok. 60 minut.' },
        { icon: 'toys', title: 'Ulubiona zabawka', desc: 'Maluch może zabrać coś, co da mu poczucie bezpieczeństwa.' },
    ];

    protected readonly faqs: readonly Faq[] = [
        { q: 'Ile trwa pierwsza wizyta?', a: 'Diagnoza logopedyczna trwa około 60 minut. Czas obejmuje rozmowę z rodzicem oraz badanie dziecka.' },
        { q: 'Czy podczas pierwszej wizyty już ćwiczymy?', a: 'Pierwsza wizyta jest poświęcona przede wszystkim diagnozie. Pierwsze ćwiczenia rodzic dostaje na koniec spotkania.' },
        { q: 'Czy muszę zostawać z dzieckiem w gabinecie?', a: 'Zależy od wieku dziecka i naszych obserwacji. Często rodzic uczestniczy w pierwszej części spotkania, a my dostosowujemy się do dziecka.' },
        { q: 'Czy diagnoza jest jednorazowa?', a: 'Czasem do pełnej diagnozy potrzebujemy 2-3 spotkań – zwłaszcza u młodszych dzieci, które dopiero oswajają się z gabinetem.' },
    ];

    constructor() {
        this.seo.update({
            title: 'Pierwsza wizyta u logopedy – jak się przygotować | Mówię Wam',
            description:
                'Krok po kroku: jak wygląda pierwsza wizyta u logopedy w centrum Mówię Wam w Kielcach i województwie świętokrzyskim. Co zabrać, ile trwa diagnoza, czy rodzic jest obecny na zajęciach.',
            url: '/pierwsza-wizyta',
            keywords: ['pierwsza wizyta u logopedy', 'logopeda Kielce', 'logopeda świętokrzyskie'],
        });

        this.seo.setPageSchemas(
            this.seo.breadcrumbSchema([
                { name: 'Strona główna', url: '/' },
                { name: 'Pierwsza wizyta', url: '/pierwsza-wizyta' },
            ]),
            this.seo.faqSchema(this.faqs),
        );
    }
}
