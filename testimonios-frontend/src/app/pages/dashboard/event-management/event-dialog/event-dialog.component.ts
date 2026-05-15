import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { HistoricalEvent } from "../../services";

@Component({
  selector: "app-event-dialog",
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./event-dialog.component.html",
  styleUrl: "./event-dialog.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<HistoricalEvent>,
  ) {
    const fechaStr = data.fecha
      ? new Date(data.fecha).toISOString().split("T")[0]
      : "";
    this.form = this.fb.group({
      id_evento: [data.id_evento],
      nombre: [data.nombre || "", [Validators.required]],
      descripcion: [data.descripcion || "", [Validators.required]],
      fecha: [fechaStr, [Validators.required]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
