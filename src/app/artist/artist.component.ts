import { Component, Input } from '@angular/core';
import { Artist } from '../models/artist.class';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  styleUrls: ['./artist.component.scss'],
})
export class ArtistComponent {
  @Input() artist: Artist = new Artist('', '', '', '', 1);
}
