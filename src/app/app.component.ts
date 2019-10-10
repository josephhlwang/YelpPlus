import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  search = '';
  location = '';
  postData: any;
  constructor(private httpClient: HttpClient) { }

  onLocation(event: any) {
    console.log(event.target.value);
    this.location = event.target.value;
  }

  onSearch(event: any) {
    console.log(event.target.value);
    this.search = event.target.value;
  }

  postProfile() {
    this.httpClient.post('http://138.51.87.86:1234/search', {
      search: this.search,
      location: this.location
    }
    ).subscribe((data: any) => (
      this.postData = data
    ));
  }
}
