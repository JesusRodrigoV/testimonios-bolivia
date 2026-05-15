import type { Response } from "express";

const MAX_CONNECTIONS_PER_USER = 5;

export class SSEManager {
  private clients = new Map<number, Set<Response>>();

  canAddClient(userId: number): boolean {
    const userClients = this.clients.get(userId);
    return !userClients || userClients.size < MAX_CONNECTIONS_PER_USER;
  }

  addClient(userId: number, res: Response): boolean {
    if (!this.canAddClient(userId)) return false;

    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(res);

    res.on("close", () => this.removeClient(userId, res));
    res.on("error", () => this.removeClient(userId, res));

    return true;
  }

  removeClient(userId: number, res: Response): void {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    userClients.delete(res);
    if (userClients.size === 0) {
      this.clients.delete(userId);
    }
  }

  sendToUser(userId: number, data: Record<string, unknown>): void {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    const payload = `data: ${JSON.stringify(data)}\n\n`;

    for (const res of userClients) {
      try {
        res.write(payload);
      } catch {
        this.removeClient(userId, res);
      }
    }
  }

  sendToUsers(userIds: number[], data: Record<string, unknown>): void {
    for (const id of userIds) {
      this.sendToUser(id, data);
    }
  }

  broadcast(data: Record<string, unknown>): void {
    const payload = `data: ${JSON.stringify(data)}\n\n`;

    for (const [, userClients] of this.clients) {
      for (const res of userClients) {
        try {
          res.write(payload);
        } catch {
          continue;
        }
      }
    }
  }

  get connectedClients(): number {
    return this.clients.size;
  }
}

export const sseManager = new SSEManager();
