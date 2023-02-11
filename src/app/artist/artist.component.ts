import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Artist } from '../models/artist.class';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss'],
})
export class ArtistComponent {
  faXmark = faXmark;
  @Input() artist: Artist = new Artist('', '', '', '', 1);
  @Input() deletable: boolean = false;
  @Output() deleteEvent = new EventEmitter<Artist>();

  deleteArtist(): void {
    this.deleteEvent.emit(this.artist);
  }
}
