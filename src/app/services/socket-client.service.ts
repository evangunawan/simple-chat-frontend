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
  private _currentSession$: BehaviorSubject<{ token: string }> =
    new BehaviorSubject<{
      token: string;
    }>(null);

  constructor() {}

  public get client(): Socket {
    return this._client;
  }

  public joinRoom(token: string) {
    if (this._currentSession$.value) {
      this._client.emit(
        'leaveroom',
        JSON.stringify(this._currentSession$.value)
      );
    }
    this._currentSession$.next({ token });
  }

  public leaveRoom() {
    this._client.emit('leaveroom', JSON.stringify(this._currentSession$.value));
    this._currentSession$.next(null);
  }

  public connect() {
    if (this._client) return;
    this._client = io(`${environment.backendUrl}`, {
      reconnectionDelay: 5000,
    });

    this._currentSession$.subscribe((room) => {
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
