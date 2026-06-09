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
  private abortController: AbortController | null = null;
  private notificationSubject = new Subject<Notificacion>();
  private connected = signal(false);
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  readonly newNotification$: Observable<Notificacion> =
    this.notificationSubject.asObservable();

  connect(token: string): void {
    this.disconnect();

    this.abortController = new AbortController();
    const url = `${environment.apiUrl}/notifications/stream`;

    this.startStream(url, token);
  }

  private async startStream(url: string, token: string): Promise<void> {
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: this.abortController?.signal,
      });

      if (!response.ok) {
        this.connected.set(false);
        return;
      }

      this.connected.set(true);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const message: SseMessage = JSON.parse(line.slice(6));
              if (message.type === "new_notification") {
                this.notificationSubject.next(message.notification);
              }
            } catch {
              console.warn("SSE: error parsing message", line);
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
    }

    this.connected.set(false);

    // Reconnect after 5 seconds
    this.reconnectTimer = setTimeout(() => {
      if (this.abortController) {
        this.startStream(url, token);
      }
    }, 5000);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
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
