import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TestimonioService } from '@app/features/testimony/services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface FooterLink {
  name: string;
  url: string;
  icon: string;
  external?: boolean;
}

interface UsefulLink {
  name: string;
  url: string;
  ariaLabel: string;
  disabled?: boolean;
}

interface Cta {
  text: string;
  link: string;
  ariaLabel: string;
}

@Component({
  selector: 'app-footer',
  imports: [RouterModule, NgOptimizedImage, MatButtonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private readonly testimonioService = inject(TestimonioService);
  readonly currentYear = new Date().getFullYear();
  numberOfTestimonies = signal(0);

  private readonly _testimonyCountSub = this.testimonioService.getTestimonyCount()
    .pipe(takeUntilDestroyed())
    .subscribe({
      next: (count) => {
        this.numberOfTestimonies.set(count);
      },
      error: () => {
        this.numberOfTestimonies.set(0);
      },
    });

  readonly brand = {
    logo: 'assets/images/logo-Sfondo.png',
    title: 'Legado de Bolivia',
    description: 'Sistema de Archivos de Testimonios del Bicentenario',
  };

  readonly cta: Cta = {
    text: 'Comparte tu Historia',
    link: '/submit-testimony',
    ariaLabel: 'Comparte tu historia en Legado Bolivia',
  };

  readonly usefulLinks: UsefulLink[] = [
    {
      name: 'Home',
      url: '/',
      ariaLabel: 'Volver a la página principal de Legado Bolivia',
    },
    {
      name: 'Explorar Testimonios',
      url: '/explore',
      ariaLabel: 'Explorar testimonios de Legado Bolivia',
    },
    {
      name: 'Mapa',
      url: '/maps',
      ariaLabel: 'Ver mapa de testimonios de Legado Bolivia',
    },
    {
      name: 'About (Próximamente)',
      url: '/about',
      ariaLabel: 'Página Acerca de, en desarrollo',
      disabled: true,
    },
    {
      name: 'Política de Privacidad',
      url: '/privacy',
      ariaLabel: 'Política de Privacidad, en desarrollo',
      disabled: true,
    },
    {
      name: 'Términos de Uso',
      url: '/terms',
      ariaLabel: 'Términos de Uso, en desarrollo',
      disabled: true,
    },
  ];

  readonly socialLinks: FooterLink[] = [
    {
      name: 'GitHub',
      url: 'https://github.com/JesusRodrigoV/testimonios-frontend',
      icon: 'bx bxl-github',
      external: true,
    },
  ];
}