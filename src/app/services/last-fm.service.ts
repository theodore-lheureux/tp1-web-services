import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Album } from '../models/album.model';
import { Artist } from '../models/artist.class';

@Injectable({
  providedIn: 'root',
})
export class LastFMService {
  constructor(private httpClient: HttpClient) {}

  async validateApiKey(apiKey: string): Promise<boolean> {
    let res: any = await lastValueFrom(
      this.httpClient.get(
        `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=Cher&album=Believe&format=json`
      )
    );
    console.log(res);
    return res.error === undefined;
  }

  async getArtistInfo(apiKey: string, artistName: string): Promise<any> {
    let artist: Artist;
    let reqId: any = await lastValueFrom(
      this.httpClient.get(
        `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${artistName}&api_key=${apiKey}&format=json`
      )
    );
    let id = reqId.results.artistmatches.artist[0].mbid;
    let res: any = await lastValueFrom(
      this.httpClient.get(
        `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&mbid=${id}&api_key=${apiKey}&format=json`
      )
    );

    artist = new Artist(id, res.artist.name, res.artist.bio.summary);

    return artist;
  }

  async getAlbumInfo(
    apiKey: string,
    artist: string,
    albumName: string
  ): Promise<Album> {
    let res: any = await lastValueFrom(
      this.httpClient.get(
        `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${artist}&album=${albumName}&format=json`
      )
    );

    let album = new Album(
      res.album.name,
      res.album.wiki?.summary,
      res.album.wiki?.published,
      res.album.image[3]['#text'],
      res.album.artist
    );

    return album;
  }

  async getSongs(
    apiKey: string,
    artist: string,
    albumName: string
  ): Promise<any> {
    return await lastValueFrom(
      this.httpClient.get(
        `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${artist}&album=${albumName}&format=json`
      )
    );
  }
}
