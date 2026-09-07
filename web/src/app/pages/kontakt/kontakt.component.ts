import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { ContactService } from '../../services/contact.service';
import { SeoService } from '../../services/seo.service';

const MIN_FILL_TIME_MS = 2500;

@Component({
    selector: 'app-kontakt',
    imports: [ReactiveFormsModule, MatIcon],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './kontakt.component.html',
    styleUrl: './kontakt.component.scss',
})
export class KontaktComponent {
    private readonly fb = inject(FormBuilder);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly destroyRef = inject(DestroyRef);
    private readonly contact = inject(ContactService);
    private readonly seo = inject(SeoService);

    protected readonly submitted = signal(false);
    protected readonly sending = signal(false);
    protected readonly sent = signal(false);
    protected readonly sendError = signal<string | null>(null);
    protected readonly botBlocked = signal(false);
    protected readonly captchaA = signal(0);
    protected readonly captchaB = signal(0);
    private captchaAnswer = 0;
    private formLoadedAt = Date.now();

    protected readonly form = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.pattern(/^[\d\s+\-()]{7,}$/)]],
        subject: ['Konsultacja logopedyczna', Validators.required],
        message: ['', [Validators.required, Validators.minLength(10)]],
        consent: [false, Validators.requiredTrue],
        captcha: ['', [Validators.required, this.captchaValidator()]],
        // Honeypot – musi pozostać pusty. Boty zwykle wypełniają wszystkie pola.
        website: [''],
    });

    constructor() {
        this.regenerateCaptcha();

        this.seo.update({
            title: 'Kontakt – Logopeda Kielce | Mówię Wam',
            description:
                'Skontaktuj się z centrum Mówię Wam w Kielcach (województwo świętokrzyskie). Telefon: 509 792 650. E-mail: mowiewam.logopeda@gmail.com. Adres: ul. Jurajska 1D/u20a (klatka C/D), os. Ślichowice.',
            url: '/kontakt',
            keywords: ['logopeda Kielce kontakt', 'logopeda świętokrzyskie', 'Mówię Wam'],
        });
        this.seo.setPageSchemas(
            this.seo.breadcrumbSchema([
                { name: 'Strona główna', url: '/' },
                { name: 'Kontakt', url: '/kontakt' },
            ]),
        );

        if (isPlatformBrowser(this.platformId)) {
            this.formLoadedAt = Date.now();
        }
    }

    private regenerateCaptcha(): void {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 1;
        this.captchaA.set(a);
        this.captchaB.set(b);
        this.captchaAnswer = a + b;
    }

    private captchaValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = String(control.value ?? '').trim();
            if (!value) return null;
            const num = Number(value);
            if (Number.isNaN(num)) return { captcha: true };
            return num === this.captchaAnswer ? null : { captcha: true };
        };
    }

    protected onSubmit(): void {
        this.submitted.set(true);
        this.botBlocked.set(false);
        this.sendError.set(null);
        this.sent.set(false);

        if (this.form.value.website) {
            this.botBlocked.set(true);
            return;
        }

        const elapsed = Date.now() - this.formLoadedAt;
        if (elapsed < MIN_FILL_TIME_MS) {
            this.botBlocked.set(true);
            return;
        }

        if (this.form.invalid) return;
        if (!isPlatformBrowser(this.platformId)) return;
        if (this.sending()) return;

        const data = this.form.getRawValue();
        this.sending.set(true);

        this.contact
            .send({
                name: data.name,
                email: data.email,
                phone: data.phone,
                subject: data.subject,
                message: data.message,
                consent: data.consent,
                website: data.website,
            })
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.sending.set(false)),
            )
            .subscribe((result) => {
                if (result === 'ok') {
                    this.sent.set(true);
                    this.submitted.set(false);
                    this.regenerateCaptcha();
                    this.form.reset({
                        subject: 'Konsultacja logopedyczna',
                        consent: false,
                        captcha: '',
                        website: '',
                        name: '',
                        email: '',
                        phone: '',
                        message: '',
                    });
                    this.formLoadedAt = Date.now();
                    return;
                }

                if (result === 'rate_limited') {
                    this.sendError.set(
                        'Wysłano zbyt wiele wiadomości. Spróbuj ponownie za godzinę albo zadzwoń: 509 792 650.',
                    );
                    return;
                }

                if (result === 'unavailable') {
                    this.sendError.set(
                        'Wysyłka e-mail jest chwilowo niedostępna. Zadzwoń lub napisz bezpośrednio: 509 792 650.',
                    );
                    return;
                }

                this.sendError.set(
                    'Nie udało się wysłać wiadomości. Spróbuj ponownie albo zadzwoń: 509 792 650.',
                );
            });
    }

    protected refreshCaptcha(): void {
        this.regenerateCaptcha();
        this.form.controls.captcha.setValue('');
        this.form.controls.captcha.markAsUntouched();
    }

    protected hasError(field: keyof typeof this.form.controls, error: string): boolean {
        const ctrl = this.form.controls[field];
        return ctrl.touched && ctrl.hasError(error);
    }

    protected isInvalid(field: keyof typeof this.form.controls): boolean {
        const ctrl = this.form.controls[field];
        return ctrl.invalid && (ctrl.touched || this.submitted());
    }
}
