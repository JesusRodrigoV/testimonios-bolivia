import { Injectable } from "@angular/core";
import { Testimony } from "@app/features/testimony/models/testimonio.model";

@Injectable({
  providedIn: "root",
})
export class CacheService {
  private highlightedTestimonies: Testimony[] | null = null;
  private cacheTimestamp: number | null = null;
  private readonly cacheDuration = 5 * 60 * 1000; // 5 minutos

  getHighlightedTestimonies(): Testimony[] | null {
    if (
      this.highlightedTestimonies &&
      this.cacheTimestamp &&
      Date.now() - this.cacheTimestamp < this.cacheDuration
    ) {
      return this.highlightedTestimonies;
    }
    return null;
  }

  setHighlightedTestimonies(testimonies: Testimony[]): void {
    this.highlightedTestimonies = testimonies;
    this.cacheTimestamp = Date.now();
  }

  clearCache(): void {
    this.highlightedTestimonies = null;
    this.cacheTimestamp = null;
  }
}
