import { Component, Input } from '@angular/core';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { LastFMService } from '../services/last-fm.service';
import { Artist } from '../models/artist.class';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
})
export class SearchbarComponent {
  faMagnifyingGlass = faMagnifyingGlass;
  @Input() apiKey: string = '';
  searchValue = 'sup';
  artists: Artist[] = [];

  constructor(private lastFM: LastFMService) {}

  async search() {
    this.artists = [];
    if (this.searchValue.length > 2) {
      try {
        this.artists = await this.lastFM.searchArtist(
          this.apiKey,
          this.searchValue
        );
      } catch (error) {
        console.error(error);
      }
    }
  }

  sendToLastFM() {
    window.open(`https://www.last.fm/`, '_blank');
  }

  async submit() {}
}
