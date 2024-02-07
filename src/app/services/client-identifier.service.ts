import { Injectable } from '@angular/core';
import { v4 } from 'uuid';
import { StorageService } from './storage.service';
import { from, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClientIdentifierService {
  private _clientId: string;

  constructor(private storageService: StorageService) {}

  public get clientId() {
    return this._clientId;
  }

  public async setClientId(clientId: string) {
    if (!clientId) {
      return;
    }
    await this.storageService.setItem('client_id', clientId);
    this._clientId = clientId;
  }

  public fetchClientId() {
    return from(this.storageService.getItem('client_id'));
  }
}
