import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
  };

  success(message: string, action = 'Cerrar', config?: MatSnackBarConfig) {
    return this.snackBar.open(message, action, { ...this.defaultConfig, ...config });
  }

  error(message: string, action = 'Cerrar', config?: MatSnackBarConfig) {
    return this.snackBar.open(message, action, {
      ...this.defaultConfig,
      ...config,
      duration: config?.duration ?? 5000,
    });
  }

  info(message: string, action = 'Cerrar', config?: MatSnackBarConfig) {
    return this.snackBar.open(message, action, { ...this.defaultConfig, ...config });
  }

  dismiss(): void {
    this.snackBar.dismiss();
  }
}
