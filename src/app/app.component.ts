import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Artist } from './models/artist.class';
import { LastFMService } from './services/last-fm.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'tp1-web-services';
  keySet = false;
  artist: Artist | undefined;
  artistControl = new FormControl('', [Validators.required]);
  apiKeyControl = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
  ]);

  constructor(private lastFM: LastFMService) {}

  ngOnInit(): void {
    let tmp = window.localStorage.getItem('apiKey');
    if (tmp) {
      this.lastFM.validateApiKey(tmp).then((valid) => {
        if (valid) {
          this.keySet = true;
          this.apiKeyControl.setValue(tmp);
        } else {
          window.localStorage.removeItem('apiKey');
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
  }

  async getArtist(artistName: string): Promise<void> {
    this.artistControl.markAsDirty();
    this.artistControl.setValue(artistName);

    if (this.artistControl.valid) {
      this.artist = await this.lastFM.getArtistInfo(
        this.apiKeyControl.value!,
        this.artistControl.value!
      );
    }

    console.log(this.artist);
  }

  private async apiKeyIsValid(): Promise<boolean> {
    return await this.lastFM.validateApiKey(this.apiKeyControl.value!);
  }
}
