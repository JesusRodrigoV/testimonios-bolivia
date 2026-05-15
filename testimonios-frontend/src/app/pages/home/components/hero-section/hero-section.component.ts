import {
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  viewChild,
  ElementRef,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { BoliviaComponent } from "@app/features/animations/bolivia";
import { animate, utils } from "animejs";

@Component({
  selector: "app-hero-section",
  imports: [MatButtonModule, MatIconModule, RouterLink, BoliviaComponent],
  templateUrl: "./hero-section.component.html",
  styleUrl: "./hero-section.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent implements AfterViewInit {
  uno = viewChild<ElementRef>("uno");
  dos = viewChild<ElementRef>("dos");
  tres = viewChild<ElementRef>("tres");

  ngAfterViewInit() {
    if (!this.uno()?.nativeElement) {
      return;
    }

    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      return;
    }

    const $uno = this.uno()?.nativeElement;
    const $dos = this.dos()?.nativeElement;
    const $tres = this.tres()?.nativeElement;
    this.animateParticula($uno, 100);
    this.animateParticula($dos, 200);
    this.animateParticula($tres, 300);
  }

  private animateParticula($elem: HTMLElement, posX: number) {
    animate($elem, {
      y: [
        { to: "-2.75rem", ease: "outExpo", duration: 200 },
        { to: 0, ease: "outBounce", duration: 200, delay: 100 },
      ],
      borderRadius: 64,
      "background-color": "#F9F640",
      filter: "blur(10px)",
      ease: "inOutCirc",
      loopDelay: 500,
      loop: true,
    });
  }
}
