import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  constructor() {
    inject(SeoService).update({
      title: 'Strona nie została znaleziona (404)',
      description: 'Wygląda na to, że podana strona nie istnieje. Wróć na stronę główną Mówię Wam.',
      url: '/404',
      robots: 'noindex,follow',
    });
  }
}
