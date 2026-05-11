import { Component } from '@angular/core';
import {NgForOf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {IntersectionObserverDirective} from "../../directive/intersection-observer.directive";

interface TeamMember {
  name: string;
  role: string;
  description?: string;
  qualifications: string[];
  initials: string;
}

@Component({
  selector: 'app-o-nas',
  imports: [
    NgForOf,
    MatIcon,
    IntersectionObserverDirective
  ],
  templateUrl: './o-nas.component.html',
  styleUrl: './o-nas.component.scss'
})
export class ONasComponent {

  team: TeamMember[] = [
    {
      name: 'Klaudia Chrzęszczyk',
      role: 'Logopeda',
      initials: 'KC',
      qualifications: [
        'Logopeda ogólny',
        'Terapeuta wczesnej interwencji',
        'Instruktorka logorytmiki'
      ]
    },
    {
      name: 'Justyna Nowacka',
      role: 'Neurologopeda',
      initials: 'JN',
      qualifications: [
        'Neurologopeda',
        'Logopeda ogólny',
        'Terapeuta ręki I i II stopnia'
      ]
    },
    {
      name: 'Weronika Prus',
      role: 'Logopeda',
      initials: 'WP',
      qualifications: [
        'Logopeda ogólny',
        'Terapeuta TUS',
        'Terapeuta wybiórczości pokarmowej'
      ]
    }
  ];

  values = [
    {icon: 'favorite', title: 'Pasja', desc: 'Każdą terapię prowadzimy z ogromnym sercem i zaangażowaniem.'},
    {icon: 'verified', title: 'Doświadczenie', desc: 'Stale podnosimy swoje kwalifikacje – kursy i szkolenia to nasza codzienność.'},
    {icon: 'auto_awesome', title: 'Indywidualne podejście', desc: 'Każde dziecko jest inne – plan terapii zawsze dopasowujemy do jego potrzeb.'},
    {icon: 'spa', title: 'Komfort i bezpieczeństwo', desc: 'Dbamy o atmosferę, w której zarówno dziecko, jak i rodzic czują się dobrze.'}
  ];
}
