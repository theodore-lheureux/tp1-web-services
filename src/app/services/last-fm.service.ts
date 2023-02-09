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

  async searchArtist(apiKey: string, artistName: string): Promise<Artist[]> {
    let artists: Artist[] = [];
    let res: any = await lastValueFrom(
      this.httpClient.get(
        `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${artistName}&api_key=${apiKey}&format=json`
      )
    );

    res.results.artistmatches.artist.forEach(async (artist: any) => {
      artists.push(
        new Artist(
          artist.mbid,
          artist.name,
          '',
          await this.fetchArtistImage(artist.mbid)
        )
      );
    });

    return artists;
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

    artist = new Artist(
      id,
      res.artist.name,
      res.artist.bio.summary,
      await this.fetchArtistImage(id)
    );
    artist.albums = await this.getTopAlbums(apiKey, artist);

    return artist;
  }

  async getTopAlbums(apiKey: string, artist: Artist): Promise<Album[]> {
    let res: any = await lastValueFrom(
      this.httpClient.get(
        `http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&mbid=${artist.id}&api_key=${apiKey}&format=json`
      )
    );

    let albums: Album[] = [];

    res.topalbums.album.forEach((album: any) => {
      if (
        !(
          album.image[3]['#text'] === '' ||
          album.name === '' ||
          album.name.toLowerCase().includes('remaster') ||
          album.name.toLowerCase().includes('live') ||
          album.name.toLowerCase().includes('deluxe') ||
          album.name.toLowerCase().includes('edition') ||
          album.name.toLowerCase().includes('bonus') ||
          album.name.toLowerCase().includes('disc') ||
          album.name.toLowerCase().includes('version') ||
          album.name.toLowerCase().includes('single') ||
          album.name.toLowerCase().includes('very best of') ||
          album.name
            .toLowerCase()
            .includes('best of ' + artist.name.toLowerCase()) ||
          album.name.toLowerCase().includes('anthology') ||
          album.name == '(null)'
        )
      )
        albums.push(new Album(album.name, album.image[3]['#text'], artist));
    });

    return albums;
  }

  async getAlbumSongs(apiKey: string, album: Album): Promise<Song[]> {
    let res: any = await lastValueFrom(
      this.httpClient.get(
        `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${album.artist.name}&album=${album.title}&format=json`
      )
    );

    let songs = res.album.tracks.track.map((song: any) => {
      return new Song(song.name, song.duration);
    });

    return songs;
  }

  private async fetchArtistImage(artistMID: string): Promise<string> {
    let res: any = await lastValueFrom(
      this.httpClient.get(
        `https://musicbrainz.org/ws/2/artist/${artistMID}?inc=url-rels&fmt=json`
      )
    );

    for (let i = 0; i < res.relations.length; i++) {
      if (res.relations[i].type === 'image') {
        return res.relations[i].url.resource;
      }
    }
    return '';
  }
}
