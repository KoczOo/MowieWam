import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {isPlatformBrowser, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {IntersectionObserverDirective} from "../../directive/intersection-observer.directive";

const MIN_FILL_TIME_MS = 2500;

@Component({
  selector: 'app-kontakt',
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatIcon,
    IntersectionObserverDirective
  ],
  templateUrl: './kontakt.component.html',
  styleUrl: './kontakt.component.scss'
})
export class KontaktComponent implements OnInit {
  form: FormGroup;
  submitted = false;
  sent = false;
  botBlocked = false;

  captchaA = 0;
  captchaB = 0;
  private captchaAnswer = 0;

  private formLoadedAt: number = Date.now();

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.generateCaptcha();
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\d\s+\-()]{7,}$/)]],
      subject: ['Konsultacja logopedyczna', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
      consent: [false, Validators.requiredTrue],
      captcha: ['', [Validators.required, this.captchaValidator()]],
      // Honeypot – musi pozostać pusty. Boty zwykle wypełniają wszystkie pola.
      website: ['']
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.formLoadedAt = Date.now();
    }
  }

  private generateCaptcha() {
    this.captchaA = Math.floor(Math.random() * 8) + 2;
    this.captchaB = Math.floor(Math.random() * 8) + 1;
    this.captchaAnswer = this.captchaA + this.captchaB;
  }

  private captchaValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '').trim();
      if (!value) return null;
      const num = Number(value);
      if (Number.isNaN(num)) return {captcha: true};
      return num === this.captchaAnswer ? null : {captcha: true};
    };
  }

  onSubmit() {
    this.submitted = true;
    this.botBlocked = false;

    // 1. Honeypot — jeśli ukryte pole zostało wypełnione, traktujemy to jako bota.
    if (this.form.value.website) {
      this.botBlocked = true;
      return;
    }

    // 2. Czas wypełnienia — formularz wypełniony szybciej niż ~2,5s to najpewniej bot.
    const elapsed = Date.now() - this.formLoadedAt;
    if (elapsed < MIN_FILL_TIME_MS) {
      this.botBlocked = true;
      return;
    }

    if (this.form.invalid) return;

    if (!isPlatformBrowser(this.platformId)) return;

    const data = this.form.value;
    const mailtoLink = `mailto:mowiewam@gmail.com?subject=${encodeURIComponent('[Mówię Wam] ' + data.subject)}` +
      `&body=${encodeURIComponent(`Imię: ${data.name}\nE-mail: ${data.email}\nTelefon: ${data.phone || '-'}\n\n${data.message}`)}`;
    window.location.href = mailtoLink;

    this.sent = true;
    this.submitted = false;
    this.generateCaptcha();
    this.form.reset({subject: 'Konsultacja logopedyczna', consent: false, captcha: '', website: ''});
    this.formLoadedAt = Date.now();
  }

  refreshCaptcha() {
    this.generateCaptcha();
    this.form.get('captcha')?.setValue('');
    this.form.get('captcha')?.markAsUntouched();
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.touched && ctrl.hasError(error);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitted);
  }
}
