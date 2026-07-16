import { ChangeDetectionStrategy, Component, RESPONSE_INIT, inject } from '@angular/core';
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
    const responseInit = inject(RESPONSE_INIT, { optional: true });
    if (responseInit) {
      responseInit.status = 404;
    }

    const seo = inject(SeoService);
    seo.update({
      title: 'Strona nie została znaleziona (404)',
      description: 'Wygląda na to, że podana strona nie istnieje. Wróć na stronę główną Mówię Wam.',
      robots: 'noindex,follow',
    });
    seo.setPageSchemas();
  }
}
