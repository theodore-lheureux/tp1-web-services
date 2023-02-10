import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  AfterViewChecked,
  ViewChildren,
  AfterViewInit,
} from '@angular/core';
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
export class SearchbarComponent implements AfterViewChecked, AfterViewInit {
  faMagnifyingGlass = faMagnifyingGlass;
  faCircleXmark = faCircleXmark;
  @Input() apiKey: string = '';
  @Output() closeEvent = new EventEmitter<Artist | undefined>();
  @ViewChildren('searchInput') searchInputElement: any;
  searchValue = '';
  selectedIndex = -1;
  artists: Artist[] = [];

  constructor(private lastFM: LastFMService) {}

  ngAfterViewChecked(): void {
    this.scrollToSelected();
  }

  ngAfterViewInit(): void {
    this.searchInputElement.first.nativeElement.focus();
  }

  search() {
    if (this.searchValue.length > 2) {
      this.lastFM
        .searchArtist(this.apiKey, this.searchValue)
        .then((artists) => {
          this.artists = artists;
          // this.artists[0].selected = true;
          // this.selectIndex(0);
        });
      return;
    }
    this.artists = [];
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

  selectIndex(index: number) {
    console.log(index);
    this.selectedIndex = index;
    this.artists.forEach((artist) => (artist.selected = false));
    this.artists[index].selected = true;
  }

  scrollToSelected() {
    let selected = document.querySelector('.selectedArtist');
    if (selected) {
      selected.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }

  selectArtist(artist: Artist) {
    this.selectedIndex = this.artists.indexOf(artist);
    console.log(this.selectedIndex);
    this.selectIndex(this.selectedIndex);
  }

  selectFirstOrNone() {
    console.log(this.artists);
    console.log(this.artists.length);
    if (this.artists.length > 0) {
      this.selectIndex(0);
    } else {
      this.selectedIndex = -1;
    }
  }

  selectPrevious() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.selectIndex(this.selectedIndex);
    }
  }

  selectNext() {
    if (this.selectedIndex < this.artists.length - 1) {
      this.selectedIndex++;
      this.selectIndex(this.selectedIndex);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.selectedIndex > 0) {
        this.selectPrevious();
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.selectedIndex < this.artists.length - 1) {
        this.selectNext();
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.submit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeSearch();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      if (event.shiftKey) {
        this.selectPrevious();
      } else {
        this.selectNext();
      }
    } else if (event.key === 'Backspace') {
      console.log(this.selectedIndex);
    }
  }
}
