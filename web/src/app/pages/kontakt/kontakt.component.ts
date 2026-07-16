import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { IntersectionObserverDirective } from '../../directive/intersection-observer.directive';
import { SeoService } from '../../services/seo.service';

const MIN_FILL_TIME_MS = 2500;

@Component({
    selector: 'app-kontakt',
    imports: [ReactiveFormsModule, MatIcon, IntersectionObserverDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './kontakt.component.html',
    styleUrl: './kontakt.component.scss',
})
export class KontaktComponent {
    private readonly fb = inject(FormBuilder);
    private readonly platformId = inject(PLATFORM_ID);
    private readonly doc = inject(DOCUMENT);
    private readonly seo = inject(SeoService);

    protected readonly submitted = signal(false);
    protected readonly sent = signal(false);
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
                'Skontaktuj się z centrum Mówię Wam w Kielcach. Telefon: 509 792 650. E-mail: mowiewam.logopeda@gmail.com. Adres: ul. Jurajska 1D/u20a (klatka C/D), os. Ślichowice.',
            url: '/kontakt',
        });

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

        const data = this.form.getRawValue();
        const mailtoLink =
            `mailto:mowiewam.logopeda@gmail.com?subject=${encodeURIComponent('[Mówię Wam] ' + data.subject)}` +
            `&body=${encodeURIComponent(
                `Imię: ${data.name}\nE-mail: ${data.email}\nTelefon: ${data.phone || '-'}\n\n${data.message}`,
            )}`;
        this.doc.defaultView?.location.assign(mailtoLink);

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
