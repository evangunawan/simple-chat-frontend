import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatRoomApiService {
  constructor(private httpClient: HttpClient) {}

  public getRoomClients(roomId: string): Observable<any> {
    return this.httpClient.get(
      `${environment.backendUrl}/chat-rooms/${roomId}/clients`
    );
  }

  public generateRoomChatToken(
    roomId: string,
    clientId: string
  ): Observable<{ token: string }> {
    return this.httpClient
      .post(`${environment.backendUrl}/chat-rooms/${roomId}/chat-token`, {
        clientId,
      })
      .pipe(
        map((data: any) => {
          return data;
        })
      );
  }
}
