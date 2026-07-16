import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { IntersectionObserverDirective } from '../../directive/intersection-observer.directive';
import { SeoService } from '../../services/seo.service';

interface TeamMember {
    name: string;
    role: string;
    description?: string;
    qualifications: string[];
    initials: string;
}

interface ValueItem { icon: string; title: string; desc: string; }

@Component({
    selector: 'app-o-nas',
    imports: [MatIcon, RouterLink, IntersectionObserverDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './o-nas.component.html',
    styleUrl: './o-nas.component.scss',
})
export class ONasComponent {
    private readonly seo = inject(SeoService);

    protected readonly team: readonly TeamMember[] = [
        { name: 'Julia Jakaśtam', role: 'Logopeda', initials: 'KC',
            qualifications: ['Logopeda ogólny', 'Terapeuta wczesnej interwencji', 'Instruktorka logorytmiki'] },
        { name: 'Justyna Nowacka', role: 'Neurologopeda', initials: 'JN',
            qualifications: ['Neurologopeda', 'Logopeda ogólny', 'Terapeuta ręki I i II stopnia'] },
        { name: 'Weronika Prus', role: 'Logopeda', initials: 'WP',
            qualifications: ['Logopeda ogólny', 'Terapeuta TUS', 'Terapeuta wybiórczości pokarmowej'] },
    ];

    protected readonly values: readonly ValueItem[] = [
        { icon: 'favorite', title: 'Pasja', desc: 'Każdą terapię prowadzimy z ogromnym sercem i zaangażowaniem.' },
        { icon: 'verified', title: 'Doświadczenie', desc: 'Stale podnosimy swoje kwalifikacje – kursy i szkolenia to nasza codzienność.' },
        { icon: 'auto_awesome', title: 'Indywidualne podejście', desc: 'Każde dziecko jest inne – plan terapii zawsze dopasowujemy do jego potrzeb.' },
        { icon: 'spa', title: 'Komfort i bezpieczeństwo', desc: 'Dbamy o atmosferę, w której zarówno dziecko, jak i rodzic czują się dobrze.' },
    ];

    constructor() {
        this.seo.update({
            title: 'O nas – Centrum Mówię Wam, Kielce',
            description:
                'Poznaj nasze centrum logopedyczno-terapeutyczne w Kielcach i województwie świętokrzyskim – zespół neurologopedów, logopedów i terapeutów ręki pod kierunkiem mgr Dominiki Gębskiej.',
            url: '/o-nas',
            keywords: ['logopeda Kielce', 'logopeda świętokrzyskie', 'Mówię Wam', 'Dominika Gębska'],
        });
        this.seo.setPageSchemas(
            this.seo.breadcrumbSchema([
                { name: 'Strona główna', url: '/' },
                { name: 'O nas', url: '/o-nas' },
            ]),
        );
    }
}
