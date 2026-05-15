import { Injectable, OnDestroy, inject, signal } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { Notificacion } from "../model/notification.model";
import { environment } from "src/environment/environment";

interface SseMessage {
  type: "new_notification";
  notification: Notificacion;
}

@Injectable({
  providedIn: "root",
})
export class NotificationSseService implements OnDestroy {
  private eventSource: EventSource | null = null;
  private notificationSubject = new Subject<Notificacion>();
  private connected = signal(false);

  readonly newNotification$: Observable<Notificacion> =
    this.notificationSubject.asObservable();

  connect(token: string): void {
    this.disconnect();

    const url = `${environment.apiUrl}/notifications/stream?token=${encodeURIComponent(token)}`;
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      try {
        const message: SseMessage = JSON.parse(event.data);
        if (message.type === "new_notification") {
          this.notificationSubject.next(message.notification);
        }
      } catch {
        console.warn("SSE: error parsing message", event.data);
      }
    };

    this.eventSource.onopen = () => {
      this.connected.set(true);
    };

    this.eventSource.onerror = () => {
      this.connected.set(false);
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.connected.set(false);
  }

  isConnected(): boolean {
    return this.connected();
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.notificationSubject.complete();
  }
}
