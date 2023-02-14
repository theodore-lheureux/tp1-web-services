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
        this.httpClient.get<ArtistResponse>(
          `https://ws.audioscrobbler.com/2.0/?method=album.search&album=believe&api_key=${apiKey}&format=json`
        )
      );
    } catch (error) {
      return false;
    }
    return true;
  }

  async searchArtist(apiKey: string, artistName: string): Promise<Artist[]> {
    const artists: Artist[] = [];
    const res: ArtistResponse = await lastValueFrom(
      this.httpClient.get<ArtistResponse>(
        `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${artistName}&limit=10&api_key=${apiKey}&format=json`
      )
    );

    res.results.artistmatches.artist.forEach((artist) => {
      if (artist.mbid === '') return;
      artists.push(
        new Artist(artist.mbid, artist.name, '', '', artist.listeners)
      );
    });

    return await this.fetchArtistImages(artists, apiKey);
  }

  async getArtistInfo(apiKey: string, artistName: string): Promise<Artist> {
    const reqId: ArtistResponse = await lastValueFrom(
      this.httpClient.get<ArtistResponse>(
        `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${artistName}&api_key=${apiKey}&format=json`
      )
    );

    if (reqId.results.artistmatches.artist.length === 0) {
      throw new Error('Artist not found');
    }

    const id = reqId.results.artistmatches.artist[0].mbid;
    const res: ArtistGetInfoResponse = await lastValueFrom(
      this.httpClient.get<ArtistGetInfoResponse>(
        `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&mbid=${id}&api_key=${apiKey}&format=json`
      )
    );

    const artist: Artist = new Artist(
      id,
      res.artist.name,
      res.artist.bio.summary,
      await this.fetchArtistImage(id, apiKey),
      res.artist.stats.listeners
    );
    artist.albums = await this.getTopAlbums(apiKey, artist);

    return artist;
  }

  async getAlbumSongs(apiKey: string, album: Album): Promise<Song[]> {
    const res: AlbumGetInfoResponse = await lastValueFrom(
      this.httpClient.get<AlbumGetInfoResponse>(
        `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${apiKey}&artist=${album.artist.name}&album=${album.title}&format=json`
      )
    );

    if (
      res.album.tracks?.track === undefined ||
      !(Symbol.iterator in Object(res.album?.tracks?.track))
    ) {
      album.noSongs = true;
      return [];
    }

    const songs = res.album.tracks.track.map((song) => {
      return new Song(song.name, song.duration);
    });

    return songs;
  }

  private async getTopAlbums(apiKey: string, artist: Artist): Promise<Album[]> {
    const res: TopAlbumsResponse = await lastValueFrom(
      this.httpClient.get<TopAlbumsResponse>(
        `https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&mbid=${artist.id}&api_key=${apiKey}&format=json`
      )
    );

    const albums: Album[] = [];

    res.topalbums.album.forEach((album) => {
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

  private async fetchArtistImage(id: string, apiKey: string): Promise<string> {
    const res: TopAlbumsResponse = await lastValueFrom(
      this.httpClient.get<TopAlbumsResponse>(
        `https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&mbid=${id}&api_key=${apiKey}&limit=1&format=json`
      )
    );

    let image = res.topalbums.album[0].image[3]['#text'];

    if (image === '') image = 'assets/images/album-placeholder.png';

    return image;
  }

  private async fetchArtistImages(
    artists: Artist[],
    apiKey: string
  ): Promise<Artist[]> {
    const promises: Promise<Artist>[] = [];

    for (const artist of artists) {
      promises.push(
        new Promise<Artist>((resolve, reject) => {
          try {
            this.fetchArtistImage(artist.id, apiKey).then((image) => {
              artist.image = image;
              resolve(artist);
            });
          } catch (error) {
            reject(error);
          }
        })
      );
    }

    return await Promise.all(promises);
  }

  // private parseAlbums(albums: any): Album[] {
  //   const blackList = [
  //     'remaster',
  //     'live',
  //     'deluxe',
  //     'edition',
  //     'bonus',
  //     'disc',
  //     'version',
  //     'single',
  //     'very best of',
  //     'best of',
  //     'anthology',
  //   ];

  //   return [];
  // }
}

interface TopAlbumsResponse {
  topalbums: {
    album: {
      mbid: string;
      name: string;
      playcount: number;
      artist: {
        mbid: string;
        name: string;
        url: string;
      };
      image: {
        '#text': string;
        size: string;
      }[];
      url: string;
    }[];
  };
}

interface ArtistResponse {
  results: {
    artistmatches: {
      artist: {
        mbid: string;
        name: string;
        listeners: number;
      }[];
    };
  };
}

interface ArtistGetInfoResponse {
  artist: {
    name: string;
    mbid: string;
    url: string;
    image: {
      '#text': string;
      size: string;
    }[];
    streamable: string;
    ontour: string;
    stats: {
      listeners: number;
      playcount: number;
    };
    similar: {
      artist: {
        name: string;
        url: string;
        image: {
          '#text': string;
          size: string;
        }[];
      }[];
    };
    tags: {
      tag: {
        name: string;
        url: string;
      }[];
    };
    bio: {
      links: {
        link: {
          '#text': string;
          rel: string;
          href: string;
        };
      };
      published: string;
      summary: string;
      content: string;
    };
  };
}

interface AlbumGetInfoResponse {
  album: {
    name: string;
    artist: string;
    mbid: string;
    url: string;
    image: {
      '#text': string;
      size: string;
    }[];
    listeners: number;
    playcount: number;
    tracks: {
      track:
        | {
            name: string;
            duration: number;
            url: string;
            streamable: {
              '#text': string;
              fulltrack: string;
            };
            artist: {
              name: string;
              mbid: string;
              url: string;
            };
            '@attr': {
              rank: string;
            };
          }[]
        | undefined;
    };
    tags: {
      tag: {
        name: string;
        url: string;
      }[];
    };
    wiki: {
      published: string;
      summary: string;
      content: string;
    };
  };
}
