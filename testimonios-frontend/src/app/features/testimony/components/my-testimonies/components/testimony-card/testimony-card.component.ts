import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { Testimony } from "@app/features/testimony/models/testimonio.model";

@Component({
  selector: "app-testimony-card",
  imports: [MatButtonModule, MatIconModule, DatePipe],
  templateUrl: "./testimony-card.component.html",
  styleUrl: "./testimony-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonyCardComponent {
  testimony = input.required<Testimony>();
  edit = output<Testimony>();
  delete = output<Testimony>();

  onEdit(): void {
    this.edit.emit(this.testimony());
  }

  onDelete(): void {
    this.delete.emit(this.testimony());
  }
}
