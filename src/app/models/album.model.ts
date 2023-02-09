import { Artist } from './artist.class';
import { Song } from './song.class';

export class Album {
  songs: Song[] | undefined;
  displaySongs: boolean = false;

  constructor(
    public title: string,
    public image: string,
    public artist: Artist
  ) {}
}
