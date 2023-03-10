import { Album } from './album.model';

export class Artist {
  albums: Album[] = [];
  selected = false;

  constructor(
    public id: string,
    public name: string,
    public desc: string,
    public image: string,
    public listeners: number
  ) {}
}
