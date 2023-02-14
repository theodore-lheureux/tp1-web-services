import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class CacheResolverService {
  private cache = new Map<string, [Date | null, HttpResponse<unknown>]>();

  set(key: string, value: HttpResponse<unknown>, ttl: number | null = null) {
    if (!ttl) {
      this.cache.set(key, [null, value]);
      return;
    }
    const expiresIn = new Date();
    expiresIn.setSeconds(expiresIn.getSeconds() + ttl);
    this.cache.set(key, [expiresIn, value]);
  }

  get(key: string) {
    const tuple = this.cache.get(key);

    if (!tuple) return null;
    const ttl = tuple[0];
    const savedResponse = tuple[1];

    if (ttl && ttl.getTime() < new Date().getTime()) {
      this.cache.delete(key);
      return null;
    }

    return savedResponse;
  }
}
