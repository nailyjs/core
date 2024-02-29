import { Injectable } from "@nailyjs/core";
import { MemoryCache, caching } from "cache-manager";

@Injectable()
export class CacheManagerService {
  private cache: MemoryCache;

  protected async onReady() {
    this.cache = await caching("memory");
  }

  public get<T>(cacheKey: string) {
    return this.cache.get<T>(cacheKey);
  }
}
