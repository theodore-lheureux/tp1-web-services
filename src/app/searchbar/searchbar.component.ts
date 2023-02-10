import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  faCircleXmark,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { LastFMService } from '../services/last-fm.service';
import { Artist } from '../models/artist.class';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
})
export class SearchbarComponent {
  faMagnifyingGlass = faMagnifyingGlass;
  faCircleXmark = faCircleXmark;
  @Input() apiKey: string = '';
  @Output() closeEvent = new EventEmitter<Artist | undefined>();
  searchValue = 'sup';
  selectedIndex = -1;
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
    // sort by listeners
    this.artists = this.artists.sort((a, b) => b.listeners - a.listeners);
  }

  sendToLastFM() {
    window.open(`https://www.last.fm/`, '_blank');
  }

  async submit() {
    if (this.selectedIndex === -1) {
      this.addArtist(undefined);
    } else {
      this.addArtist(this.artists[this.selectedIndex]);
    }
  }

  closeSearch() {
    this.addArtist(undefined);
  }

  bgClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeSearch();
    }
  }

  addArtist(artist: Artist | undefined) {
    this.closeEvent.emit(artist);
  }
}
