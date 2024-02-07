import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketClientService {
  public socketConnected$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  private _client: Socket;

  // this application designed to have 1 room at a time.
  private _currentRoom$: BehaviorSubject<string> = new BehaviorSubject<string>(
    null
  );

  constructor() {}

  public get client(): Socket {
    return this._client;
  }

  public joinRoom(roomId: string) {
    if (this._currentRoom$.value) {
      this._client.emit('leaveroom', this._currentRoom$.value);
    }
    this._currentRoom$.next(roomId);
  }

  public connect() {
    if (this._client) return;
    this._client = io(`${environment.backendUrl}`, { reconnectionDelay: 5000 });
    this._currentRoom$.subscribe((room) => {
      this._client.emit('joinroom', room);
    });

    this._client.on('connect', () => {
      this.socketConnected$.next(true);
      console.log('socket connected');
    });
  }
}
