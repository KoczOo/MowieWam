import { Component } from '@angular/core';
import {NgForOf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {IntersectionObserverDirective} from "../../directive/intersection-observer.directive";

@Component({
  selector: 'app-pierwsza-wizyta',
  imports: [
    NgForOf,
    MatIcon,
    IntersectionObserverDirective
  ],
  templateUrl: './pierwsza-wizyta.component.html',
  styleUrl: './pierwsza-wizyta.component.scss'
})
export class PierwszaWizytaComponent {
  steps = [
    {
      icon: 'phone_in_talk',
      title: 'Skontaktuj się z nami',
      desc: 'Zadzwoń, napisz SMS lub maila. Odpowiemy na wszystkie pytania, ustalimy potrzeby i zarezerwujemy dogodny termin.'
    },
    {
      icon: 'event_available',
      title: 'Umów termin diagnozy',
      desc: 'Pierwsza wizyta to spokojna rozmowa, ocena rozwoju mowy oraz omówienie naszych obserwacji.'
    },
    {
      icon: 'fact_check',
      title: 'Diagnoza i plan terapii',
      desc: 'Otrzymujesz pisemną opinię logopedyczną wraz z indywidualnie dobranym planem dalszej pracy.'
    },
    {
      icon: 'autorenew',
      title: 'Regularna terapia',
      desc: 'Spotykamy się systematycznie. Po każdych zajęciach dostajesz wskazówki do pracy w domu.'
    }
  ];

  prepare = [
    {icon: 'badge', title: 'Dane dziecka', desc: 'Imię, nazwisko, data urodzenia.'},
    {icon: 'description', title: 'Wcześniejsze opinie', desc: 'Jeśli posiadasz – weź ze sobą wcześniejsze diagnozy lub opinie.'},
    {icon: 'mood', title: 'Spokój i czas', desc: 'Zaplanuj wizytę bez pośpiechu – pierwsze spotkanie trwa ok. 60 minut.'},
    {icon: 'toys', title: 'Ulubiona zabawka', desc: 'Maluch może zabrać coś, co da mu poczucie bezpieczeństwa.'}
  ];

  faqs = [
    {q: 'Ile trwa pierwsza wizyta?', a: 'Diagnoza logopedyczna trwa około 60 minut. Czas obejmuje rozmowę z rodzicem oraz badanie dziecka.'},
    {q: 'Czy podczas pierwszej wizyty już ćwiczymy?', a: 'Pierwsza wizyta jest poświęcona przede wszystkim diagnozie. Pierwsze ćwiczenia rodzic dostaje na koniec spotkania.'},
    {q: 'Czy muszę zostawać z dzieckiem w gabinecie?', a: 'Zależy od wieku dziecka i naszych obserwacji. Często rodzic uczestniczy w pierwszej części spotkania, a my dostosowujemy się do dziecka.'},
    {q: 'Czy diagnoza jest jednorazowa?', a: 'Czasem do pełnej diagnozy potrzebujemy 2-3 spotkań – zwłaszcza u młodszych dzieci, które dopiero oswajają się z gabinetem.'}
  ];
}
