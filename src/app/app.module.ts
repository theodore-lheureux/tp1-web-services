import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AlbumComponent } from './album/album.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ArtistComponent } from './artist/artist.component';

@NgModule({
  declarations: [AppComponent, AlbumComponent, SearchbarComponent, ArtistComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    FontAwesomeModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
