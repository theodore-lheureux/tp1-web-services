import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AlbumComponent } from './album/album.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ArtistComponent } from './artist/artist.component';
import { LastFMWatermarkComponent } from './last-fm-watermark/last-fm-watermark.component';
import { CacheInterceptor } from './interceptors/cache-inteceptor';
import { CacheResolverService } from './services/cache-resolver.service';

@NgModule({
  declarations: [
    AppComponent,
    AlbumComponent,
    SearchbarComponent,
    ArtistComponent,
    LastFMWatermarkComponent,
  ],
  providers: [
    CacheResolverService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    FontAwesomeModule,
  ],
})
export class AppModule {}
