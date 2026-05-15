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
import { MatSelectModule } from "@angular/material/select";
import { User } from "@app/features/auth/models/user.model";

@Component({
  selector: "app-user-dialog",
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./user-dialog.component.html",
  styleUrl: "./user-dialog.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<User>,
  ) {
    this.form = this.fb.group({
      id_usuario: [data.id_usuario],
      nombre: [data.nombre || "", [Validators.required]],
      email: [data.email || "", [Validators.required, Validators.email]],
      password: ["", data.id_usuario ? [] : [Validators.required]], // Forma correcta
      id_rol: [data.role || 4, [Validators.required]],
      biografia: [data.biografia || ""],
      profile_image: [data.profile_image || ""],
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
