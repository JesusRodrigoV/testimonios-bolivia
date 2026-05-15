import { AfterViewInit, Directive } from "@angular/core";

@Directive({
  selector: "[scrollTop]",
})
export class ScrollTopDirective implements AfterViewInit{
  ngAfterViewInit() {
    window.scrollTo(0, 0);
  }
}
