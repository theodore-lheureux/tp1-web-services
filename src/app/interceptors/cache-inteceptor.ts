import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { CacheResolverService } from '../services/cache-resolver.service';

const TIME_TO_LIVE = 1000;

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(private cacheResolver: CacheResolverService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.method !== 'GET' || req.urlWithParams.includes('believe')) {
      console.log('CacheInterceptor skipped: ', req.urlWithParams);
      return next.handle(req);
    }

    if (req.headers.get('x-refresh')) {
      return this.sendRequest(req, next);
    }

    const cachedResponse = this.cacheResolver.get(req.url);
    return cachedResponse ? of(cachedResponse) : this.sendRequest(req, next);
  }

  sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.cacheResolver.set(req.url, event, TIME_TO_LIVE);
        }
      })
    );
  }
}
