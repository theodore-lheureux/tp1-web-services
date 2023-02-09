import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Album } from '../models/album.model';
import { Artist } from '../models/artist.class';
import { Song } from '../models/song.class';

@Injectable({
  providedIn: 'root',
})
export class LastFMService {
  constructor(private httpClient: HttpClient) {}

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      await lastValueFrom(
        this.httpClient.get(
          `http://ws.audioscrobbler.com/2.0/?method=album.search&album=believe&api_key=${apiKey}&format=json`
        )
      );
    } catch (error) {
      return false;
    }
    return true;
  }

  async getArtistInfo(apiKey: string, artistName: string): Promise<Artist> {
    let artist: Artist;
    let reqId: any = await lastValueFrom(
      this.httpClient.get(
        `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${artistName}&api_key=${apiKey}&format=json`
      )
    );

    if (reqId.results.artistmatches.artist.length === 0) {
      throw new Error('Artist not found');
    }

    let id = reqId.results.artistmatches.artist[0].mbid;
    let res: any = await lastValueFrom(
      this.httpClient.get(
        `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&mbid=${id}&api_key=${apiKey}&format=json`
      )
    );

    artist = new Artist(id, res.artist.name, res.artist.bio.summary);
    artist.albums = await this.getTopAlbums(apiKey, artist);

    return artist;
  }

  async getTopAlbums(apiKey: string, artist: Artist): Promise<Album[]> {
    let res: any = await lastValueFrom(
      this.httpClient.get(
        `http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&mbid=${artist.id}&api_key=${apiKey}&format=json`
      )
    ).catch((error) => {
      return { error: 'Artist not found' };
    });

    let albums: Album[] = [];

    res.topalbums.album.forEach((album: any) => {
      albums.push(new Album(album.name, album.image[3]['#text'], artist));
    });

    return albums;
  }

  async getAlbumSongs(apiKey: string, album: Album): Promise<Song[]> {
    let res: any = await lastValueFrom(
      this.httpClient.get(
        `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${album.artist.name}&album=${album.title}&format=json`
      )
    ).catch((error) => {
      return { error: 'Album not found' };
    });

    let songs = res.album.tracks.track.map((song: any) => {
      return new Song(song.name, song.duration);
    });

    return songs;
  }
}
