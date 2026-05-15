import { Injectable } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {
  getRelativeTime(createdAt: string | Date): string {
    if (!createdAt) return 'Desconocido';

    try {
      const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
      if (isNaN(date.getTime())) return 'Fecha inválida';

      return formatDistanceToNow(date, {
        locale: es,
        addSuffix: true
      });
    } catch {
      return 'Fecha inválida';
    }
  }
}
