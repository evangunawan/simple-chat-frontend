import { Component, OnInit } from '@angular/core';
import { SocketClientService } from './services/socket-client.service';
import { ClientIdentifierService } from './services/client-identifier.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    public storageService: StorageService,
    private socketService: SocketClientService
  ) {}

  ngOnInit() {
    this.socketService.connect();
  }
}
