import { Component, Input } from '@angular/core';
import { Album } from '../models/album.model';
import { Artist } from '../models/artist.class';
import { LastFMService } from '../services/last-fm.service';

@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss'],
})
export class AlbumComponent {
  @Input() album: Album = new Album('', '', new Artist('', '', ''));
  @Input() apiKey: string = '';

  constructor(private lastFM: LastFMService) {}

  async getAlbumSongs(album: Album): Promise<void> {
    if (album.songs.length === 0) {
      album.songs = await this.lastFM.getAlbumSongs(this.apiKey, album);
    }
  }

  toggleSongs(): void {
    if (this.album.songs.length > 0) {
      this.album.displaySongs = !this.album.displaySongs;
    } else {
      this.getAlbumSongs(this.album).then(() => {
        this.album.displaySongs = !this.album.displaySongs;
      });
    }
  }
}