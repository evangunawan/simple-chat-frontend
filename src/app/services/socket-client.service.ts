import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketClientService {
  public socketConnected$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  private _client: Socket;
  private _eventSubscriptions: Map<string, Observable<any>> = new Map<
    string,
    Observable<any>
  >();

  // this application designed to have 1 room at a time.
  private _currentRoom$: BehaviorSubject<{ roomId: string; clientId: string }> =
    new BehaviorSubject<{
      roomId: string;
      clientId: string;
    }>(null);

  constructor() {}

  public get client(): Socket {
    return this._client;
  }

  public joinRoom(roomId: string, clientId: string) {
    if (this._currentRoom$.value) {
      this._client.emit('leaveroom', JSON.stringify(this._currentRoom$.value));
    }
    this._currentRoom$.next({ roomId, clientId });
  }

  public leaveRoom() {
    this._client.emit('leaveroom', JSON.stringify(this._currentRoom$.value));
    this._currentRoom$.next(null);
  }

  public connect() {
    if (this._client) return;
    this._client = io(`${environment.backendUrl}`, {
      reconnectionDelay: 5000,
    });
    this._currentRoom$.subscribe((room) => {
      if (room) {
        this._client.emit('joinroom', JSON.stringify(room));
      }
    });

    this._client.on('connect', () => {
      this.socketConnected$.next(true);
      console.log('Socket connected');
    });

    this._client.on('disconnect', () => {
      this.socketConnected$.next(false);
    });
  }

  public consume(event: string): Observable<any> {
    const curr = this._eventSubscriptions.get(event);
    if (curr) {
      return curr;
    }

    const subject = new Subject<any>();
    this._eventSubscriptions.set(event, subject);
    this._client.on(event, (message) => {
      subject.next(message);
    });
    return subject;
  }
}
