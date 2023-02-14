import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Artist } from './models/artist.class';
import { LastFMService } from './services/last-fm.service';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  faMagnifyingGlass = faMagnifyingGlass;
  title = 'tp1-web-services';
  keySet = false;
  searchbarVisible = false;
  artist: Artist | undefined;
  apiKeyControl = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
  ]);

  constructor(private lastFM: LastFMService) {}

  async ngOnInit(): Promise<void> {
    const localKey = window.localStorage.getItem('apiKey');
    const localArtistName = window.localStorage.getItem('artistName');

    if (!localKey) return;

    this.keySet = true;

    if (!(await this.lastFM.validateApiKey(localKey))) {
      this.keySet = false;
      window.localStorage.removeItem('apiKey');
      return;
    }
    this.apiKeyControl.setValue(localKey);

    if (!localArtistName) {
      this.searchbarVisible = true;
      return;
    }

    this.getArtist(localArtistName).catch((error) => {
      console.log(error);
    });
  }

  setApiKey(key: string): void {
    this.apiKeyControl.markAsDirty();
    this.apiKeyControl.setValue(key);

    if (!this.apiKeyControl.valid) return;

    this.apiKeyIsValid().then((valid) => {
      if (!valid) {
        this.apiKeyControl.setErrors({ invalidKey: true });
        return;
      }
      this.apiKeyControl.setErrors(null);
      this.keySet = true;
      window.localStorage.setItem('apiKey', this.apiKeyControl.value ?? '');
    });
  }

  resetArtist(): void {
    this.artist = undefined;
    window.localStorage.removeItem('artistName');
  }

  closeSearch(artist: Artist | undefined): void {
    this.searchbarVisible = false;
    if (artist) {
      this.getArtist(artist.name).catch((error) => {
        console.log(error);
      });
    }
  }

  openSearch(): void {
    this.searchbarVisible = true;
  }

  async getArtist(artistName: string): Promise<void> {
    this.artist = await this.lastFM
      .getArtistInfo(this.apiKeyControl.value ?? '', artistName)
      .then((artist) => {
        window.localStorage.setItem('artistName', artistName);
        return artist;
      });
  }

  private async apiKeyIsValid(): Promise<boolean> {
    return await this.lastFM.validateApiKey(this.apiKeyControl.value ?? '');
  }
}
