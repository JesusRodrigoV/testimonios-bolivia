import { NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, viewChild } from '@angular/core';
import { animate, createScope, stagger, utils } from 'animejs';

interface Circle {
  visible: boolean;
}

@Component({
  selector: 'app-bolivia',
  imports: [NgClass],
  templateUrl: './bolivia.component.html',
  styleUrl: './bolivia.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoliviaComponent implements OnInit, AfterViewInit {
  redCircles: Circle[][] = [];
  yellowCircles: Circle[][] = [];
  greenCircles: Circle[][] = [];

  gridContainer = viewChild<ElementRef<HTMLElement>>('gridContainer');

  ngOnInit() {
    const numRows = 3;
    const numCircles = 40;

    let redRow: Circle[] = [];
    let yellowRow: Circle[] = [];
    let greenRow: Circle[] = [];

    this.agregarCirculos(redRow, 12, false);
    this.agregarCirculos(redRow, 3, true);
    this.agregarCirculos(redRow, 28, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 9, false);
    this.agregarCirculos(redRow, 6, true);
    this.agregarCirculos(redRow, 28, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 8, false);
    this.agregarCirculos(redRow, 7, true);
    this.agregarCirculos(redRow, 28, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 5, false);
    this.agregarCirculos(redRow, 1, true);
    this.agregarCirculos(redRow, 1, false);
    this.agregarCirculos(redRow, 8, true);
    this.agregarCirculos(redRow, 28, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 5, false);
    this.agregarCirculos(redRow, 10, true);
    this.agregarCirculos(redRow, 28, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 15, true);
    this.agregarCirculos(redRow, 28, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 1, false);
    this.agregarCirculos(redRow, 15, true);
    this.agregarCirculos(redRow, 27, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 2, false);
    this.agregarCirculos(redRow, 14, true);
    this.agregarCirculos(redRow, 27, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 3, false);
    this.agregarCirculos(redRow, 15, true);
    this.agregarCirculos(redRow, 25, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 3, false);
    this.agregarCirculos(redRow, 16, true);
    this.agregarCirculos(redRow, 1, false);
    this.agregarCirculos(redRow, 1, true);
    this.agregarCirculos(redRow, 22, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 3, false);
    this.agregarCirculos(redRow, 20, true);
    this.agregarCirculos(redRow, 20, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 2, false);
    this.agregarCirculos(redRow, 22, true);
    this.agregarCirculos(redRow, 19, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 2, false);
    this.agregarCirculos(redRow, 25, true);
    this.agregarCirculos(redRow, 16, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 2, false);
    this.agregarCirculos(redRow, 28, true);
    this.agregarCirculos(redRow, 13, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 2, false);
    this.agregarCirculos(redRow, 30, true);
    this.agregarCirculos(redRow, 11, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 3, false);
    this.agregarCirculos(redRow, 30, true);
    this.agregarCirculos(redRow, 10, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);
    this.agregarCirculos(redRow, 3, false);
    this.agregarCirculos(redRow, 29, true);
    this.agregarCirculos(redRow, 11, false);
    this.agregarFila(this.redCircles, redRow);
    redRow = this.limpiarArray(redRow);

    //Amarillos
    this.agregarCirculos(yellowRow, 2, false);
    this.agregarCirculos(yellowRow, 31, true);
    this.agregarCirculos(yellowRow, 10, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    this.agregarCirculos(yellowRow, 1, false);
    this.agregarCirculos(yellowRow, 32, true);
    this.agregarCirculos(yellowRow, 10, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    this.agregarCirculos(yellowRow, 2, false);
    this.agregarCirculos(yellowRow, 30, true);
    this.agregarCirculos(yellowRow, 11, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    this.agregarCirculos(yellowRow, 2, false);
    this.agregarCirculos(yellowRow, 31, true);
    this.agregarCirculos(yellowRow, 10, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    this.agregarCirculos(yellowRow, 1, false);
    this.agregarCirculos(yellowRow, 32, true);
    this.agregarCirculos(yellowRow, 10, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    this.agregarCirculos(yellowRow, 1, false);
    this.agregarCirculos(yellowRow, 32, true);
    this.agregarCirculos(yellowRow, 10, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    this.agregarCirculos(yellowRow, 3, false);
    this.agregarCirculos(yellowRow, 30, true);
    this.agregarCirculos(yellowRow, 10, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    this.agregarCirculos(yellowRow, 3, false);
    this.agregarCirculos(yellowRow, 36, true);
    this.agregarCirculos(yellowRow, 4, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    this.agregarCirculos(yellowRow, 2, false);
    this.agregarCirculos(yellowRow, 36, true);
    this.agregarCirculos(yellowRow, 5, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    this.agregarCirculos(yellowRow, 1, false);
    this.agregarCirculos(yellowRow, 38, true);
    this.agregarCirculos(yellowRow, 5, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    this.agregarCirculos(yellowRow, 1, false);
    this.agregarCirculos(yellowRow, 38, true);
    this.agregarCirculos(yellowRow, 5, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    this.agregarCirculos(yellowRow, 1, false);
    this.agregarCirculos(yellowRow, 39, true);
    this.agregarCirculos(yellowRow, 3, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    this.agregarCirculos(yellowRow, 2, false);
    this.agregarCirculos(yellowRow, 39, true);
    this.agregarCirculos(yellowRow, 2, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    this.agregarCirculos(yellowRow, 2, false);
    this.agregarCirculos(yellowRow, 39, true);
    this.agregarCirculos(yellowRow, 2, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    this.agregarCirculos(yellowRow, 3, false);
    this.agregarCirculos(yellowRow, 40, true);
    this.agregarCirculos(yellowRow, 0, false);
    this.agregarFila(this.yellowCircles, yellowRow);
    yellowRow = this.limpiarArray(yellowRow);
    // Verde
    this.agregarCirculos(greenRow, 3, false);
    this.agregarCirculos(greenRow, 39, true);
    this.agregarCirculos(greenRow, 1, false);
    this.agregarFila(this.greenCircles, greenRow);
    greenRow = this.limpiarArray(greenRow);
    this.agregarCirculos(greenRow, 3, false);
    this.agregarCirculos(greenRow, 38, true);
    this.agregarCirculos(greenRow, 2, false);
    this.agregarFila(this.greenCircles, greenRow);
    greenRow = this.limpiarArray(greenRow);
    this.agregarCirculos(greenRow, 4, false);
    this.agregarCirculos(greenRow, 37, true);
    this.agregarCirculos(greenRow, 2, false);
    this.agregarFila(this.greenCircles, greenRow);
    greenRow = this.limpiarArray(greenRow);
    this.agregarCirculos(greenRow, 4, false);
    this.agregarCirculos(greenRow, 27, true);
    this.agregarCirculos(greenRow, 6, false);
    this.agregarCirculos(greenRow, 3, true);
    this.agregarCirculos(greenRow, 3, false);
    this.agregarFila(this.greenCircles, greenRow);
    greenRow = this.limpiarArray(greenRow);
    this.agregarCirculos(greenRow, 4, false);
    this.agregarCirculos(greenRow, 23, true);
    this.agregarCirculos(greenRow, 12, false);
    this.agregarCirculos(greenRow, 1, true);
    this.agregarCirculos(greenRow, 3, false);
    this.agregarFila(this.greenCircles, greenRow);
    greenRow = this.limpiarArray(greenRow);
    this.agregarCirculos(greenRow, 3, false);
    this.agregarCirculos(greenRow, 24, true);
    this.agregarCirculos(greenRow, 12, false);
    this.agregarCirculos(greenRow, 2, true);
    this.agregarCirculos(greenRow, 2, false);
    this.agregarFila(this.greenCircles, greenRow);
    greenRow = this.limpiarArray(greenRow);
    this.agregarCirculos(greenRow, 3, false);
    this.agregarCirculos(greenRow, 23, true);
    this.agregarCirculos(greenRow, 13, false);
    this.agregarCirculos(greenRow, 1, true);
    this.agregarCirculos(greenRow, 3, false);
    this.agregarFila(this.greenCircles, greenRow);
    greenRow = this.limpiarArray(greenRow);
    this.agregarCirculos(greenRow, 4, false);
    this.agregarCirculos(greenRow, 22, true);
    this.agregarCirculos(greenRow, 17, false);
    this.agregarFila(this.greenCircles, greenRow);
    greenRow = this.limpiarArray(greenRow);
    this.agregarCirculos(greenRow, 5, false);
    this.agregarCirculos(greenRow, 21, true);
    this.agregarCirculos(greenRow, 17, false);
    this.agregarFila(this.greenCircles, greenRow);
    greenRow = this.limpiarArray(greenRow);
    this.agregarCirculos(greenRow, 6, false);
    this.agregarCirculos(greenRow, 19, true);
    this.agregarCirculos(greenRow, 18, false);
    this.agregarFila(this.greenCircles, greenRow);
    greenRow = this.limpiarArray(greenRow);
    this.agregarCirculos(greenRow, 6, false);
    this.agregarCirculos(greenRow, 6, true);
    this.agregarCirculos(greenRow, 1, false);
    this.agregarCirculos(greenRow, 12, true);
    this.agregarCirculos(greenRow, 18, false);
    this.agregarFila(this.greenCircles, greenRow);
    greenRow = this.limpiarArray(greenRow);
    this.agregarCirculos(greenRow, 6, false);
    this.agregarCirculos(greenRow, 6, true);
    this.agregarCirculos(greenRow, 2, false);
    this.agregarCirculos(greenRow, 6, true);
    this.agregarCirculos(greenRow, 4, false);
    this.agregarCirculos(greenRow, 1, true);
    this.agregarCirculos(greenRow, 18, false);
    this.agregarFila(this.greenCircles, greenRow);
    greenRow = this.limpiarArray(greenRow);
    this.agregarCirculos(greenRow, 7, false);
    this.agregarCirculos(greenRow, 3, true);
    this.agregarCirculos(greenRow, 8, false);
    this.agregarCirculos(greenRow, 1, true);
    this.agregarCirculos(greenRow, 24, false);
    this.agregarFila(this.greenCircles, greenRow);
    greenRow = this.limpiarArray(greenRow);
    this.agregarCirculos(greenRow, 7, false);
    this.agregarCirculos(greenRow, 3, true);
    this.agregarCirculos(greenRow, 8, false);
    this.agregarCirculos(greenRow, 1, true);
    this.agregarCirculos(greenRow, 24, false);
    this.agregarFila(this.greenCircles, greenRow);
    greenRow = this.limpiarArray(greenRow);
  }

  agregarCirculos(array: Circle[], cantidad: number, visibles: boolean) {
    for (let i = 0; i < cantidad; i++) {
      var circulo: Circle = { visible: visibles };
      array.push(circulo);
    }
  }

  agregarFila(matriz: Circle[][], fila: Circle[]) {
    matriz.push(fila);
  }

  limpiarArray(array: Circle[]) {
    return array = [];
  }

  ngAfterViewInit(): void {
    const container = this.gridContainer();
    if (!container?.nativeElement) {
      return;
    }
    const scope = createScope({ root: container.nativeElement });
    scope.add(() => {
      const $circle = utils.$('.circle') as HTMLElement[];
      if ($circle.length === 0) {
        return;
      }
      this.animateGrid($circle);
    });
  }

  private animateGrid($circle: HTMLElement[]) {
    const from = utils.random(0, 43 * 46);
    const grid = [43, 46];
    /*
    animate($circle, {
      scale: [
        { to: [0, 1.25], duration: 10 },
        { to: 0, duration: 10 },
      ],
      ease: 'outQuad',
      boxShadow: [
        { to: '0 0 1rem 0 currentColor' },
        { to: '0 0 0rem 0 currentColor' }
      ],
      delay: stagger(50, {
        grid: [43, 46],
        from: utils.random(0, 43 * 46),
      }),
      onComplete: () => {
        this.animateGrid($circle);
      },
    });
    */
   animate($circle, {
    translateX: [
      { to: stagger('-.05rem', { grid, from, axis: 'x' }) },
      { to: 0, ease: 'inOutQuad', },
    ],
    translateY: [
      { to: stagger('-.05rem', { grid, from, axis: 'y' }) },
      { to: 0, ease: 'inOutQuad' },
    ],
    opacity: [
      { to: .5 },
      { to: 1 }
    ],
    delay: stagger(100, { grid, from }),
    onComplete: () => {
      this.animateGrid($circle);
    }
  });
  }
}
