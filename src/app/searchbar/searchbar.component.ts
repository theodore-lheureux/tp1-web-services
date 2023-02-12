import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  AfterViewChecked,
  ViewChildren,
  AfterViewInit,
  OnInit,
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
export class SearchbarComponent
  implements AfterViewChecked, AfterViewInit, OnInit
{
  faMagnifyingGlass = faMagnifyingGlass;
  faCircleXmark = faCircleXmark;
  @Input() apiKey: string = '';
  @Output() closeEvent = new EventEmitter<Artist | undefined>();
  @ViewChildren('searchInput') searchInputElement: any;
  searchValue = '';
  loading = false;
  selectedIndex = -1;
  recentArtists: Artist[] = JSON.parse(
    window.localStorage.getItem('recentSearches') || '[]'
  );
  artists: Artist[] = this.recentArtists;

  constructor(private lastFM: LastFMService) {}

  ngAfterViewChecked(): void {
    this.scrollToSelected();
  }

  ngOnInit(): void {
    this.selectFirstOrNone();
  }

  ngAfterViewInit(): void {
    this.searchInputElement.first.nativeElement.focus();
  }

  async search() {
    if (this.searchValue.length > 2) {
      this.loading = true;

      this.artists = await this.lastFM.searchArtist(
        this.apiKey,
        this.searchValue
      );

      this.artists = this.artists.sort((a, b) => {
        return b.listeners - a.listeners;
      });

      this.loading = false;

      this.selectFirstOrNone();
      return;
    }
    this.artists = this.recentArtists;
  }

  async submit() {
    if (this.selectedIndex === -1) {
      this.addArtist(undefined);
    } else {
      this.recentArtists = this.recentArtists.filter(
        (artist) => artist.name !== this.artists[this.selectedIndex].name
      );

      this.recentArtists.unshift(this.artists[this.selectedIndex]);
      this.recentArtists = this.recentArtists.slice(0, 10);
      window.localStorage.setItem(
        'recentSearches',
        JSON.stringify(this.recentArtists)
      );
      this.addArtist(this.artists[this.selectedIndex]);
    }
  }

  deleteRecent(artist: Artist) {
    this.recentArtists = this.recentArtists.filter(
      (a) => a.name !== artist.name
    );
    window.localStorage.setItem(
      'recentSearches',
      JSON.stringify(this.recentArtists)
    );
    this.artists = this.recentArtists;
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

  selectIndex(index: number) {
    this.selectedIndex = index;
    this.artists.forEach((artist) => (artist.selected = false));
    this.artists[index].selected = true;
  }

  selectArtist(artist: Artist) {
    this.selectedIndex = this.artists.indexOf(artist);
    this.selectIndex(this.selectedIndex);
  }

  selectFirstOrNone() {
    if (this.artists.length > 0) {
      this.selectIndex(0);
    } else {
      this.selectedIndex = -1;
    }
  }

  selectLastOrNone() {
    if (this.artists.length > 0) {
      this.selectIndex(this.artists.length - 1);
    } else {
      this.selectedIndex = -1;
    }
  }

  selectPrevious() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.selectIndex(this.selectedIndex);
    } else {
      this.selectLastOrNone();
    }
  }

  selectNext() {
    if (this.selectedIndex < this.artists.length - 1) {
      this.selectedIndex++;
      this.selectIndex(this.selectedIndex);
    } else {
      this.selectFirstOrNone();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectPrevious();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectNext();
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
    }
  }
}
