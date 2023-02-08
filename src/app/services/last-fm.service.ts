import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LastFMService {

  constructor(private httpClient: HttpClient) { }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response: any = await lastValueFrom(this.httpClient.get(`http://ws.audioscrobbler.com/2.0/?method=album.search&album=believe&api_key=${apiKey}&format=json`));
    } catch (error) {
      return false;
    }
    return true;
   }

}
