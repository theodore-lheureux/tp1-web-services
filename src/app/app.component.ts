import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { LastFMService } from './services/last-fm.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'tp1-web-services';
  keySet = false;
  apiKey = new FormControl('', [Validators.required, Validators.minLength(4)]);

  constructor(private lastFM: LastFMService) {}

  setApiKey(key: string): void {
    this.apiKey.markAsDirty();
    this.apiKey.setValue(key);

    if (this.apiKey.valid) {
      this.apiKeyIsValid().then((valid) => {
        if (valid) {
          this.apiKey.setErrors(null);
          this.keySet = true;
        } else {
          this.apiKey.setErrors({ invalidKey: true });
        }
      });
    }
  }

  private async apiKeyIsValid(): Promise<boolean> {
    return await this.lastFM.validateApiKey(this.apiKey.value!);
  }
}
