import { Artist } from './artist.class';

export class Album {
  constructor(
    public title: string,
    public image: string,
    public artist: Artist
  ) {}
}
