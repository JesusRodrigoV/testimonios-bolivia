import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  Renderer2,
} from "@angular/core";

@Directive({
  selector: "[golden]",
  host: {
    "(mouseenter)": "onMouseEnter()",
    "(mouseleave)": "onMouseLeave()",
  },
})
export class GoldenDirective implements AfterViewInit {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private icons: Element[] = [];
  private readonly GOLDEN_COLOR = "#b8860b";

  ngAfterViewInit(): void {
    this.findIcons(this.el.nativeElement);
  }

  private findIcons(element: Element): void {
    if (
      element.tagName?.toLowerCase() === "i" &&
      element.classList.contains("bx")
    ) {
      this.icons.push(element);
      return;
    }

    Array.from(element.children).forEach((child) => this.findIcons(child));
  }

  onMouseEnter(): void {
    this.icons.forEach((icon) => {
      this.renderer.setStyle(icon, "color", this.GOLDEN_COLOR);
      this.renderer.setStyle(icon, "transition", "color 0.3s ease");
    });

    this.renderer.setStyle(
      this.el.nativeElement,
      "transition",
      "transform 0.3s ease",
    );
  }

  onMouseLeave(): void {
    this.icons.forEach((icon) => {
      this.renderer.removeStyle(icon, "color");
    });

    this.renderer.removeStyle(this.el.nativeElement, "transform");
  }
}
