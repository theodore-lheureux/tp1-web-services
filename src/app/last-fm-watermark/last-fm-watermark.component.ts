import { Component } from '@angular/core';

@Component({
  selector: 'app-last-fm-watermark',
  templateUrl: './last-fm-watermark.component.html',
  styleUrls: ['./last-fm-watermark.component.scss'],
})
export class LastFMWatermarkComponent {
  sendToLastFM() {
    window.open(`https://www.last.fm/`, '_blank');
  }
}
