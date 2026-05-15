import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface SuggestionData {
  field: string;
  value: string;
}

@Component({
  selector: 'app-suggestion-dialog',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './suggestion-dialog.component.html',
  styleUrl: './suggestion-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestionDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<SuggestionDialogComponent>);

  fields = [
    { value: 'title', label: 'Título' },
    { value: 'description', label: 'Descripción' },
    { value: 'categories', label: 'Categorías' },
    { value: 'tags', label: 'Etiquetas' },
  ];

  form: FormGroup = this.fb.group({
    field: ['', Validators.required],
    value: ['', Validators.required],
  });

  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value as SuggestionData);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
