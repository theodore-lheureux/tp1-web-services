import { Album } from './album.model';

export class Artist {
  constructor(
    public id: string,
    public name: string,
    public desc: string,
    public albums: Album[]
  ) {}
}
