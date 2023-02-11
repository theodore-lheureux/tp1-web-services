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
  searchbarVisible = true;
  artist: Artist | undefined;
  artistControl = new FormControl('', [Validators.required]);
  apiKeyControl = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
  ]);

  constructor(private lastFM: LastFMService) {}

  ngOnInit(): void {
    let localKey = window.localStorage.getItem('apiKey');
    let localArtistName = window.localStorage.getItem('artistName');
    if (localKey) {
      this.lastFM.validateApiKey(localKey).then((valid) => {
        if (valid) {
          this.keySet = true;
          this.apiKeyControl.setValue(localKey);
        } else {
          window.localStorage.removeItem('apiKey');
        }
        if (localArtistName && this.keySet) {
          this.getArtist(localArtistName).catch((error) => {
            console.log(error);
          });
        }
      });
    }
  }

  setApiKey(key: string): void {
    this.apiKeyControl.markAsDirty();
    this.apiKeyControl.setValue(key);

    if (this.apiKeyControl.valid) {
      this.apiKeyIsValid().then((valid) => {
        if (valid) {
          this.apiKeyControl.setErrors(null);
          this.keySet = true;
          window.localStorage.setItem('apiKey', this.apiKeyControl.value!);
        } else {
          this.apiKeyControl.setErrors({ invalidKey: true });
        }
      });
    }
  }

  resetArtist(): void {
    this.artist = undefined;
    this.artistControl.reset();
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
    this.artistControl.markAsDirty();
    this.artistControl.setValue(artistName);

    if (this.artistControl.valid) {
      this.artist = await this.lastFM
        .getArtistInfo(this.apiKeyControl.value!, this.artistControl.value!)
        .then((artist) => {
          window.localStorage.setItem('artistName', this.artistControl.value!);
          return artist;
        })
        .catch((error) => {
          this.artistControl.setErrors({ invalidArtist: true });
          return undefined;
        });
    }
  }

  private async apiKeyIsValid(): Promise<boolean> {
    return await this.lastFM.validateApiKey(this.apiKeyControl.value!);
  }
}
