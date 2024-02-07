import { Component, OnInit } from '@angular/core';
import { SocketClientService } from './services/socket-client.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private socketService: SocketClientService) {}

  ngOnInit() {
    this.socketService.connect();
  }
}
