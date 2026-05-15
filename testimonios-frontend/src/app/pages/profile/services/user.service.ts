import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthStore } from '@app/auth.store';
import { User } from '@app/features/auth/models/user.model';
import { Observable, map, catchError, from } from 'rxjs';
import { handleHttpError, isHttpError } from '@app/core/utils/http-error';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  updateUser(userId: number, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/profile`, data).pipe(
      catchError((error: unknown) => {
        const msg = isHttpError(error) ? error.message : undefined;
        return handleHttpError(error, `Error al actualizar el usuario: ${msg ?? 'error desconocido'}`);
      }),
    );
  }

  uploadProfileImage(file: File): Observable<{ secure_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);
    formData.append('folder', 'legado_bolivia/profile_images');
    formData.append('resource_type', 'image');

    return from(
      fetch(
        `${environment.cloudinary.uploadUrl}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )
      .then(response => response.json())
      .then(result => {
        if (result.error) {
          throw new Error(result.error.message || 'Error al subir la imagen');
        }
        return { secure_url: result.secure_url };
      })
    ).pipe(
      catchError((error: unknown) => handleHttpError(error, isHttpError(error) ? error.message : 'Error al subir la imagen'))
    );
  }
}
