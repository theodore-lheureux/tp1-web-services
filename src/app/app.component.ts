import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Artist } from './models/artist.class';
import { LastFMService } from './services/last-fm.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'tp1-web-services';
  keySet = false;
  apiKeyControl = new FormControl('', [
    Validators.required,
    Validators.minLength(4),
  ]);
  artistControl = new FormControl('', [Validators.required]);
  artist: Artist | undefined;

  constructor(private lastFM: LastFMService) {}

  setApiKey(key: string): void {
    this.apiKeyControl.markAsDirty();
    this.apiKeyControl.setValue(key);

    if (this.apiKeyControl.valid) {
      this.apiKeyIsValid().then((valid) => {
        if (valid) {
          this.apiKeyControl.setErrors(null);
          this.keySet = true;
        } else {
          this.apiKeyControl.setErrors({ invalidKey: true });
        }
      });
    }
  }

  private async apiKeyIsValid(): Promise<boolean> {
    return await this.lastFM.validateApiKey(this.apiKeyControl.value!);
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
}
